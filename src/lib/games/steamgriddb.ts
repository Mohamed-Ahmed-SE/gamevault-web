const STEAMGRIDDB_API = "https://www.steamgriddb.com/api/v2";
const STEAMGRIDDB_IMAGE_HOSTS = new Set(["cdn.steamgriddb.com", "cdn2.steamgriddb.com"]);
const CACHE_LIMIT = 256;
const REQUEST_TIMEOUT_MS = 4_000;
const POSITIVE_CACHE_TTL_MS = 21_600_000;
const NEGATIVE_CACHE_TTL_MS = 300_000;

type SteamGridGame = { id: number; name: string; verified?: boolean; release_date?: unknown };
type SteamGridImage = { url?: string; score?: number };
type SteamGridResponse<T> = { success?: boolean; data?: T };
export type SteamGridArtwork = { gridUrl: string | null; logoUrl: string | null };
type ArtworkOptions = { apiKey?: string; fetcher?: typeof fetch };

const cache = new Map<string, { expiresAt: number; promise: Promise<SteamGridArtwork> }>();
const EMPTY_ARTWORK: SteamGridArtwork = { gridUrl: null, logoUrl: null };

export function normalizeGameTitle(title: string): string {
  return title
    .replace(/[™®©]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .toLocaleLowerCase("en")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export async function getSteamGridArtwork(
  title: string,
  releaseDate: string | null,
  options: ArtworkOptions = {},
): Promise<SteamGridArtwork> {
  const apiKey = options.apiKey ?? process.env.STEAMGRIDDB_API_KEY;
  const normalizedTitle = normalizeGameTitle(title);
  if (!apiKey || !normalizedTitle) return EMPTY_ARTWORK;

  const releaseYear = releaseDate?.slice(0, 4) ?? "";
  const cacheKey = `${normalizedTitle}:${releaseYear}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;
  if (cached) cache.delete(cacheKey);

  const entry = { expiresAt: Date.now() + REQUEST_TIMEOUT_MS * 3, promise: Promise.resolve(EMPTY_ARTWORK) };
  entry.promise = lookupArtwork(title, releaseYear, apiKey, options.fetcher ?? fetch).then((artwork) => {
    entry.expiresAt = Date.now() + (artwork.gridUrl || artwork.logoUrl ? POSITIVE_CACHE_TTL_MS : NEGATIVE_CACHE_TTL_MS);
    return artwork;
  });
  cache.set(cacheKey, entry);
  const lookup = entry.promise;
  if (cache.size > CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  return lookup;
}

async function lookupArtwork(title: string, releaseYear: string, apiKey: string, fetcher: typeof fetch): Promise<SteamGridArtwork> {
  const candidates = await requestSteamGrid<SteamGridGame[]>(
    `${STEAMGRIDDB_API}/search/autocomplete/${encodeURIComponent(title)}`,
    apiKey,
    fetcher,
  );
  if (!Array.isArray(candidates)) return EMPTY_ARTWORK;
  const exactMatches = candidates.filter(
    (candidate) => candidate !== null && Number.isInteger(candidate.id) && candidate.id > 0 && typeof candidate.name === "string" && normalizeGameTitle(candidate.name) === normalizeGameTitle(title),
  );
  const selected = selectExactMatch(exactMatches, releaseYear);
  if (!selected) return EMPTY_ARTWORK;
  const [grids, logos] = await Promise.all([
    requestSteamGrid<SteamGridImage[]>(`${STEAMGRIDDB_API}/grids/game/${selected.id}?dimensions=600x900`, apiKey, fetcher),
    requestSteamGrid<SteamGridImage[]>(`${STEAMGRIDDB_API}/logos/game/${selected.id}`, apiKey, fetcher),
  ]);
  return {
    gridUrl: bestImageUrl(grids),
    logoUrl: bestImageUrl(logos),
  };
}

function selectExactMatch(matches: SteamGridGame[], releaseYear: string): SteamGridGame | null {
  if (matches.length === 1) return matches[0];
  const yearMatches = releaseYear ? matches.filter((game) => typeof game.release_date === "string" && game.release_date.slice(0, 4) === releaseYear) : [];
  const candidates = yearMatches.length > 0 ? yearMatches : matches;
  if (candidates.length === 1) return candidates[0];
  const verifiedMatches = candidates.filter((game) => game.verified);
  return verifiedMatches.length === 1 ? verifiedMatches[0] : null;
}

async function requestSteamGrid<T>(url: string, apiKey: string, fetcher: typeof fetch): Promise<T | null> {
  try {
    const response = await fetcher(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: 21_600 },
    });
    if (!response.ok) return null;
    const payload = await response.json() as SteamGridResponse<T>;
    return payload.success && payload.data !== undefined ? payload.data : null;
  } catch (cause) {
    if (cause instanceof TypeError || cause instanceof SyntaxError || cause instanceof DOMException) return null;
    throw cause;
  }
}

function bestImageUrl(images: SteamGridImage[] | null): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  return images
    .filter((image): image is SteamGridImage & { url: string } => image !== null && isSteamGridImageUrl(image.url))
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))[0]?.url ?? null;
}

function isSteamGridImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const imageUrl = new URL(value);
    return imageUrl.protocol === "https:" && STEAMGRIDDB_IMAGE_HOSTS.has(imageUrl.hostname);
  } catch {
    return false;
  }
}

export function clearSteamGridArtworkCache(): void {
  cache.clear();
}

import type { GameAchievement, GameDetails, GameImage, GameSearchResult, GameSummary, GameTrailer, SearchParams } from "./types";
import { normalizePlatform } from "./platforms";
import { getSteamGridArtwork } from "./steamgriddb";

export interface GameProvider {
  searchGames(params: SearchParams): Promise<GameSearchResult>;
  getGameSummary(idOrSlug: string): Promise<GameSummary>;
  getGame(idOrSlug: string): Promise<GameDetails>;
  getGameWithArtwork(idOrSlug: string): Promise<GameDetails>;
  getScreenshots(gameId: string): Promise<GameImage[]>;
  getTrailers(gameId: string): Promise<GameTrailer[]>;
  getAchievements(gameId: string): Promise<GameAchievement[]>;
  getSuggestedGames(gameId: string): Promise<GameSummary[]>;
  getGamesByPlatform(platformId: number, params?: SearchParams): Promise<GameSearchResult>;
}
// RAWG is an untrusted, dynamically shaped payload at this adapter boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rawg = Record<string, any>;
const nullableNumber = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;
function toSummary(raw: Rawg): GameSummary {
  return {
    id: String(raw.id), slug: String(raw.slug ?? raw.id), title: String(raw.name ?? "Untitled game"), coverUrl: raw.background_image ?? null,
    backgroundUrl: raw.background_image ?? null, logoUrl: null, releaseDate: raw.released ?? null,
    rating: nullableNumber(raw.rating), metacritic: nullableNumber(raw.metacritic),
    platforms: (raw.platforms ?? []).flatMap((p: Rawg) => p.platform ? [normalizePlatform(p.platform)] : []),
    genres: (raw.genres ?? []).map((g: Rawg) => ({ id: String(g.id), name: String(g.name), slug: String(g.slug) }))
  };
}
async function rawg<T>(path: string): Promise<T> {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY is not configured. Add it to .env.local to load catalog data.");
  const url = new URL(`https://api.rawg.io/api/${path}`); url.searchParams.set("key", key);
  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(response.status === 429 ? "Game catalog is rate limited. Please try again shortly." : `Game catalog request failed (${response.status}).`);
  return response.json() as Promise<T>;
}
export class RawgProvider implements GameProvider {
  async searchGames(params: SearchParams = {}): Promise<GameSearchResult> {
    const today = new Date().toISOString().slice(0, 10);
    const qs = new URLSearchParams({ page: String(params.page ?? 1), page_size: "24" });
    if (params.query) qs.set("search", params.query);
    if (params.platform) qs.set("platforms", params.platform);
    if (params.genre) qs.set("genres", params.genre);
    if (params.year) {
      qs.set("dates", params.year.includes(",") ? params.year : `${params.year}-01-01,${params.year}-12-31`);
    } else if (params.ordering === "-released") {
      qs.set("dates", `1970-01-01,${today}`);
    }
    if (params.minRating) qs.set("rating", `${params.minRating},5`);
    if (params.ordering) qs.set("ordering", params.ordering);
    const result = await rawg<{ results: Rawg[]; count: number }>(`games?${qs}`);
    // Filter out entries without artwork
    const valid = result.results.filter((x) => !!x.background_image).map(toSummary);
    const games = await this.enrichArtwork(valid, params.artworkLimit ?? 0);
    return { games, count: result.count, page: params.page ?? 1, pageSize: 24 };
  }
  private async enrichArtwork(games: GameSummary[], limit: number): Promise<GameSummary[]> {
    if (!process.env.STEAMGRIDDB_API_KEY || limit <= 0) return games;
    const boundedLimit = Math.min(Math.floor(limit), 8, games.length);
    const enriched = await Promise.all(games.slice(0, boundedLimit).map(async (game) => {
      const artwork = await getSteamGridArtwork(game.title, game.releaseDate);
      return { ...game, coverUrl: artwork.gridUrl ?? game.coverUrl, logoUrl: artwork.logoUrl };
    }));
    return [...enriched, ...games.slice(boundedLimit)];
  }
  async getGameSummary(idOrSlug: string): Promise<GameSummary> {
    return toSummary(await rawg<Rawg>(`games/${encodeURIComponent(idOrSlug)}`));
  }
  async getGamesByPlatform(id: number, params: SearchParams = {}) { return this.searchGames({ ...params, platform: String(id) }); }
  async getScreenshots(id: string): Promise<GameImage[]> {
    const d = await rawg<{ results: Rawg[] }>(`games/${encodeURIComponent(id)}/screenshots?page_size=20`);
    return d.results.map((x) => ({ id: String(x.id), url: x.image, source: "screenshot" as const })).filter((x) => !!x.url);
  }
  async getTrailers(id: string): Promise<GameTrailer[]> {
    const d = await rawg<{ results: Rawg[] }>(`games/${encodeURIComponent(id)}/movies`);
    return d.results.map((x) => ({ id: String(x.id), name: String(x.name ?? "Trailer"), url: x.data?.max ?? x.data?.["480"] ?? "", thumbnailUrl: x.preview ?? null })).filter((x) => !!x.url);
  }
  async getAchievements(id: string): Promise<GameAchievement[]> {
    const d = await rawg<{ results: Rawg[] }>(`games/${encodeURIComponent(id)}/achievements?page_size=30`);
    return d.results.map((x) => ({ id: String(x.id), name: String(x.name ?? "Achievement"), description: String(x.description ?? ""), iconUrl: x.image ?? null, rarity: nullableNumber(x.percent) }));
  }
  async getSuggestedGames(id: string): Promise<GameSummary[]> {
    const d = await rawg<{ results: Rawg[] }>(`games/${encodeURIComponent(id)}/suggested?page_size=12`); return d.results.map(toSummary);
  }
  async getGame(id: string): Promise<GameDetails> {
    const optional = <T,>(request: Promise<T>, fallback: T) => request.catch(() => fallback);
    const [raw, images, trailers, achievements, similar] = await Promise.all([
      rawg<Rawg>(`games/${encodeURIComponent(id)}`), optional(this.getScreenshots(id), []), optional(this.getTrailers(id), []), optional(this.getAchievements(id), []), optional(this.getSuggestedGames(id), []),
    ]);
    return {
      ...toSummary(raw), description: String(raw.description_raw ?? raw.description ?? "Details are not available."), storyline: typeof raw.storyline === "string" ? raw.storyline : null,
      developers: (raw.developers ?? []).map((x: Rawg) => x.name), publishers: (raw.publishers ?? []).map((x: Rawg) => x.name),
      tags: (raw.tags ?? []).slice(0, 12).map((x: Rawg) => x.name), website: raw.website || null, esrbRating: raw.esrb_rating?.name ?? null,
      requirements: raw.platforms?.find((p: Rawg) => p.platform?.slug === "pc")?.requirements?.minimum ?? null,
      images, trailers, achievements, similar
    };
  }
  async getGameWithArtwork(id: string): Promise<GameDetails> {
    const game = await this.getGame(id);
    const [enriched] = await this.enrichArtwork([game], 1);
    return { ...game, coverUrl: enriched.coverUrl, logoUrl: enriched.logoUrl };
  }
}
export const gameProvider: GameProvider = new RawgProvider();

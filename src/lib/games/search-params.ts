import type { SearchParams } from "./types";
export function parseSearchParams(params: URLSearchParams): SearchParams {
  const rawPage = Number(params.get("page") ?? 1), rawRating = Number(params.get("rating") ?? 0);
  return { query: params.get("q")?.trim() || undefined, platform: params.get("platform") || undefined,
    genre: params.get("genre") || undefined, year: params.get("year") || undefined,
    minRating: rawRating > 0 ? rawRating : undefined, ordering: params.get("sort") || undefined,
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1 };
}

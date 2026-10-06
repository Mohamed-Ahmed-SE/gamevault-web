import type { GameSummary } from "../games/types";
import type { GameStatus } from "../validators";

export type LibraryRecord = {
  game_id: string;
  status: GameStatus;
  playtime_minutes: number;
  created_at: string;
  updated_at: string;
};

export type LibraryEntry = {
  gameId: string;
  status: GameStatus | null;
  playtimeMinutes: number;
  createdAt: string | null;
  updatedAt: string | null;
  favorite: boolean;
  overallRating: number | null;
};

export type LibraryFilters = {
  status: string;
  query: string;
  platform: string;
  genre: string;
  sort: "recently_added" | "recently_updated" | "personal_rating" | "release_date" | "alphabetical";
};

export function buildLibraryEntries(
  records: LibraryRecord[],
  favoriteIds: string[],
  ratings: { game_id: string; overall: number | null }[],
): LibraryEntry[] {
  const recordsByGame = new Map(records.map((record) => [record.game_id, record]));
  const ratingsByGame = new Map(ratings.map((rating) => [rating.game_id, rating.overall]));
  const gameIds = new Set([...recordsByGame.keys(), ...favoriteIds]);

  return [...gameIds].map((gameId) => {
    const record = recordsByGame.get(gameId);
    return {
      gameId,
      status: record?.status ?? null,
      playtimeMinutes: record?.playtime_minutes ?? 0,
      createdAt: record?.created_at ?? null,
      updatedAt: record?.updated_at ?? null,
      favorite: favoriteIds.includes(gameId),
      overallRating: ratingsByGame.get(gameId) ?? null,
    };
  });
}

export function formatPlaytimeMinutes(minutes: number): string {
  return minutes < 60 ? `${minutes}m played` : `${(minutes / 60).toFixed(1)}h played`;
}

export function filterLibraryEntries(
  entries: LibraryEntry[],
  catalog: Record<string, GameSummary>,
  filters: LibraryFilters,
): LibraryEntry[] {
  const filtered = entries.filter((entry) => {
    const game = catalog[entry.gameId];
    const matchesStatus = filters.status === "all"
      ? entry.status !== null
      : filters.status === "favorites" ? entry.favorite : entry.status === filters.status;
    const normalizedQuery = filters.query.trim().toLocaleLowerCase();
    const matchesQuery = game
      ? game.title.toLocaleLowerCase().includes(normalizedQuery)
      : normalizedQuery.length === 0;
    const matchesPlatform = !filters.platform || game?.platforms.some((platform) => platform.slug === filters.platform) === true;
    const matchesGenre = !filters.genre || game?.genres.some((genre) => genre.slug === filters.genre) === true;
    return matchesStatus && matchesQuery && matchesPlatform && matchesGenre;
  });

  return filtered.sort((left, right) => compareEntries(left, right, catalog, filters.sort));
}

function compareEntries(
  left: LibraryEntry,
  right: LibraryEntry,
  catalog: Record<string, GameSummary>,
  sort: LibraryFilters["sort"],
): number {
  if (sort === "personal_rating") return (right.overallRating ?? 0) - (left.overallRating ?? 0);
  if (sort === "release_date") return (catalog[right.gameId]?.releaseDate ?? "").localeCompare(catalog[left.gameId]?.releaseDate ?? "");
  if (sort === "alphabetical") return (catalog[left.gameId]?.title ?? "").localeCompare(catalog[right.gameId]?.title ?? "");
  if (sort === "recently_added") return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
  return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
}

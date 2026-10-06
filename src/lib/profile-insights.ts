import type { GameSummary } from "./games/types";
import type { GameStatus } from "./validators";

export type ProfileGameRecord = {
  game_id: string;
  status: GameStatus;
  created_at: string;
  updated_at: string;
};

type Count = { name: string; count: number };
type RecentActivity = {
  gameId: string;
  title: string | null;
  status: GameStatus;
  happenedAt: string;
  kind: "added" | "updated";
};

export type ProfileInsights = {
  genres: Count[];
  platforms: Count[];
  recentActivity: RecentActivity[];
  missingCatalogCount: number;
};

export function buildProfileInsights(
  records: ProfileGameRecord[],
  catalog: Record<string, GameSummary>,
  activityLimit = 8,
): ProfileInsights {
  const genreCounts = new Map<string, Count>();
  const platformCounts = new Map<string, Count>();
  let missingCatalogCount = 0;

  for (const record of records) {
    const game = catalog[record.game_id];
    if (!game) {
      missingCatalogCount += 1;
      continue;
    }
    for (const genre of game.genres) incrementCount(genreCounts, genre.slug, genre.name);
    for (const platform of game.platforms) incrementCount(platformCounts, platform.slug, platform.name);
  }

  const recentActivity = [...records]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, activityLimit)
    .map((record) => ({
      gameId: record.game_id,
      title: catalog[record.game_id]?.title ?? null,
      status: record.status,
      happenedAt: record.updated_at,
      kind: record.created_at === record.updated_at ? "added" as const : "updated" as const,
    }));

  return {
    genres: [...genreCounts.values()].sort(compareCounts),
    platforms: [...platformCounts.values()].sort(compareCounts),
    recentActivity,
    missingCatalogCount,
  };
}

function incrementCount(counts: Map<string, Count>, key: string, name: string) {
  const current = counts.get(key);
  if (current) current.count += 1;
  else counts.set(key, { name, count: 1 });
}

function compareCounts(left: Count, right: Count) {
  return right.count - left.count || left.name.localeCompare(right.name);
}

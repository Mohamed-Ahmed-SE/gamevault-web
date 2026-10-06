import { describe, expect, it } from "vitest";
import type { GameSummary } from "./games/types";
import { buildProfileInsights, type ProfileGameRecord } from "./profile-insights";

const catalog: Record<string, GameSummary> = {
  "game-1": { id: "game-1", slug: "one", title: "One", coverUrl: null, backgroundUrl: null, releaseDate: null, rating: null, metacritic: null, platforms: [{ id: "1", slug: "pc", name: "PC" }], genres: [{ id: "1", slug: "rpg", name: "RPG" }, { id: "2", slug: "adventure", name: "Adventure" }] },
  "game-2": { id: "game-2", slug: "two", title: "Two", coverUrl: null, backgroundUrl: null, releaseDate: null, rating: null, metacritic: null, platforms: [{ id: "1", slug: "pc", name: "PC" }, { id: "2", slug: "switch", name: "Nintendo Switch" }], genres: [{ id: "2", slug: "adventure", name: "Adventure" }] },
};

const records: ProfileGameRecord[] = [
  { game_id: "game-1", status: "playing", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-02T00:00:00Z" },
  { game_id: "game-2", status: "completed", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-03T00:00:00Z" },
  { game_id: "missing", status: "backlog", created_at: "2025-01-04T00:00:00Z", updated_at: "2025-01-04T00:00:00Z" },
];

describe("private profile insights", () => {
  it("counts catalog genres and platforms while keeping newest owner activity first", () => {
    const insights = buildProfileInsights(records, catalog);

    expect(insights.genres).toEqual([{ name: "Adventure", count: 2 }, { name: "RPG", count: 1 }]);
    expect(insights.platforms).toEqual([{ name: "PC", count: 2 }, { name: "Nintendo Switch", count: 1 }]);
    expect(insights.recentActivity.map(({ gameId, kind }) => [gameId, kind])).toEqual([
      ["missing", "added"], ["game-2", "updated"], ["game-1", "updated"],
    ]);
    expect(insights.recentActivity[0].title).toBeNull();
    expect(insights.missingCatalogCount).toBe(1);
  });

  it("returns empty summaries for an owner with no tracked games", () => {
    expect(buildProfileInsights([], {})).toEqual({ genres: [], platforms: [], recentActivity: [], missingCatalogCount: 0 });
  });
});

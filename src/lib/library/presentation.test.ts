import { describe, expect, it } from "vitest";
import { buildLibraryEntries, filterLibraryEntries, formatPlaytimeMinutes, type LibraryFilters } from "./presentation";
import type { GameSummary } from "../games/types";

const catalog: Record<string, GameSummary> = {
  "game-1": { id: "game-1", slug: "one", title: "One", coverUrl: null, backgroundUrl: null, releaseDate: "2020-01-01", rating: 4, metacritic: null, platforms: [{ id: "15", slug: "ps2", name: "PlayStation 2" }], genres: [{ id: "1", name: "Adventure", slug: "adventure" }] },
  "game-2": { id: "game-2", slug: "two", title: "Two", coverUrl: null, backgroundUrl: null, releaseDate: "2022-01-01", rating: 4, metacritic: null, platforms: [{ id: "16", slug: "ps3", name: "PlayStation 3" }], genres: [{ id: "2", name: "RPG", slug: "rpg" }] },
};
const filters: LibraryFilters = { status: "all", query: "", platform: "", genre: "", sort: "recently_updated" };

describe("personal library browsing", () => {
  it("includes favorite-only games without inventing a library status", () => {
    const entries = buildLibraryEntries([
      { game_id: "game-1", status: "playing", playtime_minutes: 60, created_at: "2024-01-01", updated_at: "2024-02-01" },
    ], ["game-2"], []);

    expect(entries.find((entry) => entry.gameId === "game-2")).toMatchObject({ favorite: true, status: null, playtimeMinutes: 0 });
    expect(filterLibraryEntries(entries, catalog, filters).map((entry) => entry.gameId)).toEqual(["game-1"]);
    expect(filterLibraryEntries(entries, catalog, { ...filters, status: "favorites" }).map((entry) => entry.gameId)).toEqual(["game-2"]);
  });

  it("combines platform and genre filters and sorts by personal rating", () => {
    const entries = buildLibraryEntries([
      { game_id: "game-1", status: "completed", playtime_minutes: 120, created_at: "2024-01-01", updated_at: "2024-02-01" },
      { game_id: "game-2", status: "completed", playtime_minutes: 180, created_at: "2024-01-01", updated_at: "2024-02-01" },
    ], [], [
      { game_id: "game-1", overall: 7 },
      { game_id: "game-2", overall: 9 },
    ]);

    expect(filterLibraryEntries(entries, catalog, { ...filters, platform: "ps3", genre: "rpg", sort: "personal_rating" }).map((entry) => entry.gameId)).toEqual(["game-2"]);
    expect(filterLibraryEntries(entries, catalog, { ...filters, sort: "personal_rating" }).map((entry) => entry.gameId)).toEqual(["game-2", "game-1"]);
  });

  it("keeps saved records visible when catalog details cannot be loaded", () => {
    const entries = buildLibraryEntries([
      { game_id: "missing-game", status: "playing", playtime_minutes: 90, created_at: "2024-01-01", updated_at: "2024-02-01" },
    ], [], []);

    expect(filterLibraryEntries(entries, catalog, filters).map((entry) => entry.gameId)).toEqual(["missing-game"]);
    expect(filterLibraryEntries(entries, catalog, { ...filters, query: "unknown title" })).toEqual([]);
    expect(filterLibraryEntries(entries, catalog, { ...filters, platform: "ps2" })).toEqual([]);
  });
});

describe("library playtime labels", () => {
  it.each([
    { minutes: 0, label: "0m played" },
    { minutes: 59, label: "59m played" },
    { minutes: 60, label: "1.0h played" },
    { minutes: 90, label: "1.5h played" },
  ])("formats $minutes minutes as $label", ({ minutes, label }) => {
    expect(formatPlaytimeMinutes(minutes)).toBe(label);
  });
});

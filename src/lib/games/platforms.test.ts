import { describe, expect, it } from "vitest";
import { normalizePlatform, platformId, PLATFORMS } from "./platforms";
import { parseSearchParams } from "./search-params";
import { statusSchema, libraryMutationSchema } from "../validators";
import { collectXpEvents } from "../library/xp-events";

describe("canonical platform map", () => {
  it("keeps PlayStation 2 and PlayStation 3 explicit", () => {
    expect(platformId("ps2")).toBe(15);
    expect(platformId("ps3")).toBe(16);
    expect(PLATFORMS.ps2.name).toBe("PlayStation 2");
    expect(PLATFORMS.ps3.name).toBe("PlayStation 3");
  });

  it("normalizes provider PlayStation names", () => {
    expect(normalizePlatform({ id: 16, slug: "playstation-3", name: "PlayStation 3" }).slug).toBe("ps3");
  });
});

describe("query and user-input validation", () => {
  it("parses shareable filters, preserves requested pages, and defaults invalid pages", () => {
    expect(parseSearchParams(new URLSearchParams("q=zelda&platform=ps2&genre=adventure&page=-2")).page).toBe(1);
    expect(parseSearchParams(new URLSearchParams("page=3")).page).toBe(3);
    expect(parseSearchParams(new URLSearchParams("platform=ps3")).platform).toBe("ps3");
  });

  it("accepts only the six documented statuses", () => {
    expect(statusSchema.safeParse("completed").success).toBe(true);
    expect(statusSchema.safeParse("completed_100").success).toBe(false);
  });

  it("rejects ratings outside 1–10", () => {
    const request = { gameId: "123", ratings: { gameplay: 11, story: null, graphics: null, sound: null, overall: null } };
    expect(libraryMutationSchema.safeParse(request).success).toBe(false);
  });

  it.each(["2024-02-30", "2024-2-03", "not-a-date"])("rejects invalid calendar date %s", (date) => {
    expect(libraryMutationSchema.safeParse({ gameId: "123", startedAt: date }).success).toBe(false);
  });

  it("accepts independently selected rating fields and nullable dates", () => {
    const request = { gameId: "123", startedAt: "2024-02-29", completedAt: null, ratings: { gameplay: 8, story: null, graphics: null, sound: null, overall: null } };
    expect(libraryMutationSchema.safeParse(request).success).toBe(true);
  });

  it("allows clearing every nullable rating field", () => {
    const request = { gameId: "123", ratings: { gameplay: null, story: null, graphics: null, sound: null, overall: null } };
    expect(libraryMutationSchema.safeParse(request).success).toBe(true);
  });
});

describe("library XP events", () => {
  it("awards distinct first actions for a new game", () => {
    const input = libraryMutationSchema.parse({ gameId: "123", status: "playing", favorite: true, ratings: { gameplay: 8, story: null, graphics: null, sound: null, overall: null } });
    expect(collectXpEvents(input, { game: null, favorite: null, rating: null })).toEqual([
      { type: "library_added", amount: 10 },
      { type: "first_playing", amount: 15 },
      { type: "first_favorite", amount: 5 },
      { type: "first_rating", amount: 10 },
    ]);
  });

  it("does not award repeat status or rating events", () => {
    const input = libraryMutationSchema.parse({ gameId: "123", status: "playing", ratings: { gameplay: 9, story: null, graphics: null, sound: null, overall: null } });
    expect(collectXpEvents(input, {
      game: { status: "playing" },
      favorite: { id: "favorite-1" },
      rating: { id: "rating-1" },
    })).toEqual([]);
  });

  it("does not award a first-rating event when clearing the last score", () => {
    const input = libraryMutationSchema.parse({ gameId: "123", ratings: { gameplay: null, story: null, graphics: null, sound: null, overall: null } });
    expect(collectXpEvents(input, { game: { status: "playing" }, favorite: null, rating: null })).toEqual([]);
  });
});

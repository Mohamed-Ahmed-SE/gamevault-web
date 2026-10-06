import { describe, expect, it } from "vitest";
import { parseLibrarySnapshot } from "./snapshot";

describe("library snapshots", () => {
  it.each([
    [{ game: null, favorite: false }, { saved: false, favorite: false }],
    [{ game: { id: 42 }, favorite: true }, { saved: true, favorite: true }],
  ])("preserves saved and favorite state for %o", (payload, expected) => {
    expect(parseLibrarySnapshot(payload)).toEqual(expected);
  });

  it.each([
    {},
    { game: null, favorite: "true" },
    { game: false, favorite: false },
    { game: [], favorite: false },
  ])("rejects malformed responses instead of treating them as unsaved: %o", (payload) => {
    expect(() => parseLibrarySnapshot(payload)).toThrow("The library returned an invalid game state.");
  });
});

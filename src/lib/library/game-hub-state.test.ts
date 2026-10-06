import { describe, expect, it } from "vitest";
import { loadGameHubState } from "./game-hub-state";

const ratings = { gameplay: 8, story: 7, graphics: 9, sound: 6, overall: 8 };

describe("game hub library state", () => {
  it.each([
    {
      scenario: "a saved owner entry",
      payload: { game: { status: "playing", playtime_minutes: 135 }, favorite: true, ratings },
      expected: { saved: true, status: "playing", playtimeMinutes: 135, favorite: true, ratings },
    },
    {
      scenario: "a removed game with independently returned private fields",
      payload: { game: null, favorite: true, ratings },
      expected: { saved: false, status: "want_to_play", playtimeMinutes: 0, favorite: true, ratings },
    },
  ])("reloads the complete state for $scenario", async ({ payload, expected }) => {
    const requestedUrls: Array<RequestInfo | URL> = [];
    const request: typeof fetch = async (input) => {
      requestedUrls.push(input);
      return new Response(JSON.stringify(payload), { status: 200 });
    };

    await expect(loadGameHubState("game id/42", request)).resolves.toEqual(expected);
    expect(requestedUrls).toEqual(["/api/library?gameId=game%20id%2F42"]);
  });

  it("surfaces owner-library API errors instead of treating them as an empty entry", async () => {
    const request: typeof fetch = async () =>
      new Response(JSON.stringify({ error: "Sign in required." }), { status: 401 });

    await expect(loadGameHubState("42", request)).rejects.toThrow("Sign in required.");
  });
});

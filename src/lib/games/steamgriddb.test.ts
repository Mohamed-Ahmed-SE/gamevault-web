import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSteamGridArtworkCache, getSteamGridArtwork, normalizeGameTitle } from "./steamgriddb";

afterEach(() => {
  clearSteamGridArtworkCache();
  vi.restoreAllMocks();
});

describe("SteamGridDB artwork adapter", () => {
  it("normalizes accents and punctuation for exact-name comparisons", () => {
    expect(normalizeGameTitle("Pokémon™: Let's Go!")).toBe("pokemon lets go");
  });

  it("does not make requests when the optional key is missing", async () => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(getSteamGridArtwork("A game", null, { apiKey: "", fetcher })).resolves.toEqual({ gridUrl: null, logoUrl: null });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("only uses exact title matches and trusted SteamGridDB image hosts", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: 1, name: "The Wrong Game" }, { id: 2, name: "Game: Deluxe Edition" }] }));

    await expect(getSteamGridArtwork("Game", null, { apiKey: "test-key", fetcher })).resolves.toEqual({ gridUrl: null, logoUrl: null });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("avoids choosing among ambiguous exact-name matches", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: 10, name: "Game", verified: true }, { id: 11, name: "Game", verified: true }] }));

    await expect(getSteamGridArtwork("Game", null, { apiKey: "test-key", fetcher })).resolves.toEqual({ gridUrl: null, logoUrl: null });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("deduplicates cached requests and returns portrait grids and transparent logos", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: 42, name: "Game: Remastered", verified: true }, { id: 43, name: "Game Remastered" }] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ url: "https://cdn2.steamgriddb.com/grid/portrait.webp", score: 80 }] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ url: "https://images.example.com/logo.png", score: 100 }, { url: "https://cdn.steamgriddb.com/logo/wordmark.png", score: 90 }] }));

    const [first, second] = await Promise.all([
      getSteamGridArtwork("Game Remastered", "2024-01-01", { apiKey: "test-key", fetcher }),
      getSteamGridArtwork("Game Remastered", "2024-01-01", { apiKey: "test-key", fetcher }),
    ]);

    expect(first).toEqual({
      gridUrl: "https://cdn2.steamgriddb.com/grid/portrait.webp",
      logoUrl: "https://cdn.steamgriddb.com/logo/wordmark.png",
    });
    expect(second).toEqual(first);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

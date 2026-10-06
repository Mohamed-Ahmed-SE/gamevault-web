import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameDetails } from "@/lib/games/types";
import { POST } from "./route";

const boundaries = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), getGame: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: boundaries.getUser }, rpc: boundaries.rpc }),
}));
vi.mock("@/lib/games/provider", () => ({
  gameProvider: { getGame: boundaries.getGame },
}));

const catalogGame: GameDetails = {
  id: "42", slug: "test-game", title: "Test Game", coverUrl: null, backgroundUrl: null,
  releaseDate: null, rating: null, metacritic: null, platforms: [], genres: [],
  description: "", storyline: null, developers: [], publishers: [], tags: [], website: null,
  esrbRating: null, requirements: null, images: [], trailers: [], achievements: [], similar: [],
};

function mutationRequest() {
  return new Request("http://localhost/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId: "test-game", status: "playing", favorite: true, playtimeMinutes: 90 }),
  });
}

describe("atomic library mutation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boundaries.getUser.mockResolvedValue({ data: { user: { id: "owner-id" } } });
    boundaries.getGame.mockResolvedValue(catalogGame);
    boundaries.rpc.mockResolvedValue({ error: null });
  });

  it("saves the authenticated user's validated mutation using the canonical catalog id", async () => {
    const response = await POST(mutationRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(boundaries.rpc).toHaveBeenCalledWith("save_library_mutation", {
      p_mutation: { gameId: "42", provider: "rawg", status: "playing", favorite: true, playtimeMinutes: 90 },
    });
  });

  it("does not report success when the atomic database operation fails", async () => {
    boundaries.rpc.mockResolvedValue({ error: { message: "transaction failed" } });

    const response = await POST(mutationRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "transaction failed" });
  });
});

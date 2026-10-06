import { z } from "zod";
import { statusSchema } from "@/lib/validators";

const ratingSchema = z.number().min(1).max(10).nullable();
const ratingsSchema = z.object({
  gameplay: ratingSchema,
  story: ratingSchema,
  graphics: ratingSchema,
  sound: ratingSchema,
  overall: ratingSchema,
});
const gameSchema = z.object({
  status: statusSchema,
  playtime_minutes: z.number().int().min(0),
});
const libraryStateSchema = z.object({
  game: gameSchema.nullable(),
  favorite: z.boolean(),
  ratings: ratingsSchema.nullable(),
});

export type GameHubLibraryState = {
  saved: boolean;
  status: z.infer<typeof statusSchema>;
  playtimeMinutes: number;
  favorite: boolean;
  ratings: z.infer<typeof ratingsSchema>;
};

const emptyRatings: GameHubLibraryState["ratings"] = {
  gameplay: null,
  story: null,
  graphics: null,
  sound: null,
  overall: null,
};

function libraryErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return "Could not load your library entry.";
}

function mapLibraryState({ game, favorite, ratings }: z.infer<typeof libraryStateSchema>): GameHubLibraryState {
  return {
    saved: game !== null,
    status: game?.status ?? "want_to_play",
    playtimeMinutes: game?.playtime_minutes ?? 0,
    favorite,
    ratings: ratings ?? emptyRatings,
  };
}

export async function loadGameHubState(gameId: string, request: typeof fetch = fetch): Promise<GameHubLibraryState> {
  const response = await request(`/api/library?gameId=${encodeURIComponent(gameId)}`);
  const payload: unknown = await response.json();
  if (!response.ok) throw new Error(libraryErrorMessage(payload));

  const parsed = libraryStateSchema.safeParse(payload);
  if (!parsed.success) throw new TypeError("The library returned an invalid game state.");
  return mapLibraryState(parsed.data);
}

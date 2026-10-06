import { libraryMutationSchema } from "../validators";

type PreviousGame = { status: string } | null;
type PreviousRecord = { id: string } | null;
export type XpEvent = { type: string; amount: number };

type PreviousRecords = {
  game: PreviousGame;
  favorite: PreviousRecord;
  rating: PreviousRecord;
};

export function collectXpEvents(input: LibraryInput, previous: PreviousRecords): XpEvent[] {
  const events: XpEvent[] = [];
  if (!previous.game) events.push({ type: "library_added", amount: 10 });
  if (input.status === "playing" && previous.game?.status !== "playing") events.push({ type: "first_playing", amount: 15 });
  if (input.status === "completed" && previous.game?.status !== "completed") events.push({ type: "first_completed", amount: 30 });
  if (input.favorite && !previous.favorite) events.push({ type: "first_favorite", amount: 5 });
  if (hasSubmittedRating(input) && !previous.rating) events.push({ type: "first_rating", amount: 10 });
  return events;
}

function hasSubmittedRating(input: LibraryInput): boolean {
  return input.ratings !== undefined && Object.values(input.ratings).some((rating) => rating !== null);
}

export type LibraryInput = ReturnType<typeof libraryMutationSchema.parse>;

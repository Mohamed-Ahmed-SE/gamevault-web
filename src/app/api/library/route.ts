import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gameProvider } from "@/lib/games/provider";
import { libraryMutationSchema } from "@/lib/validators";

type UserSupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type LibraryInput = ReturnType<typeof libraryMutationSchema.parse>;
type XpEvent = { type: string; amount: number };
type PreviousGame = { id: string; status: string } | null;
type PreviousRecord = { id: string } | null;

export async function GET(request: Request) {
  const context = await authenticateUser();
  if ("response" in context) return context.response;
  const gameId = new URL(request.url).searchParams.get("gameId");
  if (!gameId) return NextResponse.json({ error: "gameId is required." }, { status: 400 });
  const [game, favorite, ratings] = await Promise.all([
    context.supabase.from("user_games").select("*").eq("user_id", context.user.id).eq("game_id", gameId).maybeSingle(),
    context.supabase.from("favorite_games").select("id").eq("user_id", context.user.id).eq("game_id", gameId).maybeSingle(),
    context.supabase.from("game_ratings").select("gameplay,story,graphics,sound,overall").eq("user_id", context.user.id).eq("game_id", gameId).maybeSingle(),
  ]);
  const queryError = game.error ?? favorite.error ?? ratings.error;
  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });
  return NextResponse.json({ game: game.data, favorite: !!favorite.data, ratings: ratings.data });
}

export async function POST(request: Request) {
  const context = await authenticateUser();
  if ("response" in context) return context.response;
  const input = await parseMutationRequest(request);
  if (input instanceof NextResponse) return input;
  return saveLibraryMutation({ context, input });
}

async function authenticateUser() {
  const supabase = await createClient();
  if (!supabase) return { response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  return { supabase, user };
}

type AuthenticatedContext = Extract<Awaited<ReturnType<typeof authenticateUser>>, { supabase: UserSupabaseClient }>;

async function parseMutationRequest(request: Request): Promise<LibraryInput | NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    throw error;
  }
  const parsed = libraryMutationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid game data.", issues: parsed.error.flatten() }, { status: 400 });
  return parsed.data;
}

async function saveLibraryMutation({ context, input }: { context: AuthenticatedContext; input: LibraryInput }) {
  const catalogId = await resolveCatalogId(input.gameId);
  if (catalogId instanceof NextResponse) return catalogId;
  const previous = await readPreviousRecords(context.supabase, context.user.id, input.provider ?? "rawg", catalogId);
  if (previous instanceof NextResponse) return previous;
  const events = collectXpEvents(input, previous.game, previous.favorite, previous.rating);
  const admin = events.length ? createAdminClient() : null;
  if (events.length && !admin) return NextResponse.json({ error: "XP updates need the server-only Supabase service key." }, { status: 503 });
  const saveError = await persistLibraryChanges({ context, input, catalogId, previousGame: previous.game });
  if (saveError) return NextResponse.json({ error: saveError }, { status: 500 });
  const xpWarning = await awardXp(admin, context.user.id, catalogId, events);
  return NextResponse.json({ ok: true, ...(xpWarning ? { xpWarning } : {}) });
}

async function resolveCatalogId(gameId: string): Promise<string | NextResponse> {
  try {
    return (await gameProvider.getGame(gameId)).id;
  } catch (error) {
    if (error instanceof Error) return NextResponse.json({ error: "The live catalog is unavailable; the game was not saved." }, { status: 503 });
    throw error;
  }
}

async function readPreviousRecords(supabase: UserSupabaseClient, userId: string, provider: string, gameId: string) {
  const [game, favorite, rating] = await Promise.all([
    supabase.from("user_games").select("id,status").eq("user_id", userId).eq("provider", provider).eq("game_id", gameId).maybeSingle(),
    supabase.from("favorite_games").select("id").eq("user_id", userId).eq("provider", provider).eq("game_id", gameId).maybeSingle(),
    supabase.from("game_ratings").select("id").eq("user_id", userId).eq("provider", provider).eq("game_id", gameId).maybeSingle(),
  ]);
  const error = game.error ?? favorite.error ?? rating.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return { game: game.data, favorite: favorite.data, rating: rating.data };
}

function collectXpEvents(input: LibraryInput, game: PreviousGame, favorite: PreviousRecord, rating: PreviousRecord): XpEvent[] {
  const events: XpEvent[] = [];
  if (!game) events.push({ type: "library_added", amount: 10 });
  if (input.status === "playing" && game?.status !== "playing") events.push({ type: "first_playing", amount: 15 });
  if (input.status === "completed" && game?.status !== "completed") events.push({ type: "first_completed", amount: 30 });
  if (input.favorite && !favorite) events.push({ type: "first_favorite", amount: 5 });
  if (input.ratings && !rating) events.push({ type: "first_rating", amount: 10 });
  return events;
}

async function persistLibraryChanges({ context, input, catalogId, previousGame }: { context: AuthenticatedContext; input: LibraryInput; catalogId: string; previousGame: PreviousGame }) {
  const provider = input.provider ?? "rawg";
  const gameError = await saveGameRecord({ supabase: context.supabase, userId: context.user.id, provider, catalogId, input, previousGame });
  if (gameError) return gameError;
  const favoriteError = await saveFavorite({ supabase: context.supabase, userId: context.user.id, provider, gameId: catalogId, favorite: input.favorite });
  if (favoriteError) return favoriteError;
  return saveRatings({ supabase: context.supabase, userId: context.user.id, provider, gameId: catalogId, ratings: input.ratings });
}

async function saveGameRecord({ supabase, userId, provider, catalogId, input, previousGame }: { supabase: UserSupabaseClient; userId: string; provider: string; catalogId: string; input: LibraryInput; previousGame: PreviousGame }) {
  const update: Record<string, unknown> = { user_id: userId, provider, game_id: catalogId, updated_at: new Date().toISOString() };
  if (input.status) update.status = input.status;
  else if (!previousGame) update.status = "want_to_play";
  if (input.playtimeMinutes !== undefined) update.playtime_minutes = input.playtimeMinutes;
  if (input.startedAt !== undefined) update.started_at = input.startedAt;
  if (input.completedAt !== undefined) update.completed_at = input.completedAt;
  if (input.notes !== undefined) update.notes = input.notes;
  const { error } = await supabase.from("user_games").upsert(update, { onConflict: "user_id,provider,game_id" });
  return error?.message ?? null;
}

async function saveFavorite({ supabase, userId, provider, gameId, favorite }: { supabase: UserSupabaseClient; userId: string; provider: string; gameId: string; favorite?: boolean }) {
  if (favorite === undefined) return null;
  if (!favorite) {
    const { error } = await supabase.from("favorite_games").delete().eq("user_id", userId).eq("provider", provider).eq("game_id", gameId);
    return error?.message ?? null;
  }
  const { error } = await supabase.from("favorite_games").upsert({ user_id: userId, provider, game_id: gameId }, { onConflict: "user_id,provider,game_id", ignoreDuplicates: true });
  return error?.message ?? null;
}

async function saveRatings({ supabase, userId, provider, gameId, ratings }: { supabase: UserSupabaseClient; userId: string; provider: string; gameId: string; ratings?: LibraryInput["ratings"] }) {
  if (!ratings) return null;
  const { error } = await supabase.from("game_ratings").upsert({ user_id: userId, provider, game_id: gameId, ...ratings, updated_at: new Date().toISOString() }, { onConflict: "user_id,provider,game_id" });
  return error?.message ?? null;
}

async function awardXp(admin: ReturnType<typeof createAdminClient>, userId: string, gameId: string, events: XpEvent[]) {
  if (!admin) return null;
  for (const event of events) {
    const { error } = await admin.rpc("award_game_xp", { p_user_id: userId, p_game_id: gameId, p_event_type: event.type, p_amount: event.amount });
    if (error) return "Your game data was saved, but XP could not be updated.";
  }
  return null;
}

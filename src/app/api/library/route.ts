import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gameProvider } from "@/lib/games/provider";
import { libraryMutationSchema } from "@/lib/validators";

type UserSupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type AuthenticatedUser = NonNullable<Awaited<ReturnType<UserSupabaseClient["auth"]["getUser"]>>["data"]["user"]>;
type AuthenticatedContext = { supabase: UserSupabaseClient; user: AuthenticatedUser };
type AuthenticationResult = AuthenticatedContext | { response: NextResponse };
type LibraryMutation = ReturnType<typeof libraryMutationSchema.parse>;

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

export async function POST(request: Request): Promise<NextResponse> {
  const context = await authenticateUser();
  if ("response" in context) return context.response;
  const input = await parseMutationRequest(request);
  if (input instanceof NextResponse) return input;
  return saveLibraryMutation(context.supabase, input);
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const context = await authenticateUser();
  if ("response" in context) return context.response;
  const gameId = await parseDeleteRequest(request);
  if (gameId instanceof NextResponse) return gameId;

  const { error } = await context.supabase
    .from("user_games")
    .delete()
    .eq("user_id", context.user.id)
    .eq("provider", "rawg")
    .eq("game_id", gameId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

async function authenticateUser(): Promise<AuthenticationResult> {
  const supabase = await createClient();
  if (!supabase) return { response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  return { supabase, user };
}


async function parseRequestBody(request: Request): Promise<unknown | NextResponse> {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    throw error;
  }
}

async function parseMutationRequest(request: Request): Promise<LibraryMutation | NextResponse> {
  const requestBody = await parseRequestBody(request);
  if (requestBody instanceof NextResponse) return requestBody;
  const parsed = libraryMutationSchema.safeParse(requestBody);
  if (!parsed.success) return NextResponse.json({ error: "Invalid game data.", issues: parsed.error.flatten() }, { status: 400 });
  return parsed.data;
}

async function parseDeleteRequest(request: Request): Promise<string | NextResponse> {
  const requestBody = await parseRequestBody(request);
  if (requestBody instanceof NextResponse) return requestBody;
  const parsed = libraryMutationSchema.pick({ gameId: true }).safeParse(requestBody);
  if (!parsed.success || !/^[0-9]+$/.test(parsed.data.gameId)) {
    return NextResponse.json({ error: "A valid game id is required." }, { status: 400 });
  }
  return parsed.data.gameId;
}

async function saveLibraryMutation(supabase: UserSupabaseClient, input: LibraryMutation) {
  const catalogId = await resolveCatalogId(input.gameId);
  if (catalogId instanceof NextResponse) return catalogId;
  const { error } = await supabase.rpc("save_library_mutation", {
    p_mutation: { ...input, gameId: catalogId },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

async function resolveCatalogId(gameId: string): Promise<string | NextResponse> {
  try {
    return (await gameProvider.getGame(gameId)).id;
  } catch (error) {
    if (error instanceof Error) return NextResponse.json({ error: "The live catalog is unavailable; the game was not saved." }, { status: 503 });
    throw error;
  }
}

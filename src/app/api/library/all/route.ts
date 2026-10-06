import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const [games, favorites, ratings, profile] = await Promise.all([
    supabase.from("user_games").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("favorite_games").select("game_id").eq("user_id", user.id),
    supabase.from("game_ratings").select("game_id,overall").eq("user_id", user.id).order("overall", { ascending: false, nullsFirst: false }),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  const queryError = games.error ?? favorites.error ?? ratings.error ?? profile.error;
  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

  return NextResponse.json({
    games: games.data ?? [],
    favorites: (favorites.data ?? []).map((favorite) => favorite.game_id),
    ratings: ratings.data ?? [],
    profile: profile.data,
  });
}

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { gameProvider } from "@/lib/games/provider";
import { PLATFORMS } from "@/lib/games/platforms";
import type { GameSearchResult, GameSummary } from "@/lib/games/types";
import { GameRail } from "@/components/game-rail";
import { HomeHeroActions } from "@/components/home-hero-actions";

export const revalidate = 1800;

type UserSupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type PersonalShelves = {
  playing: GameSummary[];
  backlog: GameSummary[];
  favorites: GameSummary[];
  topRated: GameSummary[];
};
type PersonalResult = { shelves: PersonalShelves; unavailable: boolean };
type ShelfRecords = { playing: { game_id: string }[]; backlog: { game_id: string }[]; favorites: { game_id: string }[]; ratings: { game_id: string }[] };
const emptyShelves: PersonalShelves = { playing: [], backlog: [], favorites: [], topRated: [] };

export default async function HomePage() {
  const endDate = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const [trending, released, ps2, ps3, pc, switchGames, xbox, upcoming] = await Promise.all([
    searchCatalog({ ordering: "-added", page: 1 }),
    searchCatalog({ ordering: "-released", page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS.ps2.rawgId), page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS.ps3.rawgId), page: 1 }),
    searchCatalog({ ordering: "-rating", platform: String(PLATFORMS.pc.rawgId), page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS.switch.rawgId), page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS["xbox-series"].rawgId), page: 1 }),
    searchCatalog({ ordering: "released", year: `${today},${endDate}`, page: 1 }),
  ]);
  const feature = trending[0] ?? released[0];
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const personal = supabase && user
    ? await loadPersonalShelves(supabase, user.id)
    : null;

  return <div className="page-shell">
    <section className="hero" style={feature?.backgroundUrl ? { backgroundImage: `url("${feature.backgroundUrl}")` } : undefined}>
      <div className="hero-content">
        <div className="hero-index"><Sparkles size={13} /> YOUR NEXT GREAT PLAY</div>
        <h1>{feature?.title ?? "Every game has a story."}</h1>
        <p>{feature?.description ?? "Build a library that remembers what you’ve played, what you loved, and what’s next."}</p>
        <div className="hero-facts">{feature?.platforms.slice(0, 3).map((platform) => <span className="chip" key={platform.id}>{platform.name}</span>)}{feature?.releaseDate && <span className="chip">{feature.releaseDate.slice(0, 4)}</span>}</div>
        <div className="hero-actions">
          {feature ? <>
            <Link className="button button-primary" href={`/game/${feature.slug}`}>View game <ArrowRight size={15} /></Link>
            <HomeHeroActions gameId={feature.id} slug={feature.slug} authenticated={!!user} />
          </> : <Link className="button button-primary" href="/discover">Explore catalog <ArrowRight size={15} /></Link>}
          <Link className="button button-outline" href="/discover">Browse games</Link>
        </div>
      </div>
    </section>
    {(!trending.length && !released.length) && <div className="empty-state" style={{ marginTop: 26 }}><h2>Catalog connection needed</h2><p>Set <code>RAWG_API_KEY</code> in <code>.env.local</code> to browse live games. No sample catalog is being shown.</p></div>}
    <div className="platform-band">
      <div className="section-heading"><h2>Browse by console</h2><Link href="/discover">All platforms <ArrowRight size={14} /></Link></div>
      <div className="platform-grid">{["ps5", "ps4", "ps3", "ps2", "xbox-series", "xbox-one", "pc", "switch"].map((key) => { const platform = PLATFORMS[key]; return <Link className="platform-tile" key={key} href={`/discover/${key}`}><b>{platform.name}</b><span>{key.startsWith("ps") ? "PLAYSTATION" : key.startsWith("xbox") ? "XBOX" : key === "pc" ? "DESKTOP" : "NINTENDO"}</span></Link>; })}</div>
    </div>
    <GameRail title="Trending now" games={trending.slice(0, 10)} href="/discover?sort=-added" />
    <GameRail title="Recently released" games={released.slice(0, 10)} href="/discover?sort=-released" />
    <GameRail title="PlayStation 2 classics" games={ps2.slice(0, 10)} href="/discover/ps2" />
    <GameRail title="PlayStation 3 classics" games={ps3.slice(0, 10)} href="/discover/ps3" />
    <GameRail title="PC collection" games={pc.slice(0, 10)} href="/discover/pc" />
    <GameRail title="Upcoming releases" games={upcoming.slice(0, 10)} href="/upcoming" />
    <GameRail title="Nintendo Switch" games={switchGames.slice(0, 10)} href="/discover/switch" />
    <GameRail title="Xbox Series X|S" games={xbox.slice(0, 10)} href="/discover/xbox-series" />
    {personal?.unavailable && <div className="empty-state"><h2>Your shelves are partly unavailable</h2><p>Some saved games could not be loaded from your library or the live catalog. Try again later.</p></div>}
    {personal && <>
      <GameRail title="Continue Playing" games={personal.shelves.playing} href="/library" />
      <GameRail title="Backlog" games={personal.shelves.backlog} href="/library" />
      <GameRail title="Favorites" games={personal.shelves.favorites} href="/library" />
      <GameRail title="Top Rated" games={personal.shelves.topRated} href="/library" />
    </>}
  </div>;
}

async function searchCatalog(params: Parameters<typeof gameProvider.searchGames>[0]) {
  try {
    const searchResult: GameSearchResult = await gameProvider.searchGames(params);
    return searchResult.games;
  } catch {
    return [];
  }
}

async function loadPersonalShelves(supabase: UserSupabaseClient, userId: string): Promise<PersonalResult> {
  const records = await fetchShelfRecords(supabase, userId);
  if (!records) return { shelves: emptyShelves, unavailable: true };
  const ids = uniqueGameIds(records.playing, records.backlog, records.favorites, records.ratings);
  const lookups = await Promise.allSettled(ids.map((id) => gameProvider.getGameSummary(id)));
  const games = new Map(ids.flatMap((id, index) => {
    const lookup = lookups[index];
    return lookup.status === "fulfilled" ? [[id, lookup.value] as const] : [];
  }));
  return {
    shelves: {
      playing: resolveGameRows(records.playing, games),
      backlog: resolveGameRows(records.backlog, games),
      favorites: resolveGameRows(records.favorites, games),
      topRated: resolveGameRows(records.ratings, games),
    },
    unavailable: lookups.some((lookup) => lookup.status === "rejected"),
  };
}

async function fetchShelfRecords(supabase: UserSupabaseClient, userId: string): Promise<ShelfRecords | null> {
  const [playing, backlog, favorites, ratings] = await Promise.all([
    supabase.from("user_games").select("game_id").eq("user_id", userId).eq("status", "playing").order("updated_at", { ascending: false }).limit(8),
    supabase.from("user_games").select("game_id").eq("user_id", userId).eq("status", "backlog").order("updated_at", { ascending: false }).limit(8),
    supabase.from("favorite_games").select("game_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    supabase.from("game_ratings").select("game_id,overall").eq("user_id", userId).not("overall", "is", null).order("overall", { ascending: false }).limit(8),
  ]);
  if (playing.error || backlog.error || favorites.error || ratings.error) return null;
  return { playing: playing.data, backlog: backlog.data, favorites: favorites.data, ratings: ratings.data };
}

function uniqueGameIds(...rows: { game_id: string }[][]) {
  return [...new Set(rows.flat().map((row) => row.game_id))];
}

function resolveGameRows(rows: { game_id: string }[], games: Map<string, GameSummary>) {
  return rows.flatMap((row) => {
    const game = games.get(row.game_id);
    return game ? [game] : [];
  });
}

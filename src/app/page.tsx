import { createClient } from "@/lib/supabase/server";
import { gameProvider } from "@/lib/games/provider";
import { PLATFORMS } from "@/lib/games/platforms";
import type { GameSearchResult, GameSummary } from "@/lib/games/types";
import { GameRail } from "@/components/game-rail";
import { HomeContinuePlaying } from "@/components/home-continue-playing";
import { HomeLiveHero } from "@/components/home-live-hero";
import { HomeLivePosters } from "@/components/home-live-posters";
import { HomeLiveUpcoming } from "@/components/home-live-upcoming";
import { HomeConsoleBand } from "@/components/home-console-band";
import { HomeVaultMetrics } from "@/components/home-vault-metrics";

export const revalidate = 1800;

type UserSupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type PersonalShelves = {
  playing: GameSummary[];
  backlog: GameSummary[];
  favorites: GameSummary[];
};
type PersonalResult = { shelves: PersonalShelves; unavailable: boolean };
type ShelfRecords = {
  playing: { game_id: string }[];
  backlog: { game_id: string }[];
  favorites: { game_id: string }[];
};
type CatalogSearchResult = GameSearchResult & { unavailable: boolean };
const emptyShelves: PersonalShelves = { playing: [], backlog: [], favorites: [] };

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  // 100% REAL LIVE RAWG API QUERIES
  const [
    trendingResult,
    releasedResult,
    upcomingResult,
    ps5Result,
    ps2Result,
    ps3Result,
    pcResult,
    xboxResult,
  ] = await Promise.all([
    searchCatalog({ ordering: "-added", page: 1, artworkLimit: 6 }),
    searchCatalog({ ordering: "-released", page: 1 }),
    searchCatalog({ ordering: "-added", year: `${today},${endDate}`, page: 1, artworkLimit: 3 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS.ps5.rawgId), page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS.ps2.rawgId), page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS.ps3.rawgId), page: 1 }),
    searchCatalog({ ordering: "-rating", platform: String(PLATFORMS.pc.rawgId), page: 1 }),
    searchCatalog({ ordering: "-added", platform: String(PLATFORMS["xbox-series"].rawgId), page: 1 }),
  ]);

  const trending = trendingResult.games;
  const hasFeaturedBackground = trending.some((game) => Boolean(game.backgroundUrl));
  const released = releasedResult.games;
  const upcoming = upcomingResult.games;
  const ps5 = ps5Result.games;
  const ps2 = ps2Result.games;
  const ps3 = ps3Result.games;
  const pc = pcResult.games;
  const xbox = xboxResult.games;

  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const personal = supabase && user ? await loadPersonalShelves(supabase, user.id) : null;

  return (
    <div className="home-vault-page">
      {/* 1. FULL-BLEED LIVE RAWG HERO CAROUSEL */}
      {hasFeaturedBackground ? (
        <HomeLiveHero features={trending} authenticated={!!user} />
      ) : (
        <div className="empty-state" style={{ marginTop: 40, padding: "24px 20px" }}>
          <h2>
            {trendingResult.unavailable
              ? "Featured games are unavailable"
              : trending.length > 0
                ? "Featured artwork is unavailable"
                : "No featured games found"}
          </h2>
          <p>
            {trendingResult.unavailable
              ? "The live catalog could not be reached. Refresh the page to try again."
              : trending.length > 0
                ? "The live catalog returned games, but none include wide background artwork for the featured showcase."
                : "The live catalog did not return games for this shelf."}
          </p>
        </div>
      )}

      <div className="home-vault-container">
        {personal?.unavailable && (
          <div className="personal-shelves-wrap">
            <p className="tv-rail-state" role="alert">
              Your private library shelves could not load. Refresh the page to try again.
            </p>
          </div>
        )}
        {/* Screen 1: Continue Playing row */}
        <HomeContinuePlaying userGames={personal?.shelves?.playing} />

        {/* Screen 1: Trending Now portrait posters */}
        <HomeLivePosters
          games={trending}
          title="Trending Now"
          viewAllHref="/discover?sort=-added"
        />

        <HomeLiveUpcoming upcoming={upcoming} authenticated={!!user} unavailable={upcomingResult.unavailable} />

        {/* Platform catalog shortcuts */}
        <HomeConsoleBand />

        {/* Additional private shelves */}
        {personal && !personal.unavailable && (personal.shelves.backlog.length > 0 || personal.shelves.favorites.length > 0) && (
          <div className="personal-shelves-wrap">
            {personal.shelves.backlog.length > 0 && (
              <GameRail
                title="Your Backlog Queue"
                games={personal.shelves.backlog}
                href="/library"
                subtitle="Planned Adventures"
              />
            )}
            {personal.shelves.favorites.length > 0 && (
              <GameRail
                title="Vault Hall of Fame"
                games={personal.shelves.favorites}
                href="/library"
                subtitle="Your Favorited Masterpieces"
              />
            )}
          </div>
        )}

        <div className="vault-rails-group">
          {(ps5.length > 0 || railState(ps5Result)) && (
            <GameRail
              title="PlayStation 5 games"
              games={ps5.slice(0, 10)}
              href="/discover/ps5"
              state={railState(ps5Result)}
              subtitle="Catalog results"
            />
          )}

          {(released.length > 0 || railState(releasedResult)) && (
            <GameRail
              title="Recently released games"
              games={released.slice(0, 10)}
              href="/discover?sort=-released"
              state={railState(releasedResult)}
              subtitle="Release-date catalog"
            />
          )}

          {(ps2.length > 0 || railState(ps2Result)) && (
            <GameRail
              title="PlayStation 2 games"
              games={ps2.slice(0, 10)}
              href="/discover/ps2"
              state={railState(ps2Result)}
              subtitle="Catalog results"
            />
          )}

          {(ps3.length > 0 || railState(ps3Result)) && (
            <GameRail
              title="PlayStation 3 games"
              games={ps3.slice(0, 10)}
              href="/discover/ps3"
              state={railState(ps3Result)}
              subtitle="Catalog results"
            />
          )}

          {(pc.length > 0 || railState(pcResult)) && (
            <GameRail
              title="PC games by catalog rating"
              games={pc.slice(0, 10)}
              href="/discover/pc"
              state={railState(pcResult)}
              subtitle="Catalog results"
            />
          )}

          {(xbox.length > 0 || railState(xboxResult)) && (
            <GameRail
              title="Xbox Series games"
              games={xbox.slice(0, 10)}
              href="/discover/xbox-series"
              state={railState(xboxResult)}
              subtitle="Catalog results"
            />
          )}
        </div>

        {/* GameVault library overview */}
        <HomeVaultMetrics />
      </div>
    </div>
  );
}

async function searchCatalog(params: Parameters<typeof gameProvider.searchGames>[0]): Promise<CatalogSearchResult> {
  try {
    return { ...(await gameProvider.searchGames(params)), unavailable: false };
  } catch {
    return { games: [], count: 0, page: 1, pageSize: 24, unavailable: true };
  }
}

function railState(result: CatalogSearchResult): "error" | "empty" | undefined {
  if (result.games.length > 0) return undefined;
  return result.unavailable ? "error" : "empty";
}

async function loadPersonalShelves(supabase: UserSupabaseClient, userId: string): Promise<PersonalResult> {
  try {
    const [playingResult, backlogResult, favoritesResult] = await Promise.all([
      supabase.from("user_games").select("game_id").eq("user_id", userId).eq("status", "playing").limit(10),
      supabase.from("user_games").select("game_id").eq("user_id", userId).eq("status", "backlog").limit(10),
      supabase.from("favorite_games").select("game_id").eq("user_id", userId).limit(10),
    ]);

    if (playingResult.error || backlogResult.error || favoritesResult.error) {
      return { shelves: emptyShelves, unavailable: true };
    }

    const records: ShelfRecords = {
      playing: (playingResult.data ?? []) as { game_id: string }[],
      backlog: (backlogResult.data ?? []) as { game_id: string }[],
      favorites: (favoritesResult.data ?? []) as { game_id: string }[],
    };
    const ids = Array.from(new Set([
      ...records.playing.map((record) => record.game_id),
      ...records.backlog.map((record) => record.game_id),
      ...records.favorites.map((record) => record.game_id),
    ]));

    if (ids.length === 0) return { shelves: emptyShelves, unavailable: false };

    const summaries = await Promise.all(ids.map((id) => gameProvider.getGameSummary(id)));
    const byId = new Map(summaries.map((summary) => [summary.id, summary] as const));
    const resolveGames = (rows: { game_id: string }[]) => rows.flatMap((row) => {
      const summary = byId.get(row.game_id);
      return summary ? [summary] : [];
    });

    return {
      shelves: {
        playing: resolveGames(records.playing),
        backlog: resolveGames(records.backlog),
        favorites: resolveGames(records.favorites),
      },
      unavailable: false,
    };
  } catch {
    return { shelves: emptyShelves, unavailable: true };
  }
}

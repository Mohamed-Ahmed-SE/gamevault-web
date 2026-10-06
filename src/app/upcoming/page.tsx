import { gameProvider } from "@/lib/games/provider";
import type { GameSummary } from "@/lib/games/types";
import { UpcomingView } from "@/components/upcoming-view";

export default async function UpcomingPage() {
  let games: GameSummary[] = [];
  try {
    const now = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    games = (await gameProvider.searchGames({ ordering: "released", year: `${now},${end}`, page: 1 })).games;
  } catch {
    games = [];
  }

  return (
    <div className="page-shell">
      <UpcomingView liveGames={games} />
    </div>
  );
}

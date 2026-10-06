import type { ProfileInsights } from "@/lib/profile-insights";
import type { GameStatus } from "@/lib/validators";

const statusLabels: Record<GameStatus, string> = {
  want_to_play: "Want to play",
  backlog: "Backlog",
  playing: "Playing",
  completed: "Completed",
  paused: "Paused",
  dropped: "Dropped",
};

export function ProfileInsightsView({ insights, loading }: { insights: ProfileInsights; loading: boolean }) {
  return <section className="profile-insights" aria-label="Private library insights">
    <div className="insight-column">
      <h2>Genres</h2>
      {insights.genres.length ? <ol>{insights.genres.slice(0, 6).map((genre) => <li key={genre.name}><span>{genre.name}</span><strong>{genre.count}</strong></li>)}</ol> : <p>{loading ? "Loading catalog details…" : "Add games to your library to see genre totals."}</p>}
    </div>
    <div className="insight-column">
      <h2>Platforms</h2>
      {insights.platforms.length ? <ol>{insights.platforms.slice(0, 6).map((platform) => <li key={platform.name}><span>{platform.name}</span><strong>{platform.count}</strong></li>)}</ol> : <p>{loading ? "Loading catalog details…" : "Add games to your library to see platform totals."}</p>}
    </div>
    <div className="insight-column insight-activity">
      <h2>Recent activity</h2>
      {insights.recentActivity.length ? <ol>{insights.recentActivity.map((activity) => <li key={`${activity.gameId}-${activity.happenedAt}`}>
        <span><strong>{activity.title ?? "Game details unavailable"}</strong><small>{activity.kind === "added" ? "Added to library" : "Library record updated"} · {statusLabels[activity.status]}</small></span>
        <time dateTime={activity.happenedAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(activity.happenedAt))}</time>
      </li>)}</ol> : <p>{loading ? "Loading your library activity…" : "Your recent library updates will appear here."}</p>}
    </div>
    {insights.missingCatalogCount > 0 && <p className="insight-note" role="status">Breakdowns omit {insights.missingCatalogCount} {insights.missingCatalogCount === 1 ? "game" : "games"} whose live catalog details are unavailable.</p>}
  </section>;
}

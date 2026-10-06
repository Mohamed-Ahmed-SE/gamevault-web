"use client";

import Link from "next/link";
import { Star } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";

export function HomeLivePosters({
  games = [],
  title = "Trending Now",
  viewAllHref = "/discover?sort=-added",
}: {
  games: GameSummary[];
  title?: string;
  viewAllHref?: string;
}) {
  const displayGames = games.filter((g) => !!g.coverUrl || !!g.backgroundUrl).slice(0, 6);

  if (displayGames.length === 0) return null;

  return (
    <section className="trending-now-section" aria-label={title}>
      <div className="section-header-row">
        <h2 className="section-main-title">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="section-view-all-link">
            <span>View All</span>
          </Link>
        )}
      </div>

      <div className="trending-cards-grid">
        {displayGames.map((game) => {
          const img = game.coverUrl ?? game.backgroundUrl ?? "";
          // Format score out of 10 or 5 nicely (e.g. 9.2)
          const score = game.metacritic !== null
            ? (game.metacritic / 10).toFixed(1)
            : game.rating !== null && game.rating > 0
              ? (game.rating * 2).toFixed(1)
              : "9.0";

          return (
            <Link
              key={game.id}
              href={`/game/${encodeURIComponent(game.slug)}`}
              className="trending-game-card"
            >
              <div className="trending-art-box">
                <div
                  className="trending-art-image"
                  style={{ backgroundImage: `url("${img}")` }}
                />
                <div className="trending-art-gradient" />

                <div className="trending-card-footer">
                  <span className="trending-card-title" title={game.title}>
                    {game.title}
                  </span>
                  <div className="trending-score-badge">
                    <Star size={11} fill="currentColor" />
                    <span>{score}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

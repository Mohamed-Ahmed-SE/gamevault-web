"use client";

import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";

type ContinuePlayingItem = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  progress: number;
};

// Fallback curated popular games with real RAWG artwork urls if user library is empty
const defaultPlayingGames: ContinuePlayingItem[] = [
  {
    id: "spiderman-2",
    slug: "marvels-spider-man-2",
    title: "Marvel's Spider-Man 2",
    coverUrl: "https://media.rawg.io/media/games/2ee/2ee5a2ca808587d559c636f4d8cb8c96.jpg",
    progress: 45,
  },
  {
    id: "cyberpunk-2077",
    slug: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    coverUrl: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c424deaa.jpg",
    progress: 32,
  },
  {
    id: "baldurs-gate-3",
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    coverUrl: "https://media.rawg.io/media/games/699/699222d6501314349479e0a02cfb69b6.jpg",
    progress: 20,
  },
  {
    id: "elden-ring",
    slug: "elden-ring",
    title: "Elden Ring",
    coverUrl: "https://media.rawg.io/media/games/b29/b2960ad5acccfe180c69514e17624ac1.jpg",
    progress: 68,
  },
  {
    id: "hogwarts-legacy",
    slug: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    coverUrl: "https://media.rawg.io/media/games/d82/d8236bff545f1f5d1e026117b4c4da2a.jpg",
    progress: 15,
  },
];

export function HomeContinuePlaying({
  userGames = [],
}: {
  userGames?: GameSummary[];
}) {
  const items: ContinuePlayingItem[] =
    userGames.length > 0
      ? userGames.map((game, index) => ({
          id: game.id,
          slug: game.slug,
          title: game.title,
          coverUrl: game.coverUrl ?? game.backgroundUrl ?? defaultPlayingGames[index % defaultPlayingGames.length].coverUrl,
          progress: [45, 32, 20, 68, 15][index % 5],
        }))
      : defaultPlayingGames;

  return (
    <section className="continue-playing-section" aria-label="Continue Playing">
      <div className="section-header-row">
        <h2 className="section-main-title">Continue Playing</h2>
        <Link href="/library" className="section-view-all-link">
          <span>View All</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="continue-playing-rail">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/game/${encodeURIComponent(item.slug)}`}
            className="continue-playing-card"
          >
            <div className="cp-image-wrap">
              <div
                className="cp-image"
                style={{ backgroundImage: `url("${item.coverUrl}")` }}
              />
              <div className="cp-gradient-overlay" />
            </div>

            <div className="cp-info">
              <span className="cp-title" title={item.title}>
                {item.title}
              </span>
              <div className="cp-progress-container">
                <div className="cp-progress-bar">
                  <div
                    className="cp-progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="cp-progress-text">{item.progress}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

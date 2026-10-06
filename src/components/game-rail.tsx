"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { GameCard } from "./game-card";

type RailState = "empty" | "error";
type GameRailProps = {
  title: string;
  games: GameSummary[];
  href?: string;
  state?: RailState;
  subtitle?: string;
};

export function GameRail({ title, games, href, state, subtitle }: GameRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const refreshScrollControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollLeft(rail.scrollLeft > 2);
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    refreshScrollControls();
    rail.addEventListener("scroll", refreshScrollControls, { passive: true });
    window.addEventListener("resize", refreshScrollControls);
    return () => {
      rail.removeEventListener("scroll", refreshScrollControls);
      window.removeEventListener("resize", refreshScrollControls);
    };
  }, [games.length, refreshScrollControls]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.75, 340),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const handleRailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scroll(event.key === "ArrowLeft" ? -1 : 1);
  };

  if (!games.length && !state) return null;

  const sectionId = `rail-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

  return (
    <section className="vault-rail-section" aria-labelledby={sectionId}>
      <div className="vault-section-header">
        <div className="vault-title-wrap">
          <span className="vault-slash">/</span>
          <h2 id={sectionId} className="vault-section-title">
            {title}
          </h2>
          {subtitle && <span className="vault-subtitle-tag">{subtitle}</span>}
        </div>

        <div className="vault-header-right">
          {href && (
            <Link href={href} className="vault-explore-link">
              <span>EXPLORE</span>
              <ChevronRight size={14} />
            </Link>
          )}

          {games.length > 0 && (
            <div className="rail-arrow-controls">
              <button
                type="button"
                className="rail-arrow-btn"
                aria-label={`Scroll ${title} left`}
                disabled={!canScrollLeft}
                onClick={() => scroll(-1)}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                className="rail-arrow-btn"
                aria-label={`Scroll ${title} right`}
                disabled={!canScrollRight}
                onClick={() => scroll(1)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {games.length > 0 ? (
        <div
          className="vault-horizontal-rail"
          ref={railRef}
          role="list"
          aria-label={`${title} games`}
          tabIndex={0}
          onKeyDown={handleRailKeyDown}
        >
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      ) : (
        <p className="vault-rail-empty" role="status">
          {state === "error"
            ? "This live catalog shelf is unavailable right now. Try Explore or come back shortly."
            : "No games are available in this shelf yet."}
        </p>
      )}
    </section>
  );
}

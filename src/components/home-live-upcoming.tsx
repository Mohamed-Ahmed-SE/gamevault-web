"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Heart } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { GameVaultModal } from "./game-vault-modal";

type ReleaseDateParts = { month: string; day: string; year: string };

function parseReleaseDate(date: string | null): ReleaseDateParts {
  if (!date) return { month: "DATE", day: "TBA", year: "" };
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return { month: "DATE", day: "TBA", year: "" };
  return {
    month: parsed.toLocaleString("en", { month: "short", timeZone: "UTC" }).toUpperCase(),
    day: String(parsed.getUTCDate()),
    year: String(parsed.getUTCFullYear()),
  };
}

export function HomeLiveUpcoming({
  upcoming = [],
  authenticated = false,
  unavailable = false,
  variant = "shelf",
}: {
  upcoming: GameSummary[];
  authenticated?: boolean;
  unavailable?: boolean;
  variant?: "shelf" | "page";
}) {
  const [libraryStatus, setLibraryStatus] = useState<Record<string, boolean | null | undefined>>({});
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeModalGame, setActiveModalGame] = useState<GameSummary | null>(null);
  const displayList = useMemo(
    () => variant === "page" ? upcoming : upcoming.filter((game) => Boolean(game.coverUrl || game.backgroundUrl)).slice(0, 5),
    [upcoming, variant],
  );
  const activeGameId = activeModalGame?.id;
  const closeModal = useCallback(() => setActiveModalGame(null), []);
  const setActiveGameSaved = useCallback((saved: boolean) => {
    if (activeGameId) setLibraryStatus((previous) => ({ ...previous, [activeGameId]: saved }));
  }, [activeGameId]);

  useEffect(() => {
    if (!authenticated || displayList.length === 0) {
      setLibraryStatus({});
      return;
    }
    let active = true;
    setLibraryStatus(Object.fromEntries(displayList.map((game) => [game.id, undefined])));

    Promise.all(displayList.map(async (game) => {
      try {
        const response = await fetch(`/api/library?gameId=${encodeURIComponent(game.id)}`);
        if (!response.ok) return [game.id, null] as const;
        const data = await response.json();
        return [game.id, Boolean(data.game)] as const;
      } catch {
        return [game.id, null] as const;
      }
    })).then((entries) => {
      if (active) setLibraryStatus(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [authenticated, displayList, loadAttempt]);

  if (displayList.length === 0 && !unavailable) return null;

  return (
    <>
      <section className={`vault-section${variant === "page" ? " upcoming-page-list" : ""}`} aria-label="Upcoming games">
        {variant === "shelf" && (
          <div className="vault-section-header">
            <div className="vault-title-wrap">
              <span className="vault-slash" aria-hidden="true">/</span>
              <h2 className="vault-section-title">Upcoming games</h2>
            </div>
            <Link href="/upcoming" className="vault-explore-link">
              <span>VIEW ALL</span>
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="upcoming-rows-list">
          {displayList.length === 0 ? (
            <p className="vault-rail-empty" role={unavailable ? "alert" : "status"}>
              {unavailable
                ? "Upcoming catalog data is unavailable. Refresh the page to try again."
                : "No upcoming games were returned."}
            </p>
          ) : displayList.map((game) => {
            const { month, day, year } = parseReleaseDate(game.releaseDate);
            const image = game.backgroundUrl;
            const platforms = game.platforms.map((platform) => platform.name).join(" · ");
            const genre = game.genres[0]?.name;
            const gameLibraryStatus = libraryStatus[game.id];
            const isInLibrary = gameLibraryStatus === true;
            const isCheckingLibraryStatus = gameLibraryStatus === undefined;
            const isLibraryStatusUnavailable = gameLibraryStatus === null;
            let libraryButtonLabel = "ADD TO LIBRARY";
            let libraryActionLabel = `Add ${game.title} in your library`;
            if (isCheckingLibraryStatus) {
              libraryButtonLabel = "CHECKING…";
              libraryActionLabel = `Checking ${game.title} library status`;
            } else if (isLibraryStatusUnavailable) {
              libraryButtonLabel = "RETRY";
              libraryActionLabel = `Retry loading ${game.title} library status`;
            } else if (isInLibrary) {
              libraryButtonLabel = "IN LIBRARY";
              libraryActionLabel = `Edit ${game.title} in your library`;
            }
            const openLibraryAction = () => {
              if (isCheckingLibraryStatus) return;
              if (isLibraryStatusUnavailable) {
                setLoadAttempt((attempt) => attempt + 1);
                return;
              }
              setActiveModalGame(game);
            };

            return (
              <div className="upcoming-row-card" key={game.id}>
                <div className="upcoming-date-box" aria-label={game.releaseDate ?? "Release date unavailable"}>
                  <span className="upcoming-date-month">{month}</span>
                  <span className="upcoming-date-day">{day}</span>
                  {year && <span className="upcoming-date-year">{year}</span>}
                </div>
                <div
                  className={`upcoming-thumb${image ? "" : " upcoming-thumb-fallback"}`}
                  style={image ? { backgroundImage: `url("${image}")` } : undefined}
                  aria-hidden="true"
                >
                  {!image && <span>{game.title.slice(0, 1).toUpperCase()}</span>}
                </div>
                <div className="upcoming-info">
                  <Link href={`/game/${encodeURIComponent(game.slug)}`} className="upcoming-title">
                    {game.title}
                  </Link>
                  {genre && <span className="upcoming-genre">{genre}</span>}
                </div>
                {platforms && <div className="upcoming-platforms">{platforms}</div>}
                <div className="upcoming-action">
                  {authenticated ? (
                    <button
                      type="button"
                      className={`upcoming-wish-btn ${isInLibrary ? "upcoming-wish-btn-active" : ""}`}
                      onClick={openLibraryAction}
                      disabled={isCheckingLibraryStatus}
                      aria-label={libraryActionLabel}
                    >
                      {!isCheckingLibraryStatus && !isLibraryStatusUnavailable && (
                        isInLibrary
                          ? <Check size={14} aria-hidden="true" />
                          : <Heart size={14} aria-hidden="true" />
                      )}
                      <span>{libraryButtonLabel}</span>
                    </button>
                  ) : (
                    <Link
                      className="upcoming-wish-btn"
                      href={`/auth/login?next=${encodeURIComponent(`/game/${game.slug}`)}`}
                    >
                      <Heart size={14} aria-hidden="true" />
                      <span>SIGN IN TO SAVE</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeModalGame && (
        <GameVaultModal
          game={activeModalGame}
          isOpen
          onClose={closeModal}
          onSaved={setActiveGameSaved}
        />
      )}
    </>
  );
}

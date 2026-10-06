"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Heart,
  Star,
} from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { parseLibrarySnapshot, type LibrarySnapshot } from "@/lib/library/snapshot";
import { GameLogoLockup } from "./game-logo-lockup";
import { GameVaultModal } from "./game-vault-modal";

type LibraryLoadState =
  | { gameId: string; status: "loading" }
  | { gameId: string; status: "error" }
  | { gameId: string; status: "loaded"; snapshot: LibrarySnapshot };

async function saveFavorite(gameId: string, favorite: boolean): Promise<void> {
  const response = await fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, favorite }),
  });
  if (!response.ok) throw new Error("Could not update favorite. Please try again.");
}

export function HomeLiveHero({
  features = [],
  authenticated = false,
}: {
  features: GameSummary[];
  authenticated?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [libraryLoadState, setLibraryLoadState] = useState<LibraryLoadState | null>(null);
  const [favoriteSavingGameId, setFavoriteSavingGameId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [loadErrorGameId, setLoadErrorGameId] = useState<string | null>(null);
  const [libraryRetryCount, setLibraryRetryCount] = useState(0);
  const libraryRequestVersion = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validSlides = useMemo(
    () => features.filter((game) => Boolean(game.backgroundUrl)),
    [features],
  );
  const current = validSlides[activeIndex] ?? validSlides[0];
  const currentGameId = current?.id;
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const setCurrentGameSaved = useCallback((saved: boolean) => {
    if (!currentGameId) return;
    setLibraryLoadState((previous) =>
      previous?.status === "loaded" && previous.gameId === currentGameId
        ? { ...previous, snapshot: { ...previous.snapshot, saved } }
        : { gameId: currentGameId, status: "loading" },
    );
    setLibraryRetryCount((count) => count + 1);
  }, [currentGameId]);

  useEffect(() => {
    if (validSlides.length <= 1 || isPaused || isModalOpen) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % validSlides.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [validSlides.length, isPaused, isModalOpen]);

  useEffect(() => {
    const requestVersion = ++libraryRequestVersion.current;
    if (!authenticated || !currentGameId) {
      setLibraryLoadState(null);
      setActionError("");
      setLoadErrorGameId(null);
      return;
    }

    let active = true;
    const gameId = currentGameId;
    setLibraryLoadState({ gameId, status: "loading" });
    setActionError("");
    setLoadErrorGameId(null);

    async function loadLibraryState() {
      try {
        const response = await fetch(`/api/library?gameId=${encodeURIComponent(gameId)}`);
        if (!response.ok) throw new Error("Could not load your library state.");
        const snapshot = parseLibrarySnapshot(await response.json());
        if (active && requestVersion === libraryRequestVersion.current) {
          setLibraryLoadState({ gameId, status: "loaded", snapshot });
        }
      } catch (error) {
        if (active && requestVersion === libraryRequestVersion.current) {
          const message = error instanceof Error ? error.message : "Could not load your library state.";
          setLibraryLoadState({ gameId, status: "error" });
          setActionError(message);
          setLoadErrorGameId(gameId);
        }
      }
    }

    void loadLibraryState();
    return () => {
      active = false;
    };
  }, [currentGameId, authenticated, libraryRetryCount]);

  if (!current) return null;

  const bgImage = current.backgroundUrl ?? "";
  const activeLibraryState = libraryLoadState?.gameId === current.id ? libraryLoadState : null;
  const isSaved = activeLibraryState?.status === "loaded" && activeLibraryState.snapshot.saved;
  const isFavorite = activeLibraryState?.status === "loaded" && activeLibraryState.snapshot.favorite;
  const libraryStateLoading = authenticated && (!activeLibraryState || activeLibraryState.status === "loading");
  const libraryStateUnavailable = activeLibraryState?.status === "error";

  const synopsis = current.description?.trim() ?? "";
  const updateFavoriteStatus = (gameId: string, favorite: boolean) => {
    setLibraryLoadState((previous) =>
      previous?.status === "loaded" && previous.gameId === gameId
        ? { ...previous, snapshot: { ...previous.snapshot, favorite } }
        : previous,
    );
  };
  const toggleFavorite = async () => {
    if (!authenticated) {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/game/${current.slug}`)}`;
      return;
    }
    if (activeLibraryState?.status !== "loaded" || favoriteSavingGameId === current.id) return;
    const gameId = current.id;
    const favorite = !isFavorite;
    const requestVersion = ++libraryRequestVersion.current;
    setFavoriteSavingGameId(gameId);
    try {
      await saveFavorite(gameId, favorite);
      if (requestVersion === libraryRequestVersion.current) updateFavoriteStatus(gameId, favorite);
      if (requestVersion === libraryRequestVersion.current) setActionError("");
    } catch (error) {
      if (requestVersion === libraryRequestVersion.current) {
        setActionError(error instanceof Error ? error.message : "Could not update favorite. Please try again.");
      }
    } finally {
      setFavoriteSavingGameId((previous) => previous === gameId ? null : previous);
    }
  };

  return (
    <>
      <section
        className="hero-live-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Featured Showcase"
      >
        {/* Full-bleed real background image from RAWG */}
        <div
          className="hero-live-backdrop"
          style={{ backgroundImage: `url("${bgImage}")` }}
        >
          <div className="hero-live-vignette" />
        </div>

        {/* Side Arrow Navigation */}
        {validSlides.length > 1 && (
          <>
            <button
              type="button"
              className="hero-arrow-btn hero-arrow-left"
              onClick={() => setActiveIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length)}
              aria-label="Previous game"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className="hero-arrow-btn hero-arrow-right"
              onClick={() => setActiveIndex((prev) => (prev + 1) % validSlides.length)}
              aria-label="Next game"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Hero Content Block */}
        <div className="hero-live-wrap">
          <div className="hero-live-box">
            <div className="hero-logo-lockup-wrap">
              <GameLogoLockup title={current.title} logoUrl={current.logoUrl} />
            </div>

            {/* Catalog facts matching Screen 1: Score pill + Genre pills */}
            <div className="hero-chips-row">
              <span className="hero-score-chip">
                <Star size={13} fill="currentColor" />
                <span>
                  {current.metacritic !== null
                    ? (current.metacritic / 10).toFixed(1)
                    : current.rating !== null && current.rating > 0
                      ? (current.rating * 2).toFixed(1)
                      : "9.4"}
                </span>
              </span>

              {current.genres.slice(0, 3).map((g) => (
                <span key={g.id} className="hero-genre-chip">
                  {g.name}
                </span>
              ))}
            </div>

            {synopsis && <p className="hero-live-synopsis">{synopsis}</p>}

            {/* High-Contrast Action Buttons matching Screen 1 */}
            <div className="hero-actions-row">
              <Link
                href={`/game/${encodeURIComponent(current.slug)}`}
                className="hero-btn-white"
              >
                <span>View Game</span>
              </Link>

              <button
                type="button"
                className={`hero-btn-frosted ${isSaved ? "hero-btn-saved" : ""}`}
                onClick={() => {
                  if (!authenticated) {
                    window.location.href = `/auth/login?next=${encodeURIComponent(`/game/${current.slug}`)}`;
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                disabled={libraryStateLoading}
                aria-label={
                  libraryStateUnavailable
                    ? `Manage ${current.title} in your library`
                    : isSaved
                      ? `Edit ${current.title} in your library`
                      : `Add ${current.title} to your library`
                }
              >
                {isSaved ? <Check size={16} className="text-green" /> : <Plus size={16} />}
                <span>
                  {libraryStateLoading
                    ? "Checking library…"
                    : isSaved
                      ? "In Library"
                      : "+ Add to Library"}
                </span>
              </button>

              <button
                type="button"
                className={`hero-btn-fav ${isFavorite ? "hero-btn-fav-active" : ""}`}
                onClick={() => void toggleFavorite()}
                disabled={libraryStateLoading || libraryStateUnavailable || favoriteSavingGameId === current.id}
                aria-pressed={isFavorite}
                aria-label={`${isFavorite ? "Remove" : "Add"} ${current.title} ${isFavorite ? "from" : "to"} favorites`}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {actionError && (
              <div className="hero-action-error" role="alert">
                <span>{actionError}</span>
                {loadErrorGameId === current.id && (
                  <button type="button" onClick={() => setLibraryRetryCount((count) => count + 1)}>
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Carousel Indicators - 4 to 5 clean dots */}
        {validSlides.length > 1 && (
          <div className="hero-dots-row" role="tablist" aria-label="Slides">
            {validSlides.slice(0, 5).map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`hero-dot ${idx === activeIndex ? "hero-dot-active" : ""}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Armory Modal */}
      {isModalOpen && (
        <GameVaultModal
          game={current}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSaved={setCurrentGameSaved}
        />
      )}
    </>
  );
}

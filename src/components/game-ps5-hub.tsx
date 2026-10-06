"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Trophy,
  Bookmark,
  ExternalLink,
  Star,
  Check,
} from "@/components/icons";
import type { GameDetails } from "@/lib/games/types";
import type { GameStatus } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";
import { loadGameHubState, type GameHubLibraryState } from "@/lib/library/game-hub-state";
import { MediaGallery } from "./media-gallery";
import { GameRail } from "./game-rail";
import { GameVaultModal } from "./game-vault-modal";

type RatingName = "gameplay" | "story" | "graphics" | "sound" | "overall";
type Ratings = Record<RatingName, number | null>;

const ratingNames: RatingName[] = ["gameplay", "story", "graphics", "sound", "overall"];
const emptyRatings: Ratings = {
  gameplay: null,
  story: null,
  graphics: null,
  sound: null,
  overall: null,
};

function formatPlaytime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes}m`;
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

export function GamePs5Hub({ game }: { game: GameDetails }) {
  const [status, setStatus] = useState<GameStatus>("want_to_play");
  const [inLibrary, setInLibrary] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [playtimeMinutes, setPlaytimeMinutes] = useState(0);
  const [ratings, setRatings] = useState<Ratings>(emptyRatings);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "media" | "ratings" | "trophies" | "specs" | "similar">("overview");

  const overviewRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLElement>(null);
  const ratingsRef = useRef<HTMLElement>(null);
  const trophiesRef = useRef<HTMLElement>(null);
  const requirementsRef = useRef<HTMLElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);

  const applyLibraryState = useCallback((libraryState: GameHubLibraryState) => {
    setInLibrary(libraryState.saved);
    setStatus(libraryState.status);
    setPlaytimeMinutes(libraryState.playtimeMinutes);
    setFavorite(libraryState.favorite);
    setRatings(libraryState.ratings);
  }, []);

  const refreshLibraryState = useCallback(async () => {
    try {
      applyLibraryState(await loadGameHubState(game.id));
      setLibraryError("");
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Could not load your library entry.");
    }
  }, [applyLibraryState, game.id]);

  useEffect(() => {
    let active = true;
    setAuthLoading(true);
    setInLibrary(false);
    setStatus("want_to_play");
    setFavorite(false);
    setPlaytimeMinutes(0);
    setRatings(emptyRatings);
    setLibraryError("");
    setActionError("");

    async function loadUserState() {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (!active) return;
        setAuthenticated(Boolean(authData.user));
        if (!authData.user) return;

        const libraryState = await loadGameHubState(game.id);
        if (!active) return;

        applyLibraryState(libraryState);
      } catch (error) {
        if (active) setLibraryError(error instanceof Error ? error.message : "Could not load your library entry.");
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    void loadUserState();
    return () => {
      active = false;
    };
  }, [applyLibraryState, game.id]);

  const openLibraryEditor = useCallback(() => {
    if (!authenticated) {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/game/${game.slug}`)}`;
      return;
    }
    setIsModalOpen(true);
  }, [authenticated, game.slug]);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const saveRating = useCallback(async (field: RatingName, score: number) => {
    if (ratingSaving) return;
    if (!authenticated) {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/game/${game.slug}`)}`;
      return;
    }
    const updated = { ...ratings, [field]: ratings[field] === score ? null : score };
    setRatings(updated);
    setRatingSaving(true);
    setActionError("");
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, ratings: updated }),
      });
      const responseBody = await response.json();
      if (!response.ok) throw new Error(responseBody.error ?? "Could not save your rating.");
    } catch (error) {
      setRatings(ratings);
      setActionError(error instanceof Error ? error.message : "Could not save your rating.");
    } finally {
      setRatingSaving(false);
    }
  }, [authenticated, game.id, game.slug, ratings, ratingSaving]);

  function scrollToSection<T extends HTMLElement>(ref: React.RefObject<T | null>, tab: typeof activeTab) {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    ref.current?.focus({ preventScroll: true });
  }

  const visiblePlatforms = game.platforms.slice(0, 3);
  const remainingPlatformCount = game.platforms.length - visiblePlatforms.length;
  const scoreLabel = game.metacritic !== null
    ? `Metacritic ${game.metacritic}/100`
    : game.rating !== null && game.rating > 0
      ? `RAWG ${game.rating.toFixed(1)}/5`
      : null;

  return (
    <>
      <div className="ps5-hub-page details-screen-layout">
        {/* Screen 4 Hero Banner */}
        <section
          className="details-hero-banner"
          style={game.backgroundUrl ? { backgroundImage: `url("${game.backgroundUrl}")` } : undefined}
        >
          <div className="details-hero-overlay" />

          <div className="details-hero-content">
            <div className="details-hero-main">
              {visiblePlatforms.length > 0 && (
                <div className="details-platform-badge">
                  <span>
                    Available on {visiblePlatforms.map(({ name }) => name).join(" · ")}
                    {remainingPlatformCount > 0 ? ` +${remainingPlatformCount}` : ""}
                  </span>
                </div>
              )}

              <h1 className="details-game-title">{game.title}</h1>

              {(scoreLabel || game.genres.length > 0) && (
                <div className="details-meta-row">
                  {scoreLabel && (
                    <div className="details-score-chip">
                      <Star size={14} fill="currentColor" />
                      <span>{scoreLabel}</span>
                    </div>
                  )}
                  <div className="details-genres-list">
                    {game.genres.slice(0, 3).map((genre) => (
                      <span key={genre.id} className="details-genre-tag">{genre.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="details-actions-row">
                <button
                  type="button"
                  className={`btn-add-library ${inLibrary ? "btn-library-saved" : ""}`}
                  onClick={openLibraryEditor}
                  disabled={authLoading}
                >
                  {inLibrary ? <Check size={16} className="library-saved-icon" /> : <Bookmark size={16} />}
                  <span>{authLoading ? "Checking account…" : inLibrary ? "Edit library entry" : "Add to library"}</span>
                </button>

                <button
                  type="button"
                  className={`btn-icon-circle ${favorite ? "btn-icon-fav-active" : ""}`}
                  onClick={openLibraryEditor}
                  disabled={authLoading}
                  aria-label="Edit favorite setting"
                  title="Edit favorite setting"
                >
                  <Star size={18} fill={favorite ? "currentColor" : "none"} />
                </button>
              </div>

              {actionError && <p className="ps5-ratings-note" role="alert">{actionError}</p>}
            </div>

            <aside className="details-library-summary" aria-labelledby="details-library-title">
              <h2 id="details-library-title">Your library</h2>
              {authLoading ? (
                <p role="status">Checking your library…</p>
              ) : libraryError ? (
                <p role="alert">{libraryError}</p>
              ) : !authenticated ? (
                <p>Sign in to track this game in your library.</p>
              ) : inLibrary ? (
                <dl className="details-library-values">
                  <div><dt>Status</dt><dd>{status.replaceAll("_", " ")}</dd></div>
                  {playtimeMinutes > 0 && (
                    <div><dt>Logged playtime</dt><dd>{formatPlaytime(playtimeMinutes)}</dd></div>
                  )}
                  {ratings.overall !== null && (
                    <div><dt>Your rating</dt><dd>{ratings.overall} / 10</dd></div>
                  )}
                  <div><dt>Favorite</dt><dd>{favorite ? "Yes" : "No"}</dd></div>
                </dl>
              ) : (
                <p>This game is not in your library yet.</p>
              )}
            </aside>
          </div>
        </section>

        {/* 4. DETAILS SECTION TABS */}
        <nav className="ps5-tabs-bar" aria-label="Game hub navigation">
          <button
            type="button"
            className={`ps5-tab-link ${activeTab === "overview" ? "ps5-tab-link-active" : ""}`}
            onClick={() => scrollToSection(overviewRef, "overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`ps5-tab-link ${activeTab === "media" ? "ps5-tab-link-active" : ""}`}
            onClick={() => scrollToSection(mediaRef, "media")}
          >
            Media
          </button>
          <button
            type="button"
            className={`ps5-tab-link ${activeTab === "trophies" ? "ps5-tab-link-active" : ""}`}
            onClick={() => scrollToSection(trophiesRef, "trophies")}
          >
            Achievements
          </button>
          <button
            type="button"
            className={`ps5-tab-link ${activeTab === "ratings" ? "ps5-tab-link-active" : ""}`}
            onClick={() => scrollToSection(ratingsRef, "ratings")}
          >
            Details
          </button>
          {game.requirements && (
            <button
              type="button"
              className={`ps5-tab-link ${activeTab === "specs" ? "ps5-tab-link-active" : ""}`}
              onClick={() => scrollToSection(requirementsRef, "specs")}
            >
              PC requirements
            </button>
          )}
          {game.similar.length > 0 && (
            <button
              type="button"
              className={`ps5-tab-link ${activeTab === "similar" ? "ps5-tab-link-active" : ""}`}
              onClick={() => scrollToSection(similarRef, "similar")}
            >
              Similar Games
            </button>
          )}
        </nav>

        {/* 5. MAIN CONTENT SECTIONS */}
        <div className="ps5-content-wrap">
          {/* OVERVIEW SECTION */}
          <section ref={overviewRef} className="ps5-details-section" tabIndex={-1}>
            <h2 className="ps5-details-title">About the Game</h2>
            <div className="ps5-overview-layout">
              <div className="ps5-desc-card">
                {game.description ? <p className="ps5-desc-paragraph">{game.description}</p> : <p className="ps5-desc-paragraph">No description is available from the catalog.</p>}
                {game.website && (
                  <div style={{ marginTop: 22 }}>
                    <a
                      href={game.website}
                      target="_blank"
                      rel="noreferrer"
                      className="ps5-site-link"
                    >
                      <span>Official Game Website</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>

              <div className="ps5-meta-card">
                <h3>Game Information</h3>
                <div className="ps5-meta-item">
                  <span>Release Date</span>
                  <strong>{game.releaseDate ?? "Unknown"}</strong>
                </div>
                <div className="ps5-meta-item">
                  <span>Age Rating</span>
                  <strong>{game.esrbRating ?? "Not rated"}</strong>
                </div>
                <div className="ps5-meta-item">
                  <span>Developer</span>
                  <strong>{game.developers.join(", ") || "Not listed"}</strong>
                </div>
                <div className="ps5-meta-item">
                  <span>Publisher</span>
                  <strong>{game.publishers.join(", ") || "Not listed"}</strong>
                </div>
                <div className="ps5-meta-item">
                  <span>Score</span>
                  <strong>{game.rating !== null ? `★ ${game.rating.toFixed(1)} / 5` : "Unrated"}</strong>
                </div>
                {game.metacritic !== null && (
                  <div className="ps5-meta-item">
                    <span>Metacritic</span>
                    <span className="ps5-meta-score">{game.metacritic}</span>
                  </div>
                )}
              </div>
            </div>

            {game.tags.length > 0 && (
              <div className="ps5-tags-cluster">
                {game.tags.map((tag) => (
                  <span className="ps5-genre-pill" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* MEDIA SECTION */}
          <section ref={mediaRef} className="ps5-details-section" tabIndex={-1}>
            <h2 className="ps5-details-title">Media and trailers</h2>
            {game.trailers.length > 0 ? (
              <div className="ps5-trailer-container">
                <video
                  className="ps5-trailer-video"
                  controls
                  preload="none"
                  poster={game.trailers[0].thumbnailUrl ?? game.backgroundUrl ?? undefined}
                >
                  <source src={game.trailers[0].url} type="video/mp4" />
                </video>
                <span className="ps5-trailer-title">{game.trailers[0].name}</span>
              </div>
            ) : (
              <p className="ps5-ratings-note" role="status">No trailer is available from the catalog for this game.</p>
            )}

            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 14, color: "#fff" }}>Screenshots & Artwork Gallery</h3>
              <MediaGallery images={game.images} />
            </div>
          </section>

          {/* 5-STAR RATINGS & JOURNAL */}
          <section ref={ratingsRef} className="ps5-details-section" tabIndex={-1}>
            <div className="ps5-details-header-row">
              <h2 className="ps5-details-title">Your ratings and notes</h2>
              <button
                type="button"
                className="ps5-launch-modal-btn"
                onClick={openLibraryEditor}
                disabled={authLoading}
              >
                {authLoading ? "Checking account…" : inLibrary ? "Edit library entry" : "Add to library"}
              </button>
            </div>

            <div className="ps5-ratings-grid">
              <div className="ps5-ratings-box">
                <h3>Rate across five dimensions (1–10)</h3>
                <p className="ps5-ratings-note">Rate each field independently. Your ratings remain private to your account.</p>
                {ratingSaving && <p className="ps5-ratings-note" role="status">Saving your rating…</p>}

                {ratingNames.map((field) => (
                  <div className="ps5-score-row" key={field}>
                    <div className="ps5-score-label">
                      <span className="ps5-score-name">{field}</span>
                      <strong className="ps5-score-val">
                        {ratings[field] !== null ? `${ratings[field]} / 10` : "Not rated"}
                      </strong>
                    </div>

                    <div className="ps5-pills-cluster" role="group" aria-label={`${field} rating`}>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`ps5-rating-pill ${ratings[field] === value ? "ps5-rating-pill-active" : ""}`}
                          onClick={() => void saveRating(field, value)}
                          aria-pressed={ratings[field] === value}
                          disabled={authLoading || ratingSaving}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="ps5-quick-journal-card">
                <h3>{inLibrary ? "Your library entry" : "Track your progress"}</h3>
                {inLibrary ? (
                  <div className="ps5-vault-quick-meta">
                    <div className="ps5-quick-stat">
                      <span>Status</span>
                      <strong>{status.replaceAll("_", " ").toUpperCase()}</strong>
                    </div>
                    <div className="ps5-quick-stat">
                      <span>Logged Playtime</span>
                      <strong>{playtimeMinutes > 0 ? `${formatPlaytime(playtimeMinutes)} logged` : "Not logged"}</strong>
                    </div>
                    <div className="ps5-quick-stat">
                      <span>Favorite</span>
                      <strong>{favorite ? "YES" : "NO"}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="ps5-ratings-note">
                    {authLoading
                      ? "Checking your library…"
                      : libraryError
                        ? "Your library entry could not be loaded."
                        : authenticated
                          ? "No personal library entry yet."
                          : "Sign in to save your progress."}
                  </p>
                )}
                <button
                  type="button"
                  className="ps5-vault-open-btn"
                  onClick={openLibraryEditor}
                  disabled={authLoading}
                >
                  {authLoading ? "Checking account…" : inLibrary ? "Edit library entry" : "Add to library"}
                </button>
              </div>
            </div>
          </section>

          <section ref={trophiesRef} className="ps5-details-section" tabIndex={-1}>
            <h2 className="ps5-details-title">Catalog achievements</h2>
            {game.achievements.length > 0 ? (
              <div className="ps5-achievements-list">
                {game.achievements.map((achievement) => (
                  <div className="ps5-trophy-item-card" key={achievement.id}>
                    {achievement.iconUrl ? (
                      <Image className="ps5-trophy-img" src={achievement.iconUrl} alt="" width={52} height={52} />
                    ) : (
                      <div className="ps5-trophy-img-fallback" aria-hidden="true"><Trophy size={22} /></div>
                    )}
                    <div className="ps5-trophy-info">
                      <strong>{achievement.name}</strong>
                      <p>{achievement.description}</p>
                    </div>
                    {achievement.rarity !== null && <span className="ps5-trophy-rarity-badge">Catalog rarity: {achievement.rarity}%</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="ps5-ratings-note">Achievement details are not available in the catalog.</p>
            )}
            <p className="ps5-ratings-note">GameVault does not synchronize trophy or achievement progress from console accounts.</p>
          </section>

          {/* PC REQUIREMENTS */}
          {game.requirements && (
            <section ref={requirementsRef} className="ps5-details-section" tabIndex={-1}>
              <h2 className="ps5-details-title">PC Requirements</h2>
              <div className="ps5-specs-box">
                <pre>{game.requirements}</pre>
              </div>
            </section>
          )}

          {game.similar.length > 0 && (
            <div ref={similarRef} className="details-similar-games" tabIndex={-1}>
              <GameRail title="Similar Games You Might Enjoy" games={game.similar} />
            </div>
          )}
        </div>
      </div>

      {/* GAMING VAULT ARMORY MODAL */}
      {isModalOpen && (
        <GameVaultModal
          game={game}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSaved={() => void refreshLibraryState()}
        />
      )}
    </>
  );
}

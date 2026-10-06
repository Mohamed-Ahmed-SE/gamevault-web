"use client";

import { useEffect, useRef, useState } from "react";
import { focusTrapEdgeIndex } from "@/lib/focus-trap";
import {
  Gamepad2,
  Bookmark,
  CheckCircle2,
  Clock,
  Heart,
  Pause,
  XCircle,
  X,
  Sparkles,
  Save,
  Trash2,
} from "@/components/icons";
import type { GameSummary, GameDetails } from "@/lib/games/types";
import type { GameStatus } from "@/lib/validators";

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

const statusCards: {
  status: GameStatus;
  label: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { status: "playing", label: "Playing", sub: "Currently on this quest", icon: Gamepad2 },
  { status: "backlog", label: "Backlog", sub: "Queued up next", icon: Bookmark },
  { status: "want_to_play", label: "Want to Play", sub: "On your radar", icon: Sparkles },
  { status: "completed", label: "Completed", sub: "Victory achieved", icon: CheckCircle2 },
  { status: "paused", label: "Paused", sub: "Taking a tactical break", icon: Pause },
  { status: "dropped", label: "Dropped", sub: "Left unfinished", icon: XCircle },
];

export function GameVaultModal({
  game,
  isOpen,
  onClose,
  onSaved,
}: {
  game: GameSummary | GameDetails;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (saved: boolean) => void;
}) {
  const [status, setStatus] = useState<GameStatus>("want_to_play");
  const [favorite, setFavorite] = useState(false);
  const [playtimeMinutes, setPlaytimeMinutes] = useState(0);
  const [started, setStarted] = useState("");
  const [completed, setCompleted] = useState("");
  const [notes, setNotes] = useState("");
  const [ratings, setRatings] = useState<Ratings>(emptyRatings);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoading(true);
    setFeedback("");
    setLoadError("");
    setIsSaved(false);
    setStatus("want_to_play");
    setFavorite(false);
    setPlaytimeMinutes(0);
    setStarted("");
    setCompleted("");
    setNotes("");
    setRatings(emptyRatings);

    async function loadLibraryData() {
      try {
        const response = await fetch(`/api/library?gameId=${encodeURIComponent(game.id)}`);
        const libraryState = await response.json();
        if (!response.ok) throw new Error(libraryState.error ?? "Could not load this library record.");
        if (!active) return;

        if (libraryState.game) {
          setIsSaved(true);
          setStatus(libraryState.game.status);
          setPlaytimeMinutes(libraryState.game.playtime_minutes ?? 0);
          setStarted(libraryState.game.started_at ?? "");
          setCompleted(libraryState.game.completed_at ?? "");
          setNotes(libraryState.game.notes ?? "");
        }

        setFavorite(Boolean(libraryState.favorite));
        if (libraryState.ratings) setRatings({ ...emptyRatings, ...libraryState.ratings });
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load this library record.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadLibraryData();

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!submittingRef.current) onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []);
      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
      const edgeIndex = focusTrapEdgeIndex(activeIndex, focusable.length, event.shiftKey);
      if (edgeIndex !== null) {
        event.preventDefault();
        focusable[edgeIndex]?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      active = false;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, game.id, onClose, loadAttempt]);

  if (!isOpen) return null;

  async function saveLibraryEntry() {
    submittingRef.current = true;
    setSubmitting(true);
    setFeedback("");

    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          status,
          favorite,
          playtimeMinutes,
          startedAt: started || null,
          completedAt: completed || null,
          notes: notes || null,
          ratings,
        }),
      });

      const responseBody = await response.json();
      if (!response.ok) throw new Error(responseBody.error ?? "Failed to save game.");

      setIsSaved(true);
      setFeedback("Game record saved to GameVault!");
      onSaved?.(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Could not save.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function removeLibraryEntry() {
    if (!confirm(`Remove ${game.title} from your library?`)) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const response = await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id }),
      });
      let responseBody: { error?: string } = {};
      try {
        responseBody = await response.json();
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
      if (!response.ok) throw new Error(responseBody.error ?? "Could not remove game.");
      setIsSaved(false);
      onSaved?.(false);
      onClose();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not remove game.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function addPlaytimeHours(hoursToAdd: number) {
    setPlaytimeMinutes((prev) => Math.max(0, prev + hoursToAdd * 60));
  }

  const hours = Math.floor(playtimeMinutes / 60);
  const primaryPlatform = game.platforms[0]?.name;
  const bgImage = game.backgroundUrl ?? game.coverUrl ?? "";

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="game-vault-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-game-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Banner with Game Artwork */}
        <div
          className="modal-banner"
          style={bgImage ? { backgroundImage: `url("${bgImage}")` } : undefined}
        >
          <div className="modal-banner-gradient" />
          <div className="modal-banner-header">
            <span className="modal-brand-tag">GAMEVAULT ARMORY</span>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-game-info">
            <div className="modal-game-chips">
              {primaryPlatform && <span className="modal-plat-chip">{primaryPlatform}</span>}
              {game.releaseDate && <span className="modal-year-chip">{game.releaseDate.slice(0, 4)}</span>}
            </div>
            <h2 id="modal-game-title" className="modal-game-title">{game.title}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-scroll-body">
          {loading ? (
            <div className="modal-loading-state">
              <Gamepad2 size={28} className="spin-icon" />
              <span>Accessing personal archive…</span>
            </div>
          ) : loadError ? (
            <div className="modal-load-error" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: Status Selection in a Gaming Way */}
              <div className="modal-section">
                <span className="modal-section-title">MISSION STATUS</span>
                <div className="modal-status-grid">
                  {statusCards.map(({ status: itemStatus, label, sub, icon: Icon }) => {
                    const isSelected = status === itemStatus;
                    return (
                      <button
                        key={itemStatus}
                        type="button"
                        className={`modal-status-card ${isSelected ? "modal-status-card-active" : ""}`}
                        onClick={() => setStatus(itemStatus)}
                      >
                        <div className="modal-status-icon">
                          <Icon size={20} />
                        </div>
                        <div className="modal-status-text">
                          <strong>{label}</strong>
                          <span>{sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Playtime & Favorite HUD */}
              <div className="modal-hud-row">
                {/* Playtime widget */}
                <div className="modal-hud-box">
                  <div className="modal-hud-label">
                    <Clock size={15} />
                    <span>TIME INVESTED</span>
                  </div>
                  <div className="modal-playtime-display">
                    <span className="modal-hours-num">{hours}</span>
                    <span className="modal-hours-unit">HOURS</span>
                  </div>
                  <div className="modal-stepper-row">
                    <button type="button" className="modal-stepper-btn" onClick={() => addPlaytimeHours(1)}>
                      +1h
                    </button>
                    <button type="button" className="modal-stepper-btn" onClick={() => addPlaytimeHours(5)}>
                      +5h
                    </button>
                    <button type="button" className="modal-stepper-btn" onClick={() => addPlaytimeHours(10)}>
                      +10h
                    </button>
                    <button
                      type="button"
                      className="modal-stepper-btn"
                      onClick={() => setPlaytimeMinutes(0)}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Favorite Card */}
                <button
                  type="button"
                  className={`modal-hud-box modal-fav-box ${favorite ? "modal-fav-box-active" : ""}`}
                  onClick={() => setFavorite(!favorite)}
                  aria-pressed={favorite}
                >
                  <div className="modal-hud-label">
                    <Heart size={15} fill={favorite ? "#a3e635" : "none"} />
                    <span>FAVORITE GAME</span>
                  </div>
                  <div className="modal-fav-indicator">
                    <Heart
                      size={36}
                      className={favorite ? "fav-pulse" : ""}
                      fill={favorite ? "#a3e635" : "none"}
                    />
                    <strong>{favorite ? "Favorited in Vault" : "Add to favorites"}</strong>
                  </div>
                </button>
              </div>

              {/* SECTION 3: Dates */}
              <div className="modal-section">
                <span className="modal-section-title">TIMELINE</span>
                <div className="modal-dates-row">
                  <div className="modal-date-field">
                    <label htmlFor="modal-start-date">Started Date</label>
                    <input
                      id="modal-start-date"
                      type="date"
                      value={started}
                      onChange={(e) => setStarted(e.target.value)}
                    />
                  </div>
                  <div className="modal-date-field">
                    <label htmlFor="modal-end-date">Completed Date</label>
                    <input
                      id="modal-end-date"
                      type="date"
                      value={completed}
                      onChange={(e) => setCompleted(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: 5-Part Detailed Rating System */}
              <div className="modal-section">
                <span className="modal-section-title">DETAILED RATINGS (1 – 10)</span>
                <div className="modal-ratings-list">
                  {ratingNames.map((field) => (
                    <div className="modal-rating-row" key={field}>
                      <div className="modal-rating-header">
                        <span className="modal-rating-name">{field}</span>
                        <span className="modal-rating-score">
                          {ratings[field] !== null ? `${ratings[field]} / 10` : "—"}
                        </span>
                      </div>
                      <div className="modal-pills-row" role="group" aria-label={`${field} rating`}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                          <button
                            key={score}
                            type="button"
                            className={`modal-pill ${ratings[field] === score ? "modal-pill-active" : ""}`}
                            onClick={() =>
                              setRatings({
                                ...ratings,
                                [field]: ratings[field] === score ? null : score,
                              })
                            }
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Player Journal / Notes */}
              <div className="modal-section">
                <span className="modal-section-title">PLAYER JOURNAL & LOG</span>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  maxLength={5000}
                  value={notes}
                  placeholder="Record your thoughts, favorite boss fights, or strategies..."
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {feedback && <div className="modal-feedback" role="status">{feedback}</div>}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          {isSaved && (
            <button
              type="button"
              className="modal-delete-btn"
              disabled={submitting}
              onClick={removeLibraryEntry}
            >
              <Trash2 size={15} /> Remove
            </button>
          )}

          <div className="modal-footer-right">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-save-btn"
              disabled={submitting || loading || Boolean(loadError)}
              onClick={saveLibraryEntry}
            >
              <Save size={16} />
              <span>{submitting ? "Saving…" : "Save to Vault"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

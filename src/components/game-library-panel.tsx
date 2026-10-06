"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import type { GameDetails } from "@/lib/games/types";
import type { GameStatus } from "@/lib/validators";

type RatingName = "gameplay" | "story" | "graphics" | "sound" | "overall";
type Ratings = Record<RatingName, number | null>;
type LoadState = "loading" | "unauthenticated" | "ready" | "error";
type LibraryResponse = {
  game: {
    status: GameStatus;
    playtime_minutes: number | null;
    started_at: string | null;
    completed_at: string | null;
    notes: string | null;
  } | null;
  favorite: boolean;
  ratings: Ratings | null;
};
type OptimisticChange = { apply: () => void; rollback: () => void };
type SaveOptions = {
  optimisticChange?: OptimisticChange;
  onFailure?: (message: string) => string;
};

const statuses: [GameStatus, string][] = [
  ["want_to_play", "Want to play"],
  ["backlog", "Backlog"],
  ["playing", "Playing"],
  ["completed", "Completed"],
  ["paused", "Paused"],
  ["dropped", "Dropped"],
];

const ratingNames: RatingName[] = ["gameplay", "story", "graphics", "sound", "overall"];
const emptyRatings: Ratings = {
  gameplay: null,
  story: null,
  graphics: null,
  sound: null,
  overall: null,
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function apiErrorMessage(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null || !("error" in body)) return fallback;
  const message = body.error;
  return typeof message === "string" && message ? message : fallback;
}

async function postLibraryMutation(gameId: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, ...payload }),
  });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(apiErrorMessage(body, "Could not save your changes."));
  if (typeof body !== "object" || body === null) throw new Error("Could not save your changes.");
  const warning = "xpWarning" in body ? body.xpWarning : null;
  return typeof warning === "string" ? warning : "Saved.";
}

export function GameLibraryPanel({ game }: { game: GameDetails }) {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [status, setStatus] = useState<GameStatus>("want_to_play");
  const [favorite, setFavorite] = useState(false);
  const [playtime, setPlaytime] = useState(0);
  const [started, setStarted] = useState("");
  const [completed, setCompleted] = useState("");
  const [notes, setNotes] = useState("");
  const [ratings, setRatings] = useState<Ratings>(emptyRatings);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [busy, setBusy] = useState(false);
  const mutationInFlight = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadLibrary() {
      setLoadState("loading");
      setLoadError("");
      setSaveMessage("");
      setSaveError("");

      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!active) return;

        if (!authData.user) {
          setLoadState("unauthenticated");
          return;
        }

        const response = await fetch(`/api/library?gameId=${encodeURIComponent(game.id)}`);
        const libraryState = await response.json();
        if (!response.ok) {
          throw new Error(apiErrorMessage(libraryState, "Could not load your game record."));
        }
        if (!active) return;

        const libraryRecord = libraryState as LibraryResponse;
        if (libraryRecord.game) {
          setStatus(libraryRecord.game.status);
          setPlaytime(libraryRecord.game.playtime_minutes ?? 0);
          setStarted(libraryRecord.game.started_at ?? "");
          setCompleted(libraryRecord.game.completed_at ?? "");
          setNotes(libraryRecord.game.notes ?? "");
        } else {
          setStatus("want_to_play");
          setPlaytime(0);
          setStarted("");
          setCompleted("");
          setNotes("");
        }
        setFavorite(!!libraryRecord.favorite);
        setRatings(libraryRecord.ratings ? { ...emptyRatings, ...libraryRecord.ratings } : { ...emptyRatings });
        setLoadState("ready");
      } catch (error) {
        if (!active) return;
        setLoadError(errorMessage(error, "Could not load your game record."));
        setLoadState("error");
      }
    }

    void loadLibrary();
    return () => {
      active = false;
    };
  }, [game.id, retryCount]);

  function saveMutation(payload: Record<string, unknown>, options: SaveOptions = {}) {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    options.optimisticChange?.apply();
    setBusy(true);
    setSaveMessage("");
    setSaveError("");

    void postLibraryMutation(game.id, payload)
      .then((message) => {
        setSaveMessage(message);
        router.refresh();
      })
      .catch((error: unknown) => {
        options.optimisticChange?.rollback();
        const message = errorMessage(error, "Could not save your changes.");
        setSaveError(options.onFailure?.(message) ?? message);
      })
      .finally(() => {
        mutationInFlight.current = false;
        setBusy(false);
      });
  }

  function saveProgress() {
    saveMutation({
      status,
      playtimeMinutes: playtime,
      startedAt: started || null,
      completedAt: completed || null,
      notes: notes || null,
    }, {
      onFailure: (message) => `Progress was not saved. Your edits are still here. ${message}`,
    });
  }

  if (loadState === "loading") {
    return (
      <aside className="detail-aside" aria-busy="true">
        <h2>Your game record</h2>
        <p className="page-subtitle" role="status">Loading your private game record…</p>
      </aside>
    );
  }

  if (loadState === "error") {
    return (
      <aside className="detail-aside">
        <h2>Your game record</h2>
        <p className="page-subtitle" role="alert">{loadError}</p>
        <button className="button button-outline" type="button" onClick={() => setRetryCount((count) => count + 1)}>
          Try loading again
        </button>
      </aside>
    );
  }

  if (loadState === "unauthenticated") {
    return (
      <aside className="detail-aside">
        <h2>Track your progress</h2>
        <p className="page-subtitle">Sign in to add this game to your library, rate it, and keep personal notes.</p>
        <a className="button button-primary" href="/auth/login">Sign in to save</a>
      </aside>
    );
  }

  return (
    <aside className="detail-aside">
      <h2>Your game record</h2>
      <label className="field">
        Library status
        <select
          disabled={busy}
          value={status}
          onChange={(event) => {
            const previousStatus = status;
            const nextStatus = event.target.value as GameStatus;
            saveMutation({ status: nextStatus }, {
              optimisticChange: {
                apply: () => setStatus(nextStatus),
                rollback: () => setStatus(previousStatus),
              },
            });
          }}
        >
          {statuses.map(([value, name]) => <option value={value} key={value}>{name}</option>)}
        </select>
      </label>

      <button
        disabled={busy}
        className="button button-outline"
        type="button"
        style={{ width: "100%", margin: "4px 0 14px", color: favorite ? "var(--accent-soft)" : undefined }}
        onClick={() => {
          const previousFavorite = favorite;
          const nextFavorite = !favorite;
          saveMutation({ favorite: nextFavorite }, {
            optimisticChange: {
              apply: () => setFavorite(nextFavorite),
              rollback: () => setFavorite(previousFavorite),
            },
          });
        }}
      >
        <Heart size={16} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
        {favorite ? "Favorited" : "Add to favorites"}
      </button>

      <label className="field">
        Playtime (hours)
        <input
          disabled={busy}
          type="number"
          min="0"
          value={Math.floor(playtime / 60)}
          onChange={(event) => setPlaytime(Number(event.target.value) * 60)}
        />
      </label>

      <div className="form-row">
        <label className="field">
          Started
          <input disabled={busy} type="date" value={started} onChange={(event) => setStarted(event.target.value)} />
        </label>
        <label className="field">
          Completed
          <input disabled={busy} type="date" value={completed} onChange={(event) => setCompleted(event.target.value)} />
        </label>
      </div>

      <label className="field">
        Private notes
        <textarea
          disabled={busy}
          value={notes}
          maxLength={5000}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What do you want to remember?"
        />
      </label>

      <button
        className="button button-light"
        type="button"
        disabled={busy}
        style={{ width: "100%" }}
        onClick={saveProgress}
      >
        {busy ? "Saving progress…" : "Save progress"}
      </button>
      {saveError && <p className="rating-save" role="alert">{saveError}</p>}
      <p className="rating-save" role="status" aria-live="polite">{saveMessage}</p>

      <h2 style={{ marginTop: 25 }}>Your ratings</h2>
      {ratingNames.map((field) => (
        <div className="rating-row" key={field}>
          <span style={{ textTransform: "capitalize" }}>{field}</span>
          <div className="rating-buttons" role="group" aria-label={`${field} rating`}>
            {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
              <button
                disabled={busy}
                type="button"
                key={rating}
                aria-label={`${rating} out of 10`}
                aria-pressed={ratings[field] === rating}
                onClick={() => {
                  const previousRatings = ratings;
                  const nextRatings = { ...ratings, [field]: ratings[field] === rating ? null : rating };
                  saveMutation({ ratings: nextRatings }, {
                    optimisticChange: {
                      apply: () => setRatings(nextRatings),
                      rollback: () => setRatings(previousRatings),
                    },
                  });
                }}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

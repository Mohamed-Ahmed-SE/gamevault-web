"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = { username: string; display_name: string | null; isOwner: boolean };
type GameRecord = { status: string; playtime_minutes: number };
type Library = { games: GameRecord[]; favorites: string[]; ratings: { overall: number | null }[] };
type PageState = { kind: "loading" } | { kind: "private" } | { kind: "ready"; profile: Profile; library: Library } | { kind: "error"; message: string };
const statuses = ["want_to_play", "backlog", "playing", "completed", "paused", "dropped"] as const;
const labels: Record<(typeof statuses)[number], string> = { want_to_play: "Want to play", backlog: "Backlog", playing: "Playing", completed: "Completed", paused: "Paused", dropped: "Dropped" };

export function ProfileStats({ username }: { username: string }) {
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    let current = true;
    async function loadStats() {
      try {
        const profileResponse = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
        const profilePayload = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(profilePayload.error ?? "Profile unavailable.");
        const profile = profilePayload as Profile;
        if (!profile.isOwner) {
          if (current) setState({ kind: "private" });
          return;
        }
        const libraryResponse = await fetch("/api/library/all");
        const libraryPayload = await libraryResponse.json();
        if (!libraryResponse.ok) throw new Error(libraryPayload.error ?? "Stats unavailable.");
        if (current) setState({ kind: "ready", profile, library: libraryPayload as Library });
      } catch (error) {
        if (current) setState({ kind: "error", message: error instanceof Error ? error.message : "Stats unavailable." });
      }
    }
    void loadStats();
    return () => { current = false; };
  }, [username]);

  if (state.kind === "loading") return <div className="page-shell"><div className="skeleton skeleton-hero"/></div>;
  if (state.kind === "private") return <div className="page-shell"><h1 className="page-title">Player stats</h1><p className="page-subtitle">Play history and library details are private to their owner.</p></div>;
  if (state.kind === "error") return <div className="page-shell"><div className="empty-state"><h1>Stats unavailable</h1><p>{state.message}</p><Link className="button button-primary" href="/auth/login">Sign in</Link></div></div>;

  const { profile, library } = state;
  const ratedGames = library.ratings.filter((rating) => rating.overall !== null);
  const averageRating = ratedGames.length ? (ratedGames.reduce((sum, rating) => sum + (rating.overall ?? 0), 0) / ratedGames.length).toFixed(1) : "—";
  const trackedHours = (library.games.reduce((sum, game) => sum + game.playtime_minutes, 0) / 60).toFixed(1);
  return <div className="page-shell">
    <h1 className="page-title">{profile.display_name ?? profile.username}&apos;s stats</h1>
    <p className="page-subtitle">Your private play history, in one place.</p>
    <div className="stat-grid">
      <div className="stat-box"><strong>{library.games.length}</strong><span>Games tracked</span></div>
      {statuses.map((status) => <div className="stat-box" key={status}><strong>{library.games.filter((game) => game.status === status).length}</strong><span>{labels[status]}</span></div>)}
      <div className="stat-box"><strong>{trackedHours}h</strong><span>Playtime</span></div>
      <div className="stat-box"><strong>{averageRating}</strong><span>Average overall rating</span></div>
      <div className="stat-box"><strong>{library.favorites.length}</strong><span>Favorites</span></div>
    </div>
    <Link className="button button-outline" href={`/profile/${encodeURIComponent(username)}`}>Back to profile</Link>
  </div>;
}

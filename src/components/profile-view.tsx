"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameRail } from "./game-rail";
import type { GameSummary } from "@/lib/games/types";

type Profile = { username: string; display_name: string | null; bio: string | null; xp: number; level: number; isOwner: boolean };
type Library = { games: { game_id: string; status: string; playtime_minutes: number }[]; favorites: string[]; ratings: { game_id: string; overall: number | null }[] };

export function ProfileView({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [library, setLibrary] = useState<Library | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileResponse = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
        const profilePayload = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(profilePayload.error);
        const currentProfile = profilePayload as Profile;
        setProfile(currentProfile);
        if (!currentProfile.isOwner) return;

        const libraryResponse = await fetch("/api/library/all");
        const libraryPayload = await libraryResponse.json();
        if (!libraryResponse.ok) throw new Error(libraryPayload.error);
        const currentLibrary = libraryPayload as Library;
        setLibrary(currentLibrary);
        const ids = Array.from(new Set([...currentLibrary.favorites, ...currentLibrary.ratings.filter((rating) => rating.overall !== null).map((rating) => rating.game_id)])).slice(0, 12);
        const records = await Promise.all(ids.map(async (id) => {
          const response = await fetch(`/api/games/${encodeURIComponent(id)}`);
          if (!response.ok) return null;
          return await response.json() as GameSummary;
        }));
        setGames(records.filter((game): game is GameSummary => game !== null));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Profile unavailable.");
      }
    }
    void loadProfile();
  }, [username]);

  if (error) return <div className="empty-state"><h2>Profile unavailable</h2><p>{error}</p><Link className="button button-primary" href="/auth/login">Sign in</Link></div>;
  if (!profile) return <div className="skeleton skeleton-hero"/>;
  return <>
    <div className="profile-hero">
      <div className="avatar">{(profile.display_name ?? profile.username).slice(0, 1).toUpperCase()}</div>
      <div><h1 className="page-title" style={{ margin: 0 }}>{profile.display_name ?? profile.username}</h1><p className="page-subtitle" style={{ margin: 0 }}>@{profile.username} · Level {profile.level} · {profile.xp} XP</p>{profile.bio && <p>{profile.bio}</p>}</div>
      {profile.isOwner && <Link className="button button-outline" style={{ marginLeft: "auto" }} href="/settings">Edit profile</Link>}
    </div>
    {!profile.isOwner ? <div className="empty-state"><h2>Player profile</h2><p>Personal library activity is visible only to its owner.</p></div> : !library ? <div className="skeleton skeleton-hero"/> : <>
      <div className="stat-grid"><div className="stat-box"><strong>{library.games.length}</strong><span>Library</span></div><div className="stat-box"><strong>{library.games.filter((game) => game.status === "playing").length}</strong><span>Playing</span></div><div className="stat-box"><strong>{library.games.filter((game) => game.status === "completed").length}</strong><span>Completed</span></div><div className="stat-box"><strong>{library.games.filter((game) => game.status === "backlog").length}</strong><span>Backlog</span></div><div className="stat-box"><strong>{(library.games.reduce((total, game) => total + game.playtime_minutes, 0) / 60).toFixed(1)}h</strong><span>Tracked time</span></div></div>
      <GameRail title="Favorite games" games={games.filter((game) => library.favorites.includes(game.id))}/>
      <GameRail title="Highest rated" games={games.filter((game) => library.ratings.some((rating) => rating.game_id === game.id && rating.overall !== null))}/>
      {!games.length && <div className="empty-state"><h2>Your profile is getting started</h2><p>Add favorites and ratings to build your personal game archive.</p><Link className="button button-primary" href="/discover">Discover games</Link></div>}
    </>}
  </>;
}

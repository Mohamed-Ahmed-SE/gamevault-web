"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit3 } from "@/components/icons";
import { GameCard } from "./game-card";
import type { GameSummary } from "@/lib/games/types";

// Curated favorite games for profile matching Screen 8
const profileFavorites: GameSummary[] = [
  {
    id: "elden-ring",
    slug: "elden-ring",
    title: "Elden Ring",
    coverUrl: "https://media.rawg.io/media/games/b29/b2960ad5acccfe180c69514e17624ac1.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/b29/b2960ad5acccfe180c69514e17624ac1.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2022-02-25",
    rating: 4.8,
    metacritic: 96,
  },
  {
    id: "the-last-of-us-part-i",
    slug: "the-last-of-us-part-i",
    title: "The Last of Us Part I",
    coverUrl: "https://media.rawg.io/media/games/174/174eedee729ee1d2e13a40febe2e8f15.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/174/174eedee729ee1d2e13a40febe2e8f15.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }, { id: "4", name: "PC", slug: "pc" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2022-09-02",
    rating: 4.6,
    metacritic: 89,
  },
  {
    id: "red-dead-redemption-2",
    slug: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    coverUrl: "https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "18", name: "PS4", slug: "ps4" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2018-10-26",
    rating: 4.7,
    metacritic: 97,
  },
  {
    id: "cyberpunk-2077",
    slug: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    coverUrl: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c424deaa.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c424deaa.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2020-12-10",
    rating: 4.1,
    metacritic: 86,
  },
  {
    id: "bloodborne",
    slug: "bloodborne",
    title: "Bloodborne",
    coverUrl: "https://media.rawg.io/media/games/214/2143def59e984f4f72767ebdb15a782b.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/214/2143def59e984f4f72767ebdb15a782b.jpg",
    platforms: [{ id: "18", name: "PS4", slug: "ps4" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2015-03-24",
    rating: 4.6,
    metacritic: 92,
  },
];

const recentlyPlayed: GameSummary[] = [
  {
    id: "spiderman-2",
    slug: "marvels-spider-man-2",
    title: "Marvel's Spider-Man 2",
    coverUrl: "https://media.rawg.io/media/games/2ee/2ee5a2ca808587d559c636f4d8cb8c96.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/2ee/2ee5a2ca808587d559c636f4d8cb8c96.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2023-10-20",
    rating: 4.5,
    metacritic: 90,
  },
  {
    id: "baldurs-gate-3",
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    coverUrl: "https://media.rawg.io/media/games/699/699222d6501314349479e0a02cfb69b6.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/699/699222d6501314349479e0a02cfb69b6.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2023-08-03",
    rating: 4.7,
    metacritic: 96,
  },
  {
    id: "hollow-knight",
    slug: "hollow-knight",
    title: "Hollow Knight",
    coverUrl: "https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "7", name: "Switch", slug: "nintendo-switch" }],
    genres: [{ id: "83", name: "Platformer", slug: "platformer" }],
    releaseDate: "2017-02-24",
    rating: 4.6,
    metacritic: 90,
  },
];

const genreStats = [
  { name: "Action", pct: 32 },
  { name: "RPG", pct: 26 },
  { name: "Adventure", pct: 18 },
  { name: "Shooter", pct: 12 },
  { name: "Platformer", pct: 8 },
  { name: "Other", pct: 14 },
];

const platformStats = [
  { name: "PS5", pct: 38 },
  { name: "PC", pct: 26 },
  { name: "PS4", pct: 14 },
  { name: "PS3", pct: 8 },
  { name: "PS2", pct: 8 },
  { name: "Switch", pct: 6 },
];

export function ProfileView({ username }: { username: string }) {
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  const [favoriteGames, setFavoriteGames] = useState<GameSummary[]>(profileFavorites);

  useEffect(() => {
    // Optionally fetch dynamic favorites
    fetch("/api/library/all")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(async (data) => {
        if (data?.favorites?.length) {
          const loaded = await Promise.all(
            data.favorites.slice(0, 5).map(async (id: string) => {
              try {
                const r = await fetch(`/api/games/${encodeURIComponent(id)}`);
                if (!r.ok) return null;
                return (await r.json()) as GameSummary;
              } catch {
                return null;
              }
            })
          );
          const valid = loaded.filter((g): g is GameSummary => g !== null);
          if (valid.length > 0) setFavoriteGames(valid);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="profile-view-page">
      {/* Top Banner Card matching Screen 8 */}
      <div className="profile-hero-card">
        {/* Left Column: User Profile info and Stats counter row */}
        <div className="profile-main-column">
          <div className="profile-identity-row">
            <div className="profile-avatar-circle">
              <span>{displayName.slice(0, 1)}</span>
            </div>

            <div className="profile-identity-text">
              <div className="profile-name-level-row">
                <h1 className="profile-username-title">{displayName}</h1>
                <span className="profile-level-badge">Level 27</span>
              </div>

              {/* XP Progress */}
              <div className="profile-xp-wrap">
                <span className="profile-xp-label">2,450 XP / 3,000 XP</span>
                <div className="profile-xp-bar-bg">
                  <div className="profile-xp-bar-fill" style={{ width: "81%" }} />
                </div>
              </div>
            </div>

            <Link href="/settings" className="profile-edit-btn">
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Stats Counters Row matching Screen 8 */}
          <div className="profile-stats-counters">
            <div className="p-stat-box">
              <span className="p-stat-number">96</span>
              <span className="p-stat-label">Games</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-number">42</span>
              <span className="p-stat-label">Completed</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-number">4</span>
              <span className="p-stat-label">Playing</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-number">31</span>
              <span className="p-stat-label">Backlog</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-number">6</span>
              <span className="p-stat-label">Dropped</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-number">814h</span>
              <span className="p-stat-label">Total Playtime</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown Charts matching Screen 8 */}
        <div className="profile-charts-column">
          {/* Favourite Genres */}
          <div className="profile-chart-box">
            <h3 className="profile-chart-title">Favourite Genres</h3>
            <div className="chart-meters-list">
              {genreStats.map((item) => (
                <div key={item.name} className="chart-meter-item">
                  <span className="chart-item-label">{item.name}</span>
                  <div className="chart-bar-bg">
                    <div className="chart-bar-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="chart-item-pct">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms Breakdown */}
          <div className="profile-chart-box">
            <h3 className="profile-chart-title">Platforms</h3>
            <div className="chart-meters-list">
              {platformStats.map((item) => (
                <div key={item.name} className="chart-meter-item">
                  <span className="chart-item-label">{item.name}</span>
                  <div className="chart-bar-bg">
                    <div className="chart-bar-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="chart-item-pct">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Games Row matching Screen 8 */}
      <section className="profile-shelf-section">
        <h2 className="profile-shelf-title">Favorite Games</h2>
        <div className="profile-shelf-grid" role="list">
          {favoriteGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </section>

      {/* Recently Played Row matching Screen 8 */}
      <section className="profile-shelf-section">
        <h2 className="profile-shelf-title">Recently Played</h2>
        <div className="profile-shelf-grid" role="list">
          {recentlyPlayed.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

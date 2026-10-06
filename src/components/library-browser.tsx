"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Grid, List, Search } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { GameCard } from "./game-card";

type LibraryStatusType = "all" | "playing" | "backlog" | "completed" | "paused" | "dropped";

type ShowcaseGame = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  platforms: { id: string; name: string; slug: string }[];
  genres: { id: string; name: string; slug: string }[];
  releaseDate: string;
  rating: number;
  metacritic: number | null;
  status: "playing" | "backlog" | "completed" | "paused" | "dropped";
  progress?: number;
};

// Curated library matching Screen 5 reference
const showcaseLibraryGames: ShowcaseGame[] = [
  {
    id: "spiderman-2",
    slug: "marvels-spider-man-2",
    title: "Marvel's Spider-Man 2",
    coverUrl: "https://media.rawg.io/media/games/2ee/2ee5a2ca808587d559c636f4d8cb8c96.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2023-10-20",
    rating: 4.5,
    metacritic: 90,
    status: "playing",
    progress: 65,
  },
  {
    id: "elden-ring",
    slug: "elden-ring",
    title: "Elden Ring",
    coverUrl: "https://media.rawg.io/media/games/b29/b2960ad5acccfe180c69514e17624ac1.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2022-02-25",
    rating: 4.8,
    metacritic: 96,
    status: "completed",
  },
  {
    id: "cyberpunk-2077",
    slug: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    coverUrl: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c424deaa.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2020-12-10",
    rating: 4.1,
    metacritic: 86,
    status: "playing",
    progress: 45,
  },
  {
    id: "baldurs-gate-3",
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    coverUrl: "https://media.rawg.io/media/games/699/699222d6501314349479e0a02cfb69b6.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2023-08-03",
    rating: 4.7,
    metacritic: 96,
    status: "backlog",
  },
  {
    id: "red-dead-redemption-2",
    slug: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    coverUrl: "https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "18", name: "PS4", slug: "ps4" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2018-10-26",
    rating: 4.7,
    metacritic: 97,
    status: "completed",
  },
  {
    id: "the-last-of-us-part-i",
    slug: "the-last-of-us-part-i",
    title: "The Last of Us Part I",
    coverUrl: "https://media.rawg.io/media/games/174/174eedee729ee1d2e13a40febe2e8f15.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }, { id: "4", name: "PC", slug: "pc" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2022-09-02",
    rating: 4.6,
    metacritic: 89,
    status: "completed",
  },
  {
    id: "hollow-knight",
    slug: "hollow-knight",
    title: "Hollow Knight",
    coverUrl: "https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg",
    platforms: [{ id: "4", name: "PC", slug: "pc" }, { id: "7", name: "Switch", slug: "nintendo-switch" }],
    genres: [{ id: "83", name: "Platformer", slug: "platformer" }],
    releaseDate: "2017-02-24",
    rating: 4.6,
    metacritic: 90,
    status: "playing",
  },
  {
    id: "god-of-war-ragnarok",
    slug: "god-of-war-ragnarok",
    title: "God of War Ragnarök",
    coverUrl: "https://media.rawg.io/media/games/7a2/7a2500ee8b2c0e1ff268bb7264843047.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }, { id: "18", name: "PS4", slug: "ps4" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2022-11-09",
    rating: 4.8,
    metacritic: 94,
    status: "paused",
  },
];

const statusTabs: { id: LibraryStatusType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "playing", label: "Playing" },
  { id: "backlog", label: "Backlog" },
  { id: "completed", label: "Completed" },
  { id: "paused", label: "Paused" },
  { id: "dropped", label: "Dropped" },
];

export function LibraryBrowser({ initialTab = "all" }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState<LibraryStatusType>(
    (initialTab as LibraryStatusType) || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recently_added");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [dbGames, setDbGames] = useState<ShowcaseGame[] | null>(null);

  useEffect(() => {
    // Attempt loading real Supabase library data if available
    fetch("/api/library/all")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(async (payload) => {
        if (payload?.games?.length) {
          // Fetch catalog games for entries
          const resolved = await Promise.all(
            payload.games.map(async (record: { game_id: string; status: string }) => {
              try {
                const r = await fetch(`/api/games/${encodeURIComponent(record.game_id)}`);
                if (!r.ok) return null;
                const g: GameSummary = await r.json();
                return {
                  id: g.id,
                  slug: g.slug,
                  title: g.title,
                  coverUrl: g.coverUrl ?? g.backgroundUrl ?? "",
                  platforms: g.platforms,
                  genres: g.genres,
                  releaseDate: g.releaseDate ?? "",
                  rating: g.rating ?? 4.0,
                  metacritic: g.metacritic,
                  status: record.status as ShowcaseGame["status"],
                } as ShowcaseGame;
              } catch {
                return null;
              }
            })
          );
          const valid = resolved.filter((x): x is ShowcaseGame => x !== null);
          if (valid.length > 0) setDbGames(valid);
        }
      })
      .catch(() => {});
  }, []);

  const allItems = dbGames && dbGames.length > 0 ? dbGames : showcaseLibraryGames;

  const filteredGames = useMemo(() => {
    return allItems.filter((game) => {
      if (activeTab !== "all" && game.status !== activeTab) return false;
      if (
        searchQuery.trim() &&
        !game.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allItems, activeTab, searchQuery]);

  return (
    <div className="library-page-container">
      {/* Top Header Row with Title and Search Input */}
      <div className="library-header-row">
        <h1 className="library-page-title">My Library</h1>

        <div className="library-search-box">
          <Search size={16} className="library-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="library-search-input"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="library-status-tabs" role="tablist">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`library-tab-btn ${activeTab === tab.id ? "library-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls Bar: Sort by & View Toggle */}
      <div className="library-controls-bar">
        <div className="library-sort-wrap">
          <span className="sort-label">Sort by:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recently_added">Recently Added</option>
            <option value="rating">Top Rated</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>

        <div className="view-mode-toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "grid" ? "view-mode-active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "list" ? "view-mode-active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Games Grid matching Screen 5 */}
      {filteredGames.length > 0 ? (
        <div
          className={viewMode === "grid" ? "library-games-grid" : "library-games-list"}
          role="list"
        >
          {filteredGames.map((game, index) => {
            const statusBadge = (
              <div className={`status-badge-pill status-${game.status}`}>
                <span className="status-name">
                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                </span>
                {game.progress && (
                  <span className="status-progress-num">{game.progress}%</span>
                )}
              </div>
            );

            return (
              <GameCard
                key={game.id}
                game={{
                  id: game.id,
                  slug: game.slug,
                  title: game.title,
                  coverUrl: game.coverUrl,
                  backgroundUrl: game.coverUrl,
                  releaseDate: game.releaseDate,
                  rating: game.rating,
                  metacritic: game.metacritic,
                  platforms: game.platforms,
                  genres: game.genres,
                }}
                index={index}
                statusBadge={statusBadge}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No games in this section</h2>
          <p>You haven&apos;t marked any games as {activeTab} yet.</p>
          <Link href="/discover" className="button button-primary">
            Browse Games
          </Link>
        </div>
      )}
    </div>
  );
}

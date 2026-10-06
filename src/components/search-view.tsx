"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X, ChevronDown } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { GameCard } from "./game-card";

const searchTabs = ["Games", "Platforms", "Genres", "Developers", "Publishers"];

const suggestedPlatforms = [
  { name: "PlayStation 5", slug: "ps5" },
  { name: "PlayStation 4", slug: "ps4" },
  { name: "PC", slug: "pc" },
  { name: "PlayStation 3", slug: "ps3" },
  { name: "PlayStation 2", slug: "ps2" },
  { name: "Xbox Series X|S", slug: "xbox-series" },
];

const suggestedGenres = [
  { name: "Action", slug: "action" },
  { name: "Adventure", slug: "adventure" },
  { name: "Open World", slug: "open-world" },
  { name: "Superhero", slug: "superhero" },
];

export function SearchView({ initialQuery = "spider" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("Games");
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setGames([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      fetch(`/api/games/search?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Search service unavailable");
          const data = await res.json();
          return data.games as GameSummary[];
        })
        .then((items) => {
          setGames(items);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          setError(err instanceof Error ? err.message : "Search error");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="search-view-page">
      {/* Top Search Bar with User Chip */}
      <div className="search-top-row">
        <div className="search-input-box">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-main-input"
            placeholder="Search games, platforms, developers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* User avatar on right matching Screen 3 */}
        <Link href="/profile/mohamed" className="search-user-badge">
          <div className="user-avatar-circle">
            <span>M</span>
          </div>
          <span className="search-user-name">Mohamed</span>
          <ChevronDown size={14} />
        </Link>
      </div>

      {/* Filter Tabs underneath search input */}
      <div className="search-category-tabs">
        {searchTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`search-tab-pill ${activeTab === tab ? "search-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results Section */}
      <section className="search-results-section" aria-label="Search results">
        <h2 className="search-section-heading">Games</h2>

        {loading ? (
          <div className="results-grid" role="status">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="skeleton skeleton-card" key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>Search unavailable</h2>
            <p>{error}</p>
          </div>
        ) : games.length > 0 ? (
          <div className="search-games-grid" role="list">
            {games.map((game, idx) => (
              <GameCard game={game} index={idx} key={game.id} />
            ))}
          </div>
        ) : query ? (
          <div className="empty-state">
            <h2>No results for &ldquo;{query}&rdquo;</h2>
            <p>Try searching for another game title or genre.</p>
          </div>
        ) : (
          <div className="empty-state">
            <h2>Search GAMEHUB</h2>
            <p>Type a game title or keyword above.</p>
          </div>
        )}
      </section>

      {/* Suggested Sections matching Screen 3 */}
      <div className="search-suggestions-container">
        <div className="suggested-group">
          <h3 className="suggested-title">Suggested Platforms</h3>
          <div className="suggested-pills-row">
            {suggestedPlatforms.map((p) => (
              <button
                key={p.slug}
                type="button"
                className="suggested-pill-btn"
                onClick={() => setQuery(p.name)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="suggested-group">
          <h3 className="suggested-title">Suggested Genres</h3>
          <div className="suggested-pills-row">
            {suggestedGenres.map((g) => (
              <button
                key={g.slug}
                type="button"
                className="suggested-pill-btn"
                onClick={() => setQuery(g.name)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

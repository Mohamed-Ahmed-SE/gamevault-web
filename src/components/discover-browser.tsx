"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
} from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { parseSearchParams } from "@/lib/games/search-params";
import { GameCard } from "./game-card";

type SearchPageResult = { games: GameSummary[]; count: number; pageSize: number };

const quickPills = [
  { id: "all", label: "All", sort: "-added" },
  { id: "trending", label: "Trending", sort: "-rating" },
  { id: "new-releases", label: "New Releases", sort: "-released" },
  { id: "top-rated", label: "Top Rated", sort: "-metacritic" },
  { id: "most-anticipated", label: "Most Anticipated", sort: "-added" },
  { id: "ps2-classics", label: "PS2 Classics", platform: "ps2" },
  { id: "ps3-classics", label: "PS3 Classics", platform: "ps3" },
];

const platformList = [
  { slug: "ps5", name: "PS5" },
  { slug: "ps4", name: "PS4" },
  { slug: "ps3", name: "PS3" },
  { slug: "ps2", name: "PS2" },
  { slug: "xbox-series", name: "Xbox Series X|S" },
  { slug: "xbox-one", name: "Xbox One" },
  { slug: "nintendo-switch", name: "Nintendo Switch" },
  { slug: "pc", name: "PC" },
];

const genreList = [
  { slug: "action", name: "Action" },
  { slug: "adventure", name: "Adventure" },
  { slug: "role-playing-games-rpg", name: "RPG" },
  { slug: "shooter", name: "Shooter" },
  { slug: "indie", name: "Indie" },
  { slug: "strategy", name: "Strategy" },
  { slug: "puzzle", name: "Puzzle" },
  { slug: "platformer", name: "Platformer" },
];

export function DiscoverBrowser({ initialPlatform }: { initialPlatform?: string }) {
  const searchParams = useSearchParams();

  const [games, setGames] = useState<GameSummary[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [activePill, setActivePill] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    genres: true,
    year: false,
    rating: false,
    metacritic: false,
  });

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialPlatform ? [initialPlatform] : searchParams.get("platform")?.split(",") || []
  );
  const [genre, setGenre] = useState(searchParams.get("genre") ?? "");
  const [year, setYear] = useState(searchParams.get("year") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "-added");
  const [minRating, setMinRating] = useState(searchParams.get("rating") ?? "");
  const [page, setPage] = useState(parseSearchParams(searchParams).page ?? 1);

  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  // Sync state from URL
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setGenre(searchParams.get("genre") ?? "");
    setYear(searchParams.get("year") ?? "");
    setSort(searchParams.get("sort") ?? "-added");
    setPage(parseSearchParams(searchParams).page ?? 1);
    if (!initialPlatform) {
      const p = searchParams.get("platform");
      setSelectedPlatforms(p ? p.split(",") : []);
    }
  }, [searchParams, initialPlatform]);

  // Fetch games
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);

      const activePlatform = selectedPlatforms[0] ?? (initialPlatform ?? "");
      if (activePlatform) params.set("platform", activePlatform);
      if (genre) params.set("genre", genre);
      if (year) params.set("year", year);
      if (sort) params.set("sort", sort);
      if (minRating) params.set("minRating", minRating);
      if (page > 1) params.set("page", String(page));

      setLoading(true);
      setError("");

      fetch(`/api/games/search?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Catalog unavailable.");
          return data as SearchPageResult;
        })
        .then((result) => {
          setGames(result.games);
          setCount(result.count);
          setPageSize(result.pageSize);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setGames([]);
          setError(err instanceof Error ? err.message : "Catalog unavailable.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedPlatforms, initialPlatform, genre, year, sort, minRating, page, retry]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePillClick = (pill: typeof quickPills[number]) => {
    setActivePill(pill.id);
    setPage(1);
    if (pill.platform) {
      setSelectedPlatforms([pill.platform]);
    } else {
      setSelectedPlatforms([]);
    }
    if (pill.sort) {
      setSort(pill.sort);
    }
  };

  const togglePlatform = (slug: string) => {
    setPage(1);
    setSelectedPlatforms((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setFilterSearch("");
    setQuery("");
    setSelectedPlatforms(initialPlatform ? [initialPlatform] : []);
    setGenre("");
    setYear("");
    setMinRating("");
    setSort("-added");
    setActivePill("all");
    setPage(1);
  };

  return (
    <div className="discover-page-container">
      {/* Top Header & Quick Filter Pills */}
      <div className="discover-header-section">
        <h1 className="discover-title">Discover</h1>

        <div className="quick-filter-pills" role="tablist" aria-label="Browse Categories">
          {quickPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={`pill-btn ${activePill === pill.id ? "pill-btn-active" : ""}`}
              onClick={() => handlePillClick(pill)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="discover-main-layout">
        {/* Left Filter Sidebar */}
        <aside className="discover-filter-column" aria-label="Filter games">
          <div className="filter-header-row">
            <span className="filter-heading-text">Filters</span>
            <button type="button" className="filter-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          </div>

          {/* Search filters input */}
          <div className="filter-search-box">
            <input
              type="text"
              placeholder="Search filters..."
              value={filterSearch}
              onChange={(e) => {
                setFilterSearch(e.target.value);
                setQuery(e.target.value);
                setPage(1);
              }}
              className="filter-search-input"
            />
          </div>

          {/* Platforms Checkbox List */}
          <div className="filter-group">
            <h3 className="filter-group-title">Platforms</h3>
            <div className="filter-checkbox-list">
              {platformList.map((p) => (
                <label key={p.slug} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(p.slug)}
                    onChange={() => togglePlatform(p.slug)}
                    className="filter-checkbox"
                  />
                  <span className="filter-checkbox-name">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Genres Accordion */}
          <div className="filter-accordion">
            <button
              type="button"
              className="filter-accordion-header"
              onClick={() => toggleAccordion("genres")}
            >
              <span>Genres</span>
              {openAccordions.genres ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openAccordions.genres && (
              <div className="filter-accordion-body">
                {genreList.map((g) => (
                  <button
                    key={g.slug}
                    type="button"
                    className={`filter-sub-item ${genre === g.slug ? "filter-sub-active" : ""}`}
                    onClick={() => {
                      setGenre(genre === g.slug ? "" : g.slug);
                      setPage(1);
                    }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Release Year Accordion */}
          <div className="filter-accordion">
            <button
              type="button"
              className="filter-accordion-header"
              onClick={() => toggleAccordion("year")}
            >
              <span>Release Year</span>
              {openAccordions.year ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openAccordions.year && (
              <div className="filter-accordion-body">
                {["2024", "2023", "2022", "2021", "2020", "2019", "2018"].map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={`filter-sub-item ${year === y ? "filter-sub-active" : ""}`}
                    onClick={() => {
                      setYear(year === y ? "" : y);
                      setPage(1);
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rating Accordion */}
          <div className="filter-accordion">
            <button
              type="button"
              className="filter-accordion-header"
              onClick={() => toggleAccordion("rating")}
            >
              <span>Rating</span>
              {openAccordions.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openAccordions.rating && (
              <div className="filter-accordion-body">
                {[
                  { val: "4.5", label: "4.5 & up" },
                  { val: "4.0", label: "4.0 & up" },
                  { val: "3.5", label: "3.5 & up" },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    className={`filter-sub-item ${minRating === r.val ? "filter-sub-active" : ""}`}
                    onClick={() => {
                      setMinRating(minRating === r.val ? "" : r.val);
                      setPage(1);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Games Area */}
        <section className="discover-catalog-area">
          {/* Top Sort & View toggle toolbar */}
          <div className="discover-controls-bar">
            <div className="sort-dropdown-wrap">
              <span className="sort-label">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="sort-select"
              >
                <option value="-added">Most Popular</option>
                <option value="-rating">Top Rated</option>
                <option value="-released">New Releases</option>
                <option value="name">Alphabetical</option>
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

          {/* Results grid */}
          {error ? (
            <div className="empty-state">
              <h2>Catalog unavailable</h2>
              <p>{error}</p>
              <button className="button button-primary" onClick={() => setRetry((r) => r + 1)}>
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="results-grid" role="status">
              {Array.from({ length: 12 }, (_, i) => (
                <div className="skeleton skeleton-card" key={i} />
              ))}
            </div>
          ) : games.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid" ? "discover-games-grid" : "discover-games-list"
                }
                role="list"
              >
                {games.map((game, index) => (
                  <GameCard
                    game={game}
                    index={(page - 1) * pageSize + index}
                    key={game.id}
                  />
                ))}
              </div>

              {pageCount > 1 && (
                <nav className="catalog-pagination-row" aria-label="Catalog pages">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ArrowLeft size={15} /> Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {pageCount}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={page >= pageCount || loading}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h2>No games found</h2>
              <p>Try resetting or changing your search filters.</p>
              <button className="button button-primary" onClick={clearFilters}>
                Reset filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

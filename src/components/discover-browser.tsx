"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import type { GameSummary } from "@/lib/games/types";
import { parseSearchParams } from "@/lib/games/search-params";
import { PLATFORMS } from "@/lib/games/platforms";
import { GameCard } from "./game-card";

type SearchPageResult = { games: GameSummary[]; count: number; pageSize: number };

export function DiscoverBrowser({ initialPlatform }: { initialPlatform?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [genre, setGenre] = useState(searchParams.get("genre") ?? "");
  const [year, setYear] = useState(searchParams.get("year") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "-added");
  const [page, setPage] = useState(parseSearchParams(searchParams).page ?? 1);
  const platform = initialPlatform ?? searchParams.get("platform") ?? "";
  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setGenre(searchParams.get("genre") ?? "");
    setYear(searchParams.get("year") ?? "");
    setSort(searchParams.get("sort") ?? "-added");
    setPage(parseSearchParams(searchParams).page ?? 1);
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (platform && !initialPlatform) params.set("platform", platform);
      if (genre) params.set("genre", genre);
      if (year) params.set("year", year);
      if (sort) params.set("sort", sort);
      if (page > 1) params.set("page", String(page));
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });

      const requestParams = new URLSearchParams(params);
      if (platform) requestParams.set("platform", platform);
      setLoading(true);
      setError("");
      fetch(`/api/games/search?${requestParams}`, { signal: controller.signal })
        .then(async (response) => {
          const searchResponse = await response.json();
          if (!response.ok) throw new Error(searchResponse.error ?? "Catalog unavailable.");
          return searchResponse as SearchPageResult;
        })
        .then((searchResult) => {
          setGames(searchResult.games);
          setCount(searchResult.count);
          setPageSize(searchResult.pageSize);
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          setGames([]);
          setError(reason instanceof Error ? reason.message : "Catalog unavailable.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, platform, genre, year, sort, page, pathname, router, initialPlatform, retry]);

  function changePlatform(platformSlug: string) {
    if (initialPlatform) return;
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (platformSlug) params.set("platform", platformSlug);
    else params.delete("platform");
    params.delete("page");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  function resetFilters() {
    setQuery("");
    setGenre("");
    setYear("");
    setSort("-added");
    setPage(1);
  }

  return <>
    <div className="search-form">
      <label style={{ position: "relative", flex: 1 }}>
        <Search size={17} style={{ position: "absolute", left: 14, top: 14, color: "#92989b" }} />
        <input className="search-input" style={{ paddingLeft: 42 }} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by game title…" aria-label="Search games" />
      </label>
    </div>
    <div className="filters">
      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#999", fontSize: 12 }}><SlidersHorizontal size={15} /> FILTERS</span>
      <select className="filter-select" value={platform} onChange={(event) => changePlatform(event.target.value)} aria-label="Platform">
        <option value="">All platforms</option>
        {Object.entries(PLATFORMS).map(([key, platformOption]) => <option key={key} value={key}>{platformOption.name}</option>)}
      </select>
      <select className="filter-select" value={genre} onChange={(event) => { setGenre(event.target.value); setPage(1); }} aria-label="Genre">
        <option value="">All genres</option>
        {[["action", "Action"], ["adventure", "Adventure"], ["role-playing-games-rpg", "RPG"], ["shooter", "Shooter"], ["indie", "Indie"], ["strategy", "Strategy"], ["puzzle", "Puzzle"], ["platformer", "Platformer"]].map(([genreValue, genreName]) => <option key={genreValue} value={genreValue}>{genreName}</option>)}
      </select>
      <select className="filter-select" value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }} aria-label="Release year">
        <option value="">Any year</option>
        {Array.from({ length: 35 }, (_, index) => String(new Date().getFullYear() - index)).map((releaseYear) => <option key={releaseYear}>{releaseYear}</option>)}
      </select>
      <select className="filter-select" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort order">
        <option value="-added">Recently added</option><option value="-released">Release date</option><option value="-rating">Community rating</option><option value="name">Alphabetical</option>
      </select>
      <button className="button button-outline" onClick={resetFilters}>Reset filters</button>
    </div>
    {error ? <div className="empty-state"><h2>Catalog unavailable</h2><p>{error}</p><button className="button button-primary" onClick={() => setRetry((retryCount) => retryCount + 1)}>Try again</button></div>
      : loading ? <div className="results-grid" aria-label="Loading games">{Array.from({ length: 8 }, (_, index) => <div className="skeleton skeleton-card" key={index} />)}</div>
        : games.length ? <>
          <div className="section-heading"><p>{count.toLocaleString()} games · page {page} of {pageCount}</p></div>
          <div className="results-grid">{games.map((game, index) => <GameCard game={game} index={(page - 1) * pageSize + index} key={game.id} />)}</div>
          {pageCount > 1 && <nav className="filters" aria-label="Catalog pages">
            <button className="button button-outline" disabled={page <= 1 || loading} onClick={() => setPage((pageNumber) => Math.max(1, pageNumber - 1))}><ArrowLeft size={15} /> Previous</button>
            <span aria-live="polite">Page {page} of {pageCount}</span>
            <button className="button button-outline" disabled={page >= pageCount || loading} onClick={() => setPage((pageNumber) => Math.min(pageCount, pageNumber + 1))}>Next <ArrowRight size={15} /></button>
          </nav>}
        </> : <div className="empty-state"><h2>No games found</h2><p>Try changing your search or filters.</p></div>}
  </>;
}

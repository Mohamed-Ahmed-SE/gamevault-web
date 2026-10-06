"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Check } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";

type UpcomingReleaseItem = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  dateStr: string;
  monthDay: string;
  year: string;
  platforms: string[];
};

const defaultUpcomingGames: UpcomingReleaseItem[] = [
  {
    id: "silent-hill-2",
    slug: "silent-hill-2",
    title: "Silent Hill 2 (Remake)",
    coverUrl: "https://media.rawg.io/media/games/053/0536c49ccca2e99738d4c980998bb279.jpg",
    dateStr: "2024-10-08",
    monthDay: "OCT 08",
    year: "2024",
    platforms: ["PS5", "PC"],
  },
  {
    id: "dragon-quest-3",
    slug: "dragon-quest-iii-hd-2d-remake",
    title: "Dragon Quest III HD-2D Remake",
    coverUrl: "https://media.rawg.io/media/games/618/618c204de10f46123507d93ec1b3cb82.jpg",
    dateStr: "2024-10-24",
    monthDay: "OCT 24",
    year: "2024",
    platforms: ["Switch", "PS5", "PC"],
  },
  {
    id: "black-ops-6",
    slug: "call-of-duty-black-ops-6",
    title: "Call of Duty: Black Ops 6",
    coverUrl: "https://media.rawg.io/media/games/157/15742f2f33e9abe09c65adc7a759b0ac.jpg",
    dateStr: "2024-10-25",
    monthDay: "OCT 25",
    year: "2024",
    platforms: ["PS5", "Xbox", "PC"],
  },
  {
    id: "ac-shadows",
    slug: "assassins-creed-shadows",
    title: "Assassin's Creed Shadows",
    coverUrl: "https://media.rawg.io/media/games/b45/b4557557e82b396787b9d66ee2d4e130.jpg",
    dateStr: "2024-11-15",
    monthDay: "NOV 15",
    year: "2024",
    platforms: ["PS5", "Xbox", "PC"],
  },
  {
    id: "stalker-2",
    slug: "stalker-2-heart-of-chornobyl",
    title: "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
    coverUrl: "https://media.rawg.io/media/games/7cf/7cfc9220b334a7a08903baab4d9e03d9.jpg",
    dateStr: "2024-11-20",
    monthDay: "NOV 20",
    year: "2024",
    platforms: ["Xbox", "PC"],
  },
  {
    id: "indiana-jones",
    slug: "indiana-jones-and-the-great-circle",
    title: "Indiana Jones and the Great Circle",
    coverUrl: "https://media.rawg.io/media/games/562/562553814dd54e001a541e4ee83a5d73.jpg",
    dateStr: "2024-12-09",
    monthDay: "DEC 09",
    year: "2024",
    platforms: ["Xbox", "PC"],
  },
];

const platformFilterPills = [
  { id: "all", label: "All" },
  { id: "ps5", label: "PS5" },
  { id: "ps4", label: "PS4" },
  { id: "ps3", label: "PS3" },
  { id: "ps2", label: "PS2" },
  { id: "xbox", label: "Xbox" },
  { id: "switch", label: "Switch" },
  { id: "pc", label: "PC" },
];

function formatReleaseDate(date: string | null) {
  if (!date) return { monthDay: "TBA", year: "" };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { monthDay: "TBA", year: "" };
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const year = String(d.getFullYear());
  return { monthDay: `${month} ${day}`, year };
}

export function UpcomingView({
  liveGames = [],
}: {
  liveGames?: GameSummary[];
}) {
  const [activePlatform, setActivePlatform] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});

  const items: UpcomingReleaseItem[] = useMemo(() => {
    if (liveGames.length > 0) {
      return liveGames.map((g) => {
        const { monthDay, year } = formatReleaseDate(g.releaseDate);
        return {
          id: g.id,
          slug: g.slug,
          title: g.title,
          coverUrl: g.coverUrl ?? g.backgroundUrl ?? defaultUpcomingGames[0].coverUrl,
          dateStr: g.releaseDate ?? "2025-01-01",
          monthDay,
          year,
          platforms: g.platforms.map((p) =>
            p.name
              .replace("PlayStation ", "PS")
              .replace("Nintendo Switch", "Switch")
              .replace("Xbox Series X|S", "Xbox")
              .replace("Xbox One", "Xbox")
          ),
        };
      });
    }
    return defaultUpcomingGames;
  }, [liveGames]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activePlatform === "all") return true;
      return item.platforms.some((p) =>
        p.toLowerCase().includes(activePlatform.toLowerCase())
      );
    });
  }, [items, activePlatform]);

  const toggleWishlist = (id: string) => {
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="upcoming-view-page">
      {/* Page Title */}
      <div className="upcoming-header-row">
        <h1 className="upcoming-page-title">Upcoming Releases</h1>
      </div>

      {/* Platform Filter Pills & Sort Row */}
      <div className="upcoming-controls-row">
        <div className="upcoming-filter-pills" role="tablist">
          {platformFilterPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={`upcoming-pill-btn ${activePlatform === pill.id ? "upcoming-pill-active" : ""}`}
              onClick={() => setActivePlatform(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="upcoming-sort-wrap">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Release Date</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* List of Upcoming Releases matching Screen 6 */}
      <div className="upcoming-releases-list" role="list">
        {filteredItems.map((game) => {
          const isWishlisted = !!wishlisted[game.id];

          return (
            <div key={game.id} className="upcoming-release-card" role="listitem">
              {/* Left: Date Block */}
              <div className="upcoming-date-box">
                <span className="upcoming-month-day">{game.monthDay}</span>
                <span className="upcoming-year">{game.year}</span>
              </div>

              {/* Game Thumbnail */}
              <Link
                href={`/game/${encodeURIComponent(game.slug)}`}
                className="upcoming-thumb-wrap"
              >
                <div
                  className="upcoming-thumb-image"
                  style={{ backgroundImage: `url("${game.coverUrl}")` }}
                />
              </Link>

              {/* Game Title & Platform Info */}
              <div className="upcoming-info-col">
                <Link
                  href={`/game/${encodeURIComponent(game.slug)}`}
                  className="upcoming-game-title"
                >
                  {game.title}
                </Link>
                <span className="upcoming-platforms-text">
                  {game.platforms.join(" • ")}
                </span>
              </div>

              {/* Action Button: Add to Wishlist */}
              <div className="upcoming-actions-col">
                <button
                  type="button"
                  className={`btn-wishlist ${isWishlisted ? "btn-wishlisted" : ""}`}
                  onClick={() => toggleWishlist(game.id)}
                >
                  {isWishlisted ? (
                    <>
                      <Check size={15} className="text-green" />
                      <span>In Wishlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={15} />
                      <span>+ Add to Wishlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

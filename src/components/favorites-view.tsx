"use client";

import { useEffect, useState } from "react";
import { GameCard } from "./game-card";
import type { GameSummary } from "@/lib/games/types";

// Default curated favorites matching Screen 7 reference
const defaultFavoriteGames: GameSummary[] = [
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
    id: "shadow-of-the-colossus",
    slug: "shadow-of-the-colossus",
    title: "Shadow of the Colossus",
    coverUrl: "https://media.rawg.io/media/games/e88/e883e75eefeb2181559868728d4ea3d5.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/e88/e883e75eefeb2181559868728d4ea3d5.jpg",
    platforms: [{ id: "15", name: "PS2", slug: "ps2" }, { id: "18", name: "PS4", slug: "ps4" }],
    genres: [{ id: "3", name: "Adventure", slug: "adventure" }],
    releaseDate: "2005-10-18",
    rating: 4.6,
    metacritic: 91,
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
  {
    id: "metal-gear-solid-3",
    slug: "metal-gear-solid-3-snake-eater",
    title: "Metal Gear Solid 3: Snake Eater",
    coverUrl: "https://media.rawg.io/media/games/495/495fe725bb7e366fd2f404ee0c1a9bc3.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/495/495fe725bb7e366fd2f404ee0c1a9bc3.jpg",
    platforms: [{ id: "15", name: "PS2", slug: "ps2" }, { id: "16", name: "PS3", slug: "ps3" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2004-11-17",
    rating: 4.7,
    metacritic: 91,
  },
  {
    id: "resident-evil-4",
    slug: "resident-evil-4-2023",
    title: "Resident Evil 4",
    coverUrl: "https://media.rawg.io/media/games/d82/d8236bff545f1f5d1e026117b4c4da2a.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/d82/d8236bff545f1f5d1e026117b4c4da2a.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }, { id: "4", name: "PC", slug: "pc" }],
    genres: [{ id: "4", name: "Action", slug: "action" }],
    releaseDate: "2023-03-24",
    rating: 4.7,
    metacritic: 93,
  },
  {
    id: "final-fantasy-vii-rebirth",
    slug: "final-fantasy-vii-rebirth",
    title: "Final Fantasy VII Rebirth",
    coverUrl: "https://media.rawg.io/media/games/b32/b3272449ab286cfa35ccf10b70d4e908.jpg",
    backgroundUrl: "https://media.rawg.io/media/games/b32/b3272449ab286cfa35ccf10b70d4e908.jpg",
    platforms: [{ id: "187", name: "PS5", slug: "ps5" }],
    genres: [{ id: "5", name: "RPG", slug: "role-playing-games-rpg" }],
    releaseDate: "2024-02-29",
    rating: 4.7,
    metacritic: 92,
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
];

export function FavoritesView() {
  const [games, setGames] = useState<GameSummary[]>(defaultFavoriteGames);

  useEffect(() => {
    // Try to load user favorites from DB if any
    fetch("/api/library/all")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(async (data) => {
        if (data?.favorites?.length) {
          const resolved = await Promise.all(
            data.favorites.map(async (id: string) => {
              try {
                const r = await fetch(`/api/games/${encodeURIComponent(id)}`);
                if (!r.ok) return null;
                return (await r.json()) as GameSummary;
              } catch {
                return null;
              }
            })
          );
          const valid = resolved.filter((g): g is GameSummary => g !== null);
          if (valid.length > 0) setGames(valid);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="favorites-page-container">
      <div className="favorites-header-row">
        <h1 className="favorites-page-title">Favorites</h1>
      </div>

      <div className="favorites-games-grid" role="list">
        {games.map((game, index) => (
          <GameCard game={game} index={index} key={game.id} />
        ))}
      </div>
    </div>
  );
}

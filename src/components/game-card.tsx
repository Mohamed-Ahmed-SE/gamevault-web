import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { GameSummary } from "@/lib/games/types";
export function GameCard({ game, index }: { game: GameSummary; index?: number }) {
  return <Link className="game-card" href={`/game/${encodeURIComponent(game.slug)}`} aria-label={`View ${game.title}`}>
    <div className="game-art" style={game.coverUrl ? { backgroundImage: `linear-gradient(0deg,rgba(8,10,13,.92),transparent 62%),url("${game.coverUrl}")` } : undefined}>
      {!game.coverUrl && <div className="art-fallback">{game.title.slice(0, 1)}</div>}
      <span className="game-index">{String((index ?? 0) + 1).padStart(2, "0")}</span>
      <span className="card-arrow" aria-hidden="true"><ArrowUpRight size={16}/></span>
      <div className="game-card-info"><strong>{game.title}</strong><div className="card-meta"><span>{game.releaseDate?.slice(0, 4) ?? "Release date unknown"}</span>{game.rating !== null && <span><Star size={12} fill="currentColor"/> {game.rating.toFixed(1)}</span>}</div></div>
    </div>
  </Link>;
}

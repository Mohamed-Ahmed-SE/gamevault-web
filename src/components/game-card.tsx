import Link from "next/link";
import { ArrowUpRight, Star } from "@/components/icons";
import type { GameSummary } from "@/lib/games/types";
import { GameCardLogo } from "./game-card-logo";

function getGameScore(game: GameSummary) {
  if (game.metacritic !== null) return `Metacritic ${game.metacritic}/100`;
  if (game.rating !== null && game.rating > 0) return `RAWG ${game.rating.toFixed(1)}/5`;
  return null;
}

function getGameDescription(description: string | undefined) {
  const compact = description?.replace(/\s+/g, " ").trim();
  if (!compact) return null;
  return compact.length > 150 ? `${compact.slice(0, 147).trimEnd()}…` : compact;
}

export function GameCard({
  game,
  index,
  statusBadge,
}: {
  game: GameSummary;
  index?: number;
  statusBadge?: React.ReactNode;
}) {
  const image = game.coverUrl ?? game.backgroundUrl;
  const year = game.releaseDate?.slice(0, 4) || null;
  const platforms = game.platforms.slice(0, 2).map(({ name }) => name
    .replace("PlayStation ", "PS")
    .replace("Nintendo Switch", "Switch")
    .replace("Xbox Series X/S", "Xbox")
    .replace("Xbox Series X|S", "Xbox"));
  const extraPlatformCount = Math.max(0, game.platforms.length - platforms.length);
  const score = getGameScore(game);
  const description = getGameDescription(game.description);

  return (
    <Link
      className="game-card"
      role="listitem"
      href={`/game/${encodeURIComponent(game.slug)}`}
      aria-label={`View ${game.title}`}
    >
      <div className="game-card-art-box">
        {image ? (
          <div className="game-card-art-image" style={{ backgroundImage: `url("${image}")` }} />
        ) : (
          <div className="art-fallback">{game.title.slice(0, 2).toUpperCase()}</div>
        )}
        <div className="game-card-art-vignette" />
        {index !== undefined && (
          <span className="game-index-badge">{String(index + 1).padStart(2, "0")}</span>
        )}
        <div className="game-card-arrow-badge" aria-hidden="true"><ArrowUpRight size={14} /></div>
      </div>

      <div className="game-card-info">
        <strong className="game-card-title">
          <GameCardLogo logoUrl={game.logoUrl} title={game.title} />
        </strong>
        <div className="game-card-facts">
          {score && (
            <span className="game-card-score-label">
              <Star size={12} fill="currentColor" aria-hidden="true" />{score}
            </span>
          )}
          {year && <span>{year}</span>}
          {game.genres[0]?.name && <span>{game.genres[0].name}</span>}
        </div>
        {platforms.length > 0 && (
          <div className="game-card-platforms" aria-label="Platforms">
            {platforms.join(" · ")}{extraPlatformCount > 0 ? ` +${extraPlatformCount}` : ""}
          </div>
        )}
        {description && <p className="game-card-description">{description}</p>}
        {statusBadge && <div className="game-card-status-slot">{statusBadge}</div>}
      </div>
    </Link>
  );
}

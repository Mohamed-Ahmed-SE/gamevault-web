import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GameSummary } from "@/lib/games/types";
import { GameCard } from "./game-card";
export function GameRail({ title, games, href }: { title: string; games: GameSummary[]; href?: string }) {
  if (!games.length) return null;
  return <section className="rail-section"><div className="section-heading"><h2>{title}</h2>{href && <Link href={href}>Explore <ArrowRight size={14}/></Link>}</div><div className="game-rail">{games.map((g, i) => <GameCard key={g.id} game={g} index={i}/>)}</div></section>;
}

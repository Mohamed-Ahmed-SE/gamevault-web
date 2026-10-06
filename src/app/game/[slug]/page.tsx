import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { gameProvider } from "@/lib/games/provider";
import { GamePs5Hub } from "@/components/game-ps5-hub";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const game = await gameProvider.getGame(slug);
    return {
      title: `${game.title} | GameVault`,
      description: game.description.slice(0, 160),
    };
  } catch {
    return { title: `${slug.replaceAll("-", " ")} | GameVault` };
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let game;
  try {
    game = await gameProvider.getGameWithArtwork(slug);
  } catch (e) {
    if (process.env.RAWG_API_KEY) notFound();
    return (
      <div className="page-shell" style={{ marginTop: 60 }}>
        <div className="state-panel">
          <h1>Game details unavailable</h1>
          <p>{e instanceof Error ? e.message : "Catalog connection failed."}</p>
          <Link className="button button-outline" href="/discover">
            Browse catalog
          </Link>
        </div>
      </div>
    );
  }

  return <GamePs5Hub game={game} />;
}

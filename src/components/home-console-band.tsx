import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { PLATFORMS } from "@/lib/games/platforms";

const platformDestinations = Object.entries(PLATFORMS);

export function HomeConsoleBand() {
  return (
    <section className="vault-section platform-directory" id="consoles" aria-labelledby="platform-directory-title">
      <div className="vault-section-header">
        <div className="vault-title-wrap">
          <span className="vault-slash" aria-hidden="true">/</span>
          <h2 className="vault-section-title" id="platform-directory-title">Explore platforms</h2>
        </div>
        <Link href="/discover" className="vault-explore-link">
          <span>ALL GAMES</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <p className="platform-directory-copy">
        Browse the catalog by platform, including PlayStation 2 and PlayStation 3.
      </p>
      <nav className="console-tiles-grid" aria-label="Browse games by platform">
        {platformDestinations.map(([slug, platform]) => (
          <Link href={`/discover/${encodeURIComponent(slug)}`} className="console-tile" key={slug}>
            <strong className="tile-title">{platform.name}</strong>
            <span className="tile-badge">Browse games</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  );
}

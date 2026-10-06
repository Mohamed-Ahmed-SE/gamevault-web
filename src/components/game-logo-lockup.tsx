import Image from "next/image";

export function GameLogoLockup({ title, publisher, logoUrl }: { title: string; publisher?: string; logoUrl?: string | null }) {
  return (
    <div className="hero-title-lockup">
      {publisher && <p className="hero-franchise-kicker">{publisher}</p>}
      {logoUrl && <Image className="hero-title-logo" src={logoUrl} alt="" aria-hidden="true" width={900} height={300} priority/>}
      <h1 className={logoUrl ? "hero-accessible-title" : "hero-main-game-title"}>{title}</h1>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

export function GameCardLogo({ logoUrl, title }: { logoUrl?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) return <>{title}</>;

  return (
    <Image
      className="game-card-logo"
      src={logoUrl}
      alt=""
      aria-hidden="true"
      width={220}
      height={72}
      onError={() => setFailed(true)}
    />
  );
}

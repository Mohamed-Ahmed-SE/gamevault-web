"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { GameImage } from "@/lib/games/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function MediaGallery({ images }: { images: GameImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const move = useCallback((step: number) => {
    setActive((index) => index === null ? null : (index + step + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (active === null) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, move]);

  if (!images.length) return <p className="page-subtitle">No screenshots are available for this game.</p>;
  return <>
    <div className="media-grid">{images.map((image, index) => <button className="media-button" key={image.id} onClick={() => setActive(index)} aria-label={`Open screenshot ${index + 1} of ${images.length}`}><Image loading="lazy" width={640} height={360} src={image.url} alt={`Game screenshot ${index + 1}`}/></button>)}</div>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot viewer" onClick={() => setActive(null)}>
      <button className="lightbox-close" onClick={() => setActive(null)} aria-label="Close viewer"><X/></button>
      <button className="lightbox-prev" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="Previous screenshot"><ChevronLeft/></button>
      <Image width={1600} height={900} src={images[active].url} alt={`Game screenshot ${active + 1} of ${images.length}`} onClick={(event) => event.stopPropagation()}/>
      <button className="lightbox-next" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="Next screenshot"><ChevronRight/></button>
      <span className="lightbox-count">{active + 1} / {images.length} · use ← → or Esc</span>
    </div>}
  </>;
}

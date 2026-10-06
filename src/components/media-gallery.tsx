"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GameImage } from "@/lib/games/types";
import { focusTrapEdgeIndex } from "@/lib/focus-trap";
import { ChevronLeft, ChevronRight, X } from "@/components/icons";

export function MediaGallery({ images }: { images: GameImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const moveImage = useCallback((step: number) => {
    setActive((index) => index === null ? null : (index + step + images.length) % images.length);
  }, [images.length]);
  const moveImageRef = useRef(moveImage);
  moveImageRef.current = moveImage;
  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveImageRef.current(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveImageRef.current(-1);
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ));
        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
        const edgeIndex = focusTrapEdgeIndex(currentIndex, focusable.length, event.shiftKey);
        if (edgeIndex !== null) {
          event.preventDefault();
          focusable[edgeIndex].focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus();
    };
  }, [isOpen]);

  if (!images.length) return <p className="page-subtitle">No screenshots are available for this game.</p>;
  return <>
    <div className="media-grid">{images.map((image, index) => <button className="media-button" key={image.id} type="button" onClick={(event) => { openerRef.current = event.currentTarget; setActive(index); }} aria-label={`Open screenshot ${index + 1} of ${images.length}`}><Image loading="lazy" width={640} height={360} src={image.url} alt={`Game screenshot ${index + 1}`} /></button>)}</div>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot viewer" tabIndex={-1} ref={dialogRef} onClick={() => setActive(null)}>
      <button type="button" className="lightbox-close" onClick={() => setActive(null)} aria-label="Close viewer"><X /></button>
      <button type="button" className="lightbox-prev" onClick={(event) => { event.stopPropagation(); moveImage(-1); }} aria-label="Previous screenshot"><ChevronLeft /></button>
      <Image width={1600} height={900} src={images[active].url} alt={`Game screenshot ${active + 1} of ${images.length}`} onClick={(event) => event.stopPropagation()} />
      <button type="button" className="lightbox-next" onClick={(event) => { event.stopPropagation(); moveImage(1); }} aria-label="Next screenshot"><ChevronRight /></button>
      <span className="lightbox-count">{active + 1} / {images.length} · use ← → or Esc</span>
    </div>}
  </>;
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus } from "@/components/icons";

type LibraryActionState = "checking" | "ready" | "saving" | "existing" | "saved";

export function HomeHeroActions({ gameId, slug, authenticated }: { gameId: string; slug: string; authenticated: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<LibraryActionState>(authenticated ? "checking" : "ready");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    let current = true;
    fetch(`/api/library?gameId=${encodeURIComponent(gameId)}`)
      .then(async (response) => {
        const libraryState = await response.json();
        if (!response.ok) throw new Error(libraryState.error ?? "Library status is unavailable.");
        return libraryState as { game: unknown };
      })
      .then((libraryState) => {
        if (current) setState(libraryState.game ? "existing" : "ready");
      })
      .catch((error: unknown) => {
        if (!current) return;
        setState("ready");
        setMessage(error instanceof Error ? error.message : "Could not check your library.");
      });
    return () => { current = false; };
  }, [authenticated, gameId]);

  async function addToLibrary() {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      const saveResponse = await response.json();
      if (!response.ok) throw new Error(saveResponse.error ?? "Could not add this game.");
      setState("saved");
      setMessage(saveResponse.xpWarning ?? "Saved to your library.");
      router.refresh();
    } catch (error) {
      setState("ready");
      setMessage(error instanceof Error ? error.message : "Could not add this game.");
    }
  }

  if (!authenticated) return <Link className="button button-outline" href={`/auth/login?next=${encodeURIComponent(`/game/${slug}`)}`}><Plus size={15} /> Sign in to add</Link>;
  if (state === "existing" || state === "saved") return <Link className="button button-outline" href="/library"><Check size={15} /> In your library</Link>;
  return <>
    <button className="button button-outline" type="button" disabled={state === "checking" || state === "saving"} onClick={addToLibrary}>
      <Plus size={15} /> {state === "checking" ? "Checking library…" : state === "saving" ? "Adding…" : "Add to library"}
    </button>
    {message && <span className="hero-action-message" role="status">{message}</span>}
  </>;
}

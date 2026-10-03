"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) { return <div className="state-panel"><h1>That didn’t load.</h1><p>{error.message || "Something went wrong while loading this page."}</p><button className="button button-light" onClick={reset}>Try again</button></div>; }

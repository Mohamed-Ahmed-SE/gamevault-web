"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="state-panel" role="alert">
      <h1>That didn’t load.</h1>
      <p>Something went wrong while loading this page. Try again, or return to the previous page.</p>
      <button className="button button-light" onClick={reset}>Try again</button>
    </div>
  );
}

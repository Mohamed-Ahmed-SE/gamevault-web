import { Suspense } from "react";
import { DiscoverBrowser } from "@/components/discover-browser";

export default function DiscoverPage() {
  return (
    <div className="page-shell">
      <Suspense fallback={<div className="skeleton skeleton-hero" />}>
        <DiscoverBrowser />
      </Suspense>
    </div>
  );
}

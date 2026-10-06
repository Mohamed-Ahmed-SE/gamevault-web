import { Suspense } from "react";
import { SearchView } from "@/components/search-view";

export default function SearchPage() {
  return (
    <div className="page-shell">
      <Suspense fallback={<div className="skeleton skeleton-hero" />}>
        <SearchView initialQuery="spider" />
      </Suspense>
    </div>
  );
}

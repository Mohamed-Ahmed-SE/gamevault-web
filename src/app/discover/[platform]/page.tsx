import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PLATFORMS } from "@/lib/games/platforms";
import { DiscoverBrowser } from "@/components/discover-browser";

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const info = PLATFORMS[platform];
  if (!info) notFound();

  return (
    <div className="page-shell">
      <Suspense fallback={<div className="skeleton skeleton-hero" />}>
        <DiscoverBrowser initialPlatform={platform} />
      </Suspense>
    </div>
  );
}

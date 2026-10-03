import { NextRequest, NextResponse } from "next/server";
import { gameProvider } from "@/lib/games/provider";
import { parseSearchParams } from "@/lib/games/search-params";
import { platformId } from "@/lib/games/platforms";
export async function GET(request: NextRequest) {
  try { const params = parseSearchParams(request.nextUrl.searchParams); const id = platformId(params.platform); if (id) params.platform = String(id); return NextResponse.json(await gameProvider.searchGames(params), { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Catalog unavailable." }, { status: 503 }); }
}

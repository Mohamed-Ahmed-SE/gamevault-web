import { NextResponse } from "next/server"; import { gameProvider } from "@/lib/games/provider";
export async function GET() { try { return NextResponse.json(await gameProvider.searchGames({ ordering: "-added" })); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Catalog unavailable." }, { status: 503 }); } }

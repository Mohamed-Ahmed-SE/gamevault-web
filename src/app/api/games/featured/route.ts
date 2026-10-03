import { NextResponse } from "next/server"; import { gameProvider } from "@/lib/games/provider";
export async function GET() { try { const data = await gameProvider.searchGames({ ordering: "-added" }); return NextResponse.json(data); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Catalog unavailable." }, { status: 503 }); } }

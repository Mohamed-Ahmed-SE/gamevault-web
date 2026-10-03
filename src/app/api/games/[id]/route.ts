import { NextResponse } from "next/server";
import { gameProvider } from "@/lib/games/provider";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; return NextResponse.json(await gameProvider.getGame(id), { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Game details unavailable." }, { status: 503 }); } }

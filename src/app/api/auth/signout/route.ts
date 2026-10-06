import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { config, error } = getSupabasePublicConfig();
  if (!config) return NextResponse.json({ error }, { status: 503 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not available." }, { status: 503 });

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) return NextResponse.json({ error: signOutError.message }, { status: 502 });

  return NextResponse.redirect(new URL("/", request.url), 303);
}

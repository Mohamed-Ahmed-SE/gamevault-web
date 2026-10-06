import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

function confirmationFailure(request: NextRequest, reason: "expired" | "configuration" | "service") {
  const failureUrl = new URL("/auth/confirmation-error", request.url);
  const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"), request.nextUrl.origin);

  failureUrl.searchParams.set("reason", reason);
  if (next !== "/") failureUrl.searchParams.set("next", next);
  return NextResponse.redirect(failureUrl);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return confirmationFailure(request, "expired");

  try {
    const supabase = await createClient();
    if (!supabase) return confirmationFailure(request, "configuration");

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return confirmationFailure(request, "service");
  } catch {
    return confirmationFailure(request, "service");
  }

  const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"), request.nextUrl.origin);
  return NextResponse.redirect(new URL(next, request.url));
}

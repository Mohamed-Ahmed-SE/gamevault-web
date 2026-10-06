import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { config: supabaseConfig } = getSupabasePublicConfig();
  if (!supabaseConfig) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values: { name: string; value: string; options: CookieOptions }[]) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && ["/settings"].some((path) => request.nextUrl.pathname.startsWith(path))) {
    const target = request.nextUrl.clone();
    target.pathname = "/auth/login";
    target.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

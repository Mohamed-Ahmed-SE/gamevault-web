import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/env";

export async function createClient() {
  const { config } = getSupabasePublicConfig();
  if (!config) return null;

  const jar = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (updates: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          updates.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Server components cannot set cookies.
        }
      },
    },
  });
}

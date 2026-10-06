import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  RAWG_API_KEY: z.string().optional(),
});

export function getEnv() {
  return envSchema.parse(process.env);
}

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) return { config: null, error: "Supabase project URL is missing." };
  const parsedUrl = z.string().url().safeParse(url);
  if (!parsedUrl.success || !["http:", "https:"].includes(new URL(url).protocol)) {
    return { config: null, error: "Supabase project URL must be a valid HTTP(S) URL." };
  }
  if (!anonKey) return { config: null, error: "Supabase public anon key is missing." };

  return { config: { url, anonKey }, error: null };
}

export function hasSupabase() {
  return getSupabasePublicConfig().config !== null;
}

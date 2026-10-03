import { z } from "zod";
const envSchema = z.object({ NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")), NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(), RAWG_API_KEY: z.string().optional() });
export function getEnv() { return envSchema.parse(process.env); }
export function hasSupabase() { const env = getEnv(); return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY); }

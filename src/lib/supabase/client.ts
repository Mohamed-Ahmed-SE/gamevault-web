import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/env";

export function createClient() {
  const { config, error } = getSupabasePublicConfig();
  if (!config) throw new Error(`${error} Configure the public Supabase values in the deployment environment.`);
  return createBrowserClient(config.url, config.anonKey);
}

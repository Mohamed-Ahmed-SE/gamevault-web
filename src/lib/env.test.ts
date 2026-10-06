import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublicConfig } from "./env";

describe("public Supabase configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ["", "public-key", "Supabase project URL is missing."],
    ["not-a-url", "public-key", "Supabase project URL must be a valid HTTP(S) URL."],
    ["ftp://project.example", "public-key", "Supabase project URL must be a valid HTTP(S) URL."],
    ["https://project.supabase.co", "", "Supabase public anon key is missing."],
  ])("reports incomplete or invalid public config", (url, anonKey, error) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);

    expect(getSupabasePublicConfig()).toEqual({ config: null, error });
  });

  it("returns valid public settings without involving server secrets", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");

    expect(getSupabasePublicConfig()).toEqual({
      config: { url: "https://project.supabase.co", anonKey: "public-key" },
      error: null,
    });
  });
});

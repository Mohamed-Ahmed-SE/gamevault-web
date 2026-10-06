import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => "admin-client") }));

function serviceJwt(claims: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `header.${payload}.signature`;
}

describe("admin Supabase client configuration", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project-ref.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", serviceJwt({ role: "service_role", ref: "project-ref" }));
    vi.clearAllMocks();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("creates an admin client for a service JWT from the configured project", () => {
    expect(createAdminClient()).toBe("admin-client");
    expect(createSupabaseClient).toHaveBeenCalledOnce();
  });

  it.each([
    ["different project", { role: "service_role", ref: "another-project" }, /different Supabase project/],
    ["wrong role", { role: "anon", ref: "project-ref" }, /must have the service_role role/],
    ["missing project reference", { role: "service_role" }, /missing its project reference/],
  ])("rejects a JWT with %s", (_scenario, claims, diagnostic) => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", serviceJwt(claims));

    expect(() => createAdminClient()).toThrow(diagnostic);
    expect(createSupabaseClient).not.toHaveBeenCalled();
  });

  it.each([
    ["malformed segments", "not-a-jwt"],
    ["malformed claims", "header.!.signature"],
  ])("rejects JWTs with %s without exposing the key", (_scenario, serviceKey) => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", serviceKey);

    let diagnostic = "";
    try {
      createAdminClient();
    } catch (error) {
      diagnostic = error instanceof Error ? error.message : "";
    }

    expect(diagnostic).toMatch(/SUPABASE_SERVICE_ROLE_KEY must be a valid/);
    expect(diagnostic).not.toContain(serviceKey);
    expect(createSupabaseClient).not.toHaveBeenCalled();
  });

  it.each([
    ["local Supabase host", "http://127.0.0.1:54321"],
    ["custom Supabase domain", "https://database.example.com"],
  ])("accepts a service JWT on a %s without comparing project refs", (_hostType, url) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", serviceJwt({ role: "service_role", ref: "different-project" }));

    expect(createAdminClient()).toBe("admin-client");
    expect(createSupabaseClient).toHaveBeenCalledOnce();
  });

  it("accepts the current opaque Supabase secret-key format", () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_local-secret-value");

    expect(createAdminClient()).toBe("admin-client");
    expect(createSupabaseClient).toHaveBeenCalledOnce();
  });
});

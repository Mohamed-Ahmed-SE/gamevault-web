import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type ServiceRoleClaims = { role?: unknown; ref?: unknown };

function decodeServiceRoleClaims(serviceKey: string): ServiceRoleClaims | null {
  const segments = serviceKey.split(".");
  if (segments.length !== 3 || !segments[1]) return null;

  try {
    const claims: unknown = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8"));
    return typeof claims === "object" && claims !== null ? claims : null;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

function validateServiceRoleKey(url: string, serviceKey: string): void {
  if (serviceKey.startsWith("sb_secret_") && serviceKey.length > "sb_secret_".length) return;

  const claims = decodeServiceRoleClaims(serviceKey);
  if (!claims) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be a valid service-role JWT or an sb_secret_ key.");
  }
  if (claims.role !== "service_role") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY JWT must have the service_role role.");
  }
  if (typeof claims.ref !== "string") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY JWT is missing its project reference.");
  }

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be valid to verify SUPABASE_SERVICE_ROLE_KEY.");
  }

  const canonicalProjectHost = /^([a-z0-9-]+)\.supabase\.co$/.exec(hostname);
  if (canonicalProjectHost && claims.ref !== canonicalProjectHost[1]) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belongs to a different Supabase project than NEXT_PUBLIC_SUPABASE_URL.");
  }
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  validateServiceRoleKey(url, serviceKey);
  return createSupabaseClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

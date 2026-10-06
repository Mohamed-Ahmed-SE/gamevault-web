import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const supabase = vi.hoisted(() => ({
  auth: { exchangeCodeForSession: vi.fn() },
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: supabase.createServerClient,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
}));

import { GET } from "./route";

describe("auth confirmation callback", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");
    supabase.createServerClient.mockReturnValue({ auth: supabase.auth });
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("exchanges the confirmation code and returns to a safe local destination", async () => {
    const request = new NextRequest("https://gamevault.example/auth/callback?code=pkce-code&next=%2Flibrary%3Ftab%3Dplaying");

    const response = await GET(request);

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
    expect(response.headers.get("location")).toBe("https://gamevault.example/library?tab=playing");
  });

  it("preserves the safe return path when code exchange returns an error", async () => {
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: new Error("expired code") });
    const request = new NextRequest("https://gamevault.example/auth/callback?code=pkce-code&next=%2Flibrary%3Ftab%3Dplaying");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://gamevault.example/auth/confirmation-error?reason=service&next=%2Flibrary%3Ftab%3Dplaying",
    );
  });

  it("recovers to the confirmation error page when code exchange throws", async () => {
    supabase.auth.exchangeCodeForSession.mockRejectedValue(new Error("network error"));
    const request = new NextRequest("https://gamevault.example/auth/callback?code=pkce-code");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://gamevault.example/auth/confirmation-error?reason=service",
    );
  });

  it("recovers when Supabase client initialization throws", async () => {
    supabase.createServerClient.mockImplementationOnce(() => {
      throw new Error("client initialization failed");
    });
    const request = new NextRequest("https://gamevault.example/auth/callback?code=pkce-code");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://gamevault.example/auth/confirmation-error?reason=service",
    );
  });

  it("identifies missing Supabase configuration and retains a local destination", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const request = new NextRequest("https://gamevault.example/auth/callback?code=pkce-code&next=%2Fsettings");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://gamevault.example/auth/confirmation-error?reason=configuration&next=%2Fsettings",
    );
    expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("identifies an absent code as an expired or incomplete confirmation", async () => {
    const request = new NextRequest("https://gamevault.example/auth/callback");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://gamevault.example/auth/confirmation-error?reason=expired",
    );
    expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
});

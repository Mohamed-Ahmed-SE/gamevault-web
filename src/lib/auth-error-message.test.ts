import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./auth-error-message";

describe("auth error messages", () => {
  it.each([
    "Failed to fetch",
    "TypeError: fetch failed",
    "NetworkError when attempting to fetch resource.",
    "Load failed",
  ])("gives network errors actionable guidance for %s", (message) => {
    expect(getAuthErrorMessage(new TypeError(message))).toContain("project URL and public anon key");
    expect(getAuthErrorMessage(new TypeError(message))).toContain("project is available");
    expect(getAuthErrorMessage(new TypeError(message))).toContain("network connection");
  });

  it("preserves regular Supabase auth error messages", () => {
    expect(getAuthErrorMessage(new Error("Invalid login credentials"))).toBe("Invalid login credentials");
  });

  it("uses the fallback for non-Error failures", () => {
    expect(getAuthErrorMessage("unexpected failure")).toBe("Authentication failed.");
  });
});

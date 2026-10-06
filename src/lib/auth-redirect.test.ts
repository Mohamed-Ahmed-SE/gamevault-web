import { describe, expect, it } from "vitest";
import { getAuthCallbackUrl, getAuthPageUrl, getSafeRedirectPath } from "./auth-redirect";

describe("safe auth redirects", () => {
  it("preserves a local destination and its query and fragment", () => {
    expect(getSafeRedirectPath("/library?tab=playing#list", "https://gamevault.example")).toBe("/library?tab=playing#list");
  });

  it("builds the signup callback on the current origin", () => {
    expect(getAuthCallbackUrl("/settings", "https://gamevault.example")).toBe(
      "https://gamevault.example/auth/callback?next=%2Fsettings",
    );
  });

  it.each([
    ["register", "/library?tab=playing", "/auth/register?next=%2Flibrary%3Ftab%3Dplaying"],
    ["login", "//attacker.example", "/auth/login"],
  ] as const)("keeps only a safe return path when switching to %s", (mode, next, expected) => {
    expect(getAuthPageUrl(mode, next)).toBe(expected);
  });

  it.each([
    "https://attacker.example/path",
    "//attacker.example/path",
    "/\\attacker.example/path",
    "library",
  ])("falls back to the home path for unsafe destination %s", (destination) => {
    expect(getSafeRedirectPath(destination, "https://gamevault.example")).toBe("/");
  });
});

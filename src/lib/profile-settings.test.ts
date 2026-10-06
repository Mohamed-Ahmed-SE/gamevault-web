import { describe, expect, it } from "vitest";
import { loadProfileSettings, saveProfileSettings } from "./profile-settings";

describe("profile settings requests", () => {
  it("does not load blank defaults when the profile request fails", async () => {
    const fetcher = async () => new Response(JSON.stringify({ error: "Sign in required." }), { status: 401 });

    await expect(loadProfileSettings(fetcher)).rejects.toThrow("Sign in required.");
  });

  it("surfaces an error when saving returns a non-JSON failure", async () => {
    const fetcher = async () => new Response("unavailable", { status: 503 });

    await expect(saveProfileSettings({ displayName: "Player", bio: "" }, fetcher)).rejects.toThrow(
      "Could not save profile.",
    );
  });

  it.each([
    ["non-JSON body", new Response("unavailable", { status: 200 }), "Profile service returned unreadable data."],
    ["missing settings", new Response("{}", { status: 200 }), "Profile service returned invalid data."],
    ["wrong field types", new Response('{"display_name":42,"bio":""}', { status: 200 }), "Profile service returned invalid data."],
  ])("rejects a successful profile response with %s", async (_scenario, response, message) => {
    await expect(loadProfileSettings(async () => response)).rejects.toThrow(message);
  });

  it("maps profile API fields to editable settings", async () => {
    const fetcher = async () =>
      new Response(JSON.stringify({ display_name: "Player One", bio: "Game collector" }), { status: 200 });

    await expect(loadProfileSettings(fetcher)).resolves.toEqual({
      displayName: "Player One",
      bio: "Game collector",
    });
  });
});

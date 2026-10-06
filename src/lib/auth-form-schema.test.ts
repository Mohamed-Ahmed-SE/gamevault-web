import { describe, expect, it } from "vitest";
import { createAuthFormSchema } from "./auth-form-schema";

const credentials = { email: "player@example.com", password: "securepass" };

describe("authentication form validation", () => {
  it.each([undefined, "", "   "])(
    "requires a nonblank username when registering (%s)",
    (username) => {
      expect(createAuthFormSchema("register").safeParse({ ...credentials, username }).success).toBe(false);
    },
  );

  it("trims valid signup names before they are submitted", () => {
    const result = createAuthFormSchema("register").safeParse({ ...credentials, username: "  player_one  " });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.username).toBe("player_one");
  });

  it("does not require a username for password sign-in", () => {
    expect(createAuthFormSchema("login").safeParse(credentials).success).toBe(true);
  });
});

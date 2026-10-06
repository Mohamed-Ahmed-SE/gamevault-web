import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_-]+$/;
const usernameMessage = "Choose 3–24 letters, numbers, underscores, or hyphens.";

function isValidUsername(username: string | undefined, required: boolean) {
  if (!username) return !required;
  return username.length >= 3 && username.length <= 24 && usernamePattern.test(username);
}

export function createAuthFormSchema(mode: "login" | "register") {
  return z.object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    username: z.string().trim().optional(),
  }).superRefine(({ username }, context) => {
    if (!isValidUsername(username, mode === "register")) {
      context.addIssue({ code: "custom", path: ["username"], message: usernameMessage });
    }
  });
}

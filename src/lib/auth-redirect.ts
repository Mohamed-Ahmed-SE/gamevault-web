export function getSafeRedirectPath(next: string | null, origin: string) {
  if (!next?.startsWith("/")) return "/";

  const target = new URL(next, origin);
  if (target.origin !== origin) return "/";

  return `${target.pathname}${target.search}${target.hash}`;
}

export function getAuthCallbackUrl(next: string | null, origin: string) {
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", getSafeRedirectPath(next, origin));
  return callback.toString();
}

export function getAuthPageUrl(mode: "login" | "register", next: string | null) {
  const safeNext = getSafeRedirectPath(next, "https://gamevault.invalid");
  return safeNext === "/"
    ? `/auth/${mode}`
    : `/auth/${mode}?next=${encodeURIComponent(safeNext)}`;
}

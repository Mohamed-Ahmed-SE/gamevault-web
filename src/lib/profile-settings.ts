export type ProfileSettings = {
  displayName: string;
  bio: string;
};

type ProfileSettingsResponse = { display_name: string | null; bio: string | null };

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError && !response.ok) return {};
    if (error instanceof SyntaxError) throw new Error("Profile service returned unreadable data.");
    throw error;
  }
}

function isRecord(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null && !Array.isArray(payload);
}

function errorMessage(payload: unknown): string | null {
  return isRecord(payload) && typeof payload.error === "string" ? payload.error : null;
}

function isProfileSettingsResponse(payload: unknown): payload is ProfileSettingsResponse {
  return isRecord(payload)
    && "display_name" in payload
    && "bio" in payload
    && (payload.display_name === null || typeof payload.display_name === "string")
    && (payload.bio === null || typeof payload.bio === "string");
}

export async function loadProfileSettings(fetcher: typeof fetch = fetch): Promise<ProfileSettings> {
  const response = await fetcher("/api/profile");
  const profile = await parseResponse(response);
  if (!response.ok) throw new Error(errorMessage(profile) ?? "Could not load profile settings.");
  if (!isProfileSettingsResponse(profile)) throw new Error("Profile service returned invalid data.");
  return { displayName: profile.display_name ?? "", bio: profile.bio ?? "" };
}

export async function saveProfileSettings(
  settings: ProfileSettings,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const response = await fetcher("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ display_name: settings.displayName, bio: settings.bio }),
  });
  const result = await parseResponse(response);
  if (!response.ok) throw new Error(errorMessage(result) ?? "Could not save profile.");
  if (!isRecord(result) || result.ok !== true) throw new Error("Profile service returned invalid data.");
}

const NETWORK_ERROR_MESSAGE =
  "We couldn't reach Supabase. Check that your project URL and public anon key are configured correctly, confirm the project is available, and check your network connection.";

const NETWORK_ERROR_PATTERN = /failed to fetch|fetch failed|network ?error|network request failed|load failed/i;

export function getAuthErrorMessage(cause: unknown): string {
  if (!(cause instanceof Error)) return "Authentication failed.";
  if (NETWORK_ERROR_PATTERN.test(cause.message)) return NETWORK_ERROR_MESSAGE;
  return cause.message;
}

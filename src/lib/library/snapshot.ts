export type LibrarySnapshot = { saved: boolean; favorite: boolean };

export function parseLibrarySnapshot(payload: unknown): LibrarySnapshot {
  if (!isRecord(payload) || !("game" in payload) || !("favorite" in payload)) {
    throw new TypeError("The library returned an invalid game state.");
  }

  if (payload.game !== null && !isRecord(payload.game)) {
    throw new TypeError("The library returned an invalid game state.");
  }

  if (typeof payload.favorite !== "boolean") {
    throw new TypeError("The library returned an invalid game state.");
  }

  return { saved: payload.game !== null, favorite: payload.favorite };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

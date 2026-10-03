import type { PlatformSummary } from "./types";
export const PLATFORMS: Record<string, { name: string; rawgId: number }> = {
  ps5: { name: "PlayStation 5", rawgId: 187 }, ps4: { name: "PlayStation 4", rawgId: 18 },
  ps3: { name: "PlayStation 3", rawgId: 16 }, ps2: { name: "PlayStation 2", rawgId: 15 },
  "xbox-series": { name: "Xbox Series X|S", rawgId: 186 }, "xbox-one": { name: "Xbox One", rawgId: 1 },
  pc: { name: "PC", rawgId: 4 }, switch: { name: "Nintendo Switch", rawgId: 7 },
};
const aliases: Record<string, string> = { "playstation 5": "ps5", "playstation 4": "ps4", "playstation 3": "ps3", "playstation 2": "ps2", "xbox series s/x": "xbox-series", "nintendo switch": "switch", "pc": "pc" };
export function normalizePlatform(raw: { id: number; slug: string; name: string }): PlatformSummary {
  const slug = aliases[raw.name.toLowerCase()] ?? (Object.keys(PLATFORMS).includes(raw.slug) ? raw.slug : raw.slug);
  return { id: String(raw.id), slug, name: raw.name };
}
export function platformId(slug?: string): number | undefined { return slug ? PLATFORMS[slug.toLowerCase()]?.rawgId : undefined; }

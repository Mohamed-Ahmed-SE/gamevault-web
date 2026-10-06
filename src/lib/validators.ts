import { z } from "zod";
export const statusSchema = z.enum(["want_to_play", "backlog", "playing", "completed", "paused", "dropped"]);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((date) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}).nullable();
const ratingsSchema = z.object({
  gameplay: z.number().min(1).max(10).nullable(),
  story: z.number().min(1).max(10).nullable(),
  graphics: z.number().min(1).max(10).nullable(),
  sound: z.number().min(1).max(10).nullable(),
  overall: z.number().min(1).max(10).nullable(),
});
export const libraryMutationSchema = z.object({
  gameId: z.string().min(1),
  provider: z.literal("rawg").default("rawg"),
  status: statusSchema.optional(),
  favorite: z.boolean().optional(),
  playtimeMinutes: z.number().int().min(0).optional(),
  startedAt: dateSchema.optional(),
  completedAt: dateSchema.optional(),
  notes: z.string().max(5000).nullable().optional(),
  ratings: ratingsSchema.optional(),
});
export type GameStatus = z.infer<typeof statusSchema>;
export const ratingFields = ["gameplay", "story", "graphics", "sound", "overall"] as const;

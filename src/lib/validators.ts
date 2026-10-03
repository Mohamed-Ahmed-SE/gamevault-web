import { z } from "zod";
export const statusSchema = z.enum(["want_to_play", "backlog", "playing", "completed", "paused", "dropped"]);
export const libraryMutationSchema = z.object({ gameId: z.string().min(1), provider: z.literal("rawg").default("rawg"), status: statusSchema.optional(), favorite: z.boolean().optional(), playtimeMinutes: z.number().int().min(0).optional(), startedAt: z.string().nullable().optional(), completedAt: z.string().nullable().optional(), notes: z.string().max(5000).nullable().optional(), ratings: z.object({ gameplay: z.number().min(1).max(10).nullable(), story: z.number().min(1).max(10).nullable(), graphics: z.number().min(1).max(10).nullable(), sound: z.number().min(1).max(10).nullable(), overall: z.number().min(1).max(10).nullable() }).optional() });
export type GameStatus = z.infer<typeof statusSchema>;
export const ratingFields = ["gameplay", "story", "graphics", "sound", "overall"] as const;

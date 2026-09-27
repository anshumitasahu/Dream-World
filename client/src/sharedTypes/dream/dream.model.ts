import z from "zod";
import { worldSchema } from "../world/world.model";

export const publishDreamSchema = z.object({
  userChatId: z.string().min(1, "Chat id is required"),
  title: z.string().trim().min(1, "Title is required").max(120),
  tags: z
    .array(z.string().trim().min(1).max(30).toLowerCase())
    .max(10)
    .default([]),
});

export const dreamIdParamSchema = z.object({
  id: z.string().min(1),
});

export const dreamSchema = z.object({
  id: z.string(),
  userChatId: z.string(),
  title: z.string(),
  prompt: z.string(),
  authorId: z.string(),
  likes: z.number(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const dreamAuthorSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const dreamWorldSummarySchema = z.object({
  mode: z.enum(["open", "preset"]),
  map: z.string().optional(),
  texture: z.string().optional(),
  weather: z.string().optional(),
  time: z.string().optional(),
  objectCount: z.number().int().nonnegative(),
  modelNames: z.array(z.string()),
});

export const exploreDreamSchema = dreamSchema.extend({
  author: dreamAuthorSchema,
  likedByMe: z.boolean(),
  summary: dreamWorldSummarySchema,
});

export const dreamWorldDetailSchema = z.object({
  dream: exploreDreamSchema,
  world: worldSchema,
});

export const dreamLikeResultSchema = z.object({
  likes: z.number().int(),
  likedByMe: z.boolean(),
});

export type publishDreamParams = z.infer<typeof publishDreamSchema>;
export type dreamIdParams = z.infer<typeof dreamIdParamSchema>;
export type dream = z.infer<typeof dreamSchema>;
export type dreamAuthor = z.infer<typeof dreamAuthorSchema>;
export type dreamWorldSummary = z.infer<typeof dreamWorldSummarySchema>;
export type exploreDream = z.infer<typeof exploreDreamSchema>;
export type dreamWorldDetail = z.infer<typeof dreamWorldDetailSchema>;
export type dreamLikeResult = z.infer<typeof dreamLikeResultSchema>;

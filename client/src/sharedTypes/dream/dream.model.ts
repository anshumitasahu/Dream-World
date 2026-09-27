import z from "zod";

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

export type publishDreamParams = z.infer<typeof publishDreamSchema>;
export type dreamIdParams = z.infer<typeof dreamIdParamSchema>;
export type dream = z.infer<typeof dreamSchema>;

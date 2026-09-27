import z from "zod";
import { worldSchema } from "../world/world.model";

export const createChatSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export const chatIdParamSchema = z.object({
  id: z.string().min(1),
});

export const worldAgentResponseSchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
  world: worldSchema,
});

export type createChatParams = z.infer<typeof createChatSchema>;
export type sendMessageParams = z.infer<typeof sendMessageSchema>;
export type chatIdParams = z.infer<typeof chatIdParamSchema>;
export type worldAgentResponse = z.infer<typeof worldAgentResponseSchema>;

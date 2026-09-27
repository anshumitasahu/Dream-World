import { Router } from "express";
import { requireAuth } from "@/lib/auth/authMiddleware";
import { validateBody } from "@/lib/inputValidation";
import { createChatSchema, sendMessageSchema } from "@/sharedTypes/chat/chat.model";
import {
  createChatController,
  getChatController,
  listChatsController,
  sendMessageController,
} from "./chat.controller";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(createChatSchema), createChatController);
router.get("/", listChatsController);
router.get("/:id", getChatController);
router.post("/:id/messages", validateBody(sendMessageSchema), sendMessageController);

export default router;

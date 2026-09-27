import type { NextFunction, Request, Response } from "express";
import { appendMessage, createChat, getChatForUser, listChatsForUser } from "./chat.service";

export async function createChatController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chat = await createChat(req.user!.id, req.body.message);
    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: chat,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessageController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await appendMessage(req.user!.id, req.params.id as string, req.body.message);
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: entry,
    });
  } catch (error) {
    next(error);
  }
}

export async function getChatController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chat = await getChatForUser(req.user!.id, req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Chat fetched successfully",
      data: chat,
    });
  } catch (error) {
    next(error);
  }
}

export async function listChatsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chats = await listChatsForUser(req.user!.id);
    res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    next(error);
  }
}

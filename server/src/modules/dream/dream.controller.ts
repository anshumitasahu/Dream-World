import type { NextFunction, Request, Response } from "express";
import { getDreamForUser, listDreamsForUser, publishDream } from "./dream.service";

export async function publishDreamController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dream = await publishDream(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: "Dream published successfully",
      data: dream,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDreamController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dream = await getDreamForUser(req.user!.id, req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Dream fetched successfully",
      data: dream,
    });
  } catch (error) {
    next(error);
  }
}

export async function listDreamsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dreams = await listDreamsForUser(req.user!.id);
    res.status(200).json({
      success: true,
      message: "Dreams fetched successfully",
      data: dreams,
    });
  } catch (error) {
    next(error);
  }
}

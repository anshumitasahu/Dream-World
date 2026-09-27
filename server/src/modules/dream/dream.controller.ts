import type { NextFunction, Request, Response } from "express";
import {
  getDreamForUser,
  getDreamWorld,
  listDreamsForUser,
  listExploreDreams,
  publishDream,
  setDreamLike,
} from "./dream.service";

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

export async function listExploreDreamsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dreams = await listExploreDreams(req.user!.id);
    res.status(200).json({
      success: true,
      message: "Explore dreams fetched successfully",
      data: dreams,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDreamWorldController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dream = await getDreamWorld(req.user!.id, req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Dream world fetched successfully",
      data: dream,
    });
  } catch (error) {
    next(error);
  }
}

export async function likeDreamController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await setDreamLike(req.user!.id, req.params.id as string, true);
    res.status(200).json({
      success: true,
      message: "Dream liked successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function unlikeDreamController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await setDreamLike(req.user!.id, req.params.id as string, false);
    res.status(200).json({
      success: true,
      message: "Dream unliked successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

import type { NextFunction, Request, Response } from "express";
import { getCreditSummary } from "./credit.service";

export async function getCreditsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getCreditSummary(req.user!.id);
    res.status(200).json({
      success: true,
      message: "Credits fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

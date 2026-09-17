import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "./jwt";
import { ApiError } from "../error";
import { prisma } from "../prisma";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or invalid Authorization header");
    }

    const payload = verifyAuthToken(header.slice("Bearer ".length));

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (error) {
    next(error);
  }
}
import { prisma } from "../lib/prisma";
import type { Response, Request } from "express";

export const Likes = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (typeof postId !== "string") {
        return res.status(400).json({ error: "Invalid postId" });
    }

    const likes = await prisma.like.create({
        data: {
            userId: userId!,
            postId
        }
    })

    return res.status(201).json({
        success: true, data: likes
    })
}
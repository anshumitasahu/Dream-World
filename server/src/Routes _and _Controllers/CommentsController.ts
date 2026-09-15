import { prisma } from "../lib/prisma";
import type { Response, Request } from "express";

export const Comments = async (req: Request, res: Response) => {
    const { content } = req.body;
    const userId = req.user?.id;
    const { postId } = req.params;

    if (typeof postId !== "string") {
        return res.status(400).json({ error: "Invalid postId" });
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            userId: userId!,
            postId
        }
    })

    return res.status(201).json({
        success: true, data: comment
    })
}
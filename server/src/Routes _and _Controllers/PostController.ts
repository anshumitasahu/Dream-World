import { prisma } from "../lib//prisma"
import type { Response, Request } from "express";

export const Posts = async (req: Request, res: Response) => {
    const { content } = req.body;
    const userId = req.user?.id;

    const post = await prisma.post.create({
        data: {
            content,
            authorId: userId!
        }
    });

    return res.status(201).json({ success: true, data: post });
}


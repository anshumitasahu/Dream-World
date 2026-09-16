import express from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../MiddleWares/authMiddleware";
import { Likes } from "./LikeController";
import type { Request, Response } from "express";

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware, async (req: Request<{ postId: string }>, res: Response) => {
    const { postId } = req.params;

    const like = await prisma.like.findMany({
        where: { postId },
        select: {
            id: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
        },
    });

    return res.status(200).json({
        success: true,
        message: "likes fetched successfully",
        data: like,
        count: like.length
    })
})

router.post("/", authMiddleware, Likes);

router.delete("/", authMiddleware, async (req: Request<{ postId: string }>, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    await prisma.like.deleteMany({
        where:
        {
            userId: userId!,
            postId
        }
    })

    return res.status(200).json({
        success: true,
        message: "like deleted successfully",
    })
})

export default router;
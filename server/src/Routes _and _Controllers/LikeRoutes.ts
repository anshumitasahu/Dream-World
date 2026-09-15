import express from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../MiddleWares/authMiddleware";
import { Likes } from "./LikeController";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request<{ postId: string }>, res: Response) => {
    const { postId } = req.params;

    const like = await prisma.like.findMany({
        where: { postId },
    })

    return res.status(200).json({
        success: true,
        message: "likes fetched successfully",
        data: like
    })
})

router.post("/", authMiddleware, Likes);

router.delete("/", authMiddleware, async (req: Request<{ postId: string }>, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    await prisma.like.delete({
        where: {
            userId_postId: {
                userId: userId!,
                postId
            }
        }
    })

    return res.status(200).json({
        success: true,
        message: "like deleted successfully",

    })
})

export default router;
import { prisma } from "../lib/prisma";
import express from "express";
import { authMiddleware } from "../MiddleWares/authMiddleware";
import { Follow } from "./FollowController";
import type { Request, Response } from "express";

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware, async (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;

    const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        select: {
            id: true,
            createdAt: true,
            follower: {
                select: {
                    id: true,
                    name: true,
                    username: true
                },
            }
        }
    })
    return res.status(200).json({
        success: true,
        message: "Followers fetched successfully",
        data: follows,
        count: follows.length
    })
})

router.post("/", authMiddleware, Follow);

router.delete("/", authMiddleware, async (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;
    const followerId = req.user?.id;

    if (!followerId) {
        return res.status(401).json({
            error: "Unauthorized"
        })
    }

    await prisma.follow.deleteMany({
        where: {
            followerId: followerId!,
            followingId: userId
        }
    })

    return res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
    })
})

export default router;
import { prisma } from "../lib/prisma";
import type { Response, Request } from "express";

export const Follow = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const followerId = req.user?.id;

    if (typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid UserId" })
    };

    if (!userId) {
        return res.status(400).json({
            error: "Invalid user"
        })
    }

    if (!followerId) {
        return res.status(400).json({
            error: "Unauthorized"
        })
    }

    const follows = await prisma.follow.create({
        data: {
            followingId: userId,
            followerId: followerId!
        }
    })

    return res.status(201).json({
        success: true, data: follows
    })
}
import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../MiddleWares/authMiddleware';
import { Posts } from "./PostController"

const router = express.Router()

router.get("/", authMiddleware, async (req, res) => {
    console.log("req.user in route:", req.user);
    const userId = req.user?.id;
    const Post = await prisma.post.findMany({
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, name: true } },
            _count: { select: { likes: true } },
            likes: {
                where: { userId: userId! },
                select: { id: true },
                take: 1,
            },
        },
    });
    return res.status(200).json({
        success: true,
        message: "posts fetched successfully",
        data: Post
    })
})

router.post("/", authMiddleware, Posts)

export default router;
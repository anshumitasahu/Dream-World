import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../MiddleWares/authMiddleware';
import { Posts } from "./PostController"

const router = express.Router()

router.get("/", async (req, res) => {
    const Post = await prisma.post.findMany({
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    return res.status(200).json({
        success: true,
        message: "posts fetched successfully",
        data: Post
    })
})

router.post("/", authMiddleware, Posts)

export default router;
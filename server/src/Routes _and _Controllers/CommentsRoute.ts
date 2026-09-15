import express from "express";
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../MiddleWares/authMiddleware';
import { Comments } from "./CommentsController";
import type { Response, Request } from "express";

const router = express.Router({ mergeParams: true });

router.get("/", async (req: Request<{ postId: string }>, res: Response) => {

    const { postId } = req.params;

    const Comment = await prisma.comment.findMany({
        where: { postId },
        select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    return res.status(201).json({
        success: true,
        message: "comments fetched successfully",
        data: Comment
    })
})

router.post("/", authMiddleware, Comments)

export default router;
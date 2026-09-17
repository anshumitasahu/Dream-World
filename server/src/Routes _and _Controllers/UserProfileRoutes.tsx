import { prisma } from "../lib/prisma";
import express from "express";
import { authMiddleware } from "../MiddleWares/authMiddleware";
import { UserProfile } from "./UserProfileController";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const userProfile = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            profilePicture: true,
            coverPicture: true,
            posts: {
                select: {
                    id: true,
                    content: true,
                    createdAt: true
                }
            },
            following: {
                select: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                        }
                    }
                }
            },
            follower: {
                select: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            username: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    follower: true,
                    following: true
                }
            }
        }
    })

    return res.status(200).json({
        success: true,
        message: "UserProfile fetched successfully",
        data: userProfile,
    })
})

router.post("/", authMiddleware, UserProfile);

router.patch("/", authMiddleware, async (req: Request, res: Response) => {

    const userId = req.user?.id;
    console.log(userId)

    if (!userId) {
        return res.status(400).json({ error: "Invalid user" });
    }

    try {
        const userProfile = await prisma.user.update({
            where: { id: userId },
            data: {
                name: req.body.name,
                bio: req.body.bio,
                profilePicture: req.body.profilePicture,
                coverPicture: req.body.coverPicture,
            }
        });
        console.log(userProfile)
        return res.status(201).json({ success: true, data: userProfile });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
})

export default router;
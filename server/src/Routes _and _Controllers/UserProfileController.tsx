import { prisma } from "../lib/prisma";
import type { Response, Request } from "express";

export const UserProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({
            error: "Invalid user"
        })
    }

    const userProfile = await prisma.user.updateMany({
        data: {
            id: userId
        }
    })

    return res.status(201).json({
        success: true, data: userProfile
    })
}  
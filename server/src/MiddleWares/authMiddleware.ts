import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { User } from "../generated/prisma/client"
import type { Request, Response, NextFunction } from "express"
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET is missing");
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Auth reached middleware");
    let token;
    console.log(req.method, req.originalUrl);
    console.log("HEADERS:", req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }
    console.log("TOKEN:", token);
    if (!token) {
        console.log("AUTH:", req.headers.authorization);
        console.log("COOKIES:", req.cookies);
        return res.status(401).json({
            error: "Not authorized,token not provided"
        })
    }

    try {
        const decoded = jwt.verify(token, secret)
        if (typeof decoded === "string") {
            throw new Error("Invalid token");
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        })

        if (!user) {
            return res
                .status(401)
                .json({
                    error: "User no longer exists"
                });
        };
        console.log("DECODED:", decoded);
        req.user = user
        console.log("USER:", user);
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: "Not Authorized, no token found" })
    }
};
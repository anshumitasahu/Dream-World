import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not defined");
}

const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

export const generateToken = (userId: string, res: Response) => {
    const payload = { id: userId };
    const tokens = jwt.sign(payload, secret, {
        expiresIn: expiresIn as any
    });
    console.log("SETTING COOKIE");
    res.cookie("jwt", tokens, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: (1000 * 60 * 60 * 24) * 7
    })
    console.log("COOKIE SET");
    return tokens
}

import type { NextFunction, Request, Response } from "express";
import { googleAuthUser, loginUser, signupUser } from "./auth.service";

export async function signupController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await signupUser(req.body);
        res.status(201).json({
            success: true,
            message: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await loginUser(req.body);
        res.status(200).json({
            success: true,
            message: "Logged inn successfully",
            data,
        })
    } catch (error) {
        next(error);
    }
}

export async function googleAuthController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await googleAuthUser(req.body);
        res.status(200).json({
            success: true,
            message: "Logged in with Google successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export function meController(req: Request, res: Response): void {
    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: req.user,
    });
}
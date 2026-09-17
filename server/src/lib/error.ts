import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Invalid input",
            issues: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    if (error instanceof ApiError) {
        res.status(error.status).json({
            success: false,
            message: error.message
        });
        return;
    }

    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
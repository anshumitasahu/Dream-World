import type { Response, Request, NextFunction } from "express";
import { Schema } from "zod/v3";

export const validateRequest = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;

            return res.status(400).json({
                message: Object.values(errors).flat().join(", ")
            });
        }

        next();
    }
}
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateBody<T extends ZodType>(schema: T) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
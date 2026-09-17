import jwt from "jsonwebtoken";
import { ApiError } from "../error";

interface authTokenPayload {
    id: string;
    email: string;
}

const SEVEN_DAYS = "7d";

function getJwtSecret(): string {
    const secret = process.env.JJWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set. Add it to server/.env (generate with: openssl rand -hex 32).");
    }
    return secret;
}

export function signAuthToken({ id, email }: authTokenPayload): string {
    return jwt.sign({ sub: id, email }, getJwtSecret(), { expiresIn: SEVEN_DAYS });
}

export function verifyAuthToken(token: string): authTokenPayload {
    let decoded: string | jwt.JwtPayload;
    try {
        decoded = jwt.verify(token, getJwtSecret());
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }

    if (typeof decoded !== "object" || decoded === null) {
        throw new ApiError(401, "Invalid Token payload");
    }

    const { sub, email } = decoded;
    if (typeof sub !== "string" || typeof email !== "string") {
        throw new ApiError(401, "Invalid token payload");
    }

    return { id: sub, email };
}
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library";
import type { TokenPayload } from "google-auth-library";
import { signAuthToken } from "../../lib/auth/jwt";
import { ApiError } from "../../lib/error";
import { prisma } from "../../lib/prisma";
import type {
    authResponse,
    authUser,
    googleAuthParams,
    loginParams,
    signupParams,
} from "../../sharedTypes/auth/auth.model";

const BCRYPT_COST = 10;

interface userRecord {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    password: string | null;
}

function toAuthUser(user: userRecord): authUser {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
    };
}

function createAuthResponse(user: userRecord): authResponse {
    return {
        token: signAuthToken(user),
        user: toAuthUser(user),
    };
}

export async function signupUser(body: signupParams): Promise<authResponse> {
    const existing = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    });
    if (existing) {
        throw new ApiError(409, "An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(body.password, BCRYPT_COST);

    const user = await prisma.user.create({
        data: {
            email: body.email,
            name: body.name,
            password: hashedPassword,
        },
    });

    return createAuthResponse(user);
}

export async function loginUser(body: loginParams): Promise<authResponse> {
    const user = await prisma.user.findUnique({
        where: { email: body.email }
    })

    if (!user || !user.password) {
        throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(body.password, user.password);
    if (!passwordMatches) {
        throw new ApiError(401, "Invalid email or password");
    }

    return createAuthResponse(user);
}

export async function googleAuthUser(body: googleAuthParams): Promise<authResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new ApiError(500, "GOOGLE_CLIENT_ID is not configured");
    }

    const client = new OAuth2Client(clientId);

    let payload: TokenPayload | undefined;
    try {
        const ticket = await client.verifyIdToken({
            idToken: body.credential,
            audience: clientId,
        });
        payload = ticket.getPayload();
    } catch {
        throw new ApiError(401, "Invaild Google credential");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new ApiError(401, "Google account email is not verified");
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
        const existingByEmail = await prisma.user.findUnique({ where: { email } });
        if (existingByEmail) {
            user = await prisma.user.update({
                where: { id: existingByEmail.id },
                data: {
                    googleId,
                    name: existingByEmail.name ?? name ?? null,
                    avatarUrl: existingByEmail.avatarUrl ?? picture ?? null,
                },
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    name: name ?? null,
                    avatarUrl: picture ?? null,
                }
            })
        }
    }
    return createAuthResponse(user);
}
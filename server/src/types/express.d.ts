import type { authUser } from "../sharedTypes/auth/auth.model";

declare global {
    namespace Express {
        interface Request {
            user?: authUser;
        }
    }
}
import { Router } from "express";
import { requireAuth } from "../../lib/auth/authMiddleWare";
import { validateBody } from "../../lib/inputValidation";
import { googleAuthSchema, loginSchema, signupSchema } from "../../sharedTypes/auth/auth.model";
import { googleAuthController, loginController, meController, signupController } from "./auth.controller";

const router = Router();

router.post("/signup", validateBody(signupSchema), signupController);
router.post("/login", validateBody(loginSchema), loginController);
router.post("/google", validateBody(googleAuthSchema), googleAuthController);
router.get("/me", requireAuth, meController);

export default router;
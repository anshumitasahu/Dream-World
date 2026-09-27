import { Router } from "express";
import { requireAuth } from "@/lib/auth/authMiddleware";
import { getCreditsController } from "./credit.controller";

const router = Router();

router.use(requireAuth);
router.get("/", getCreditsController);

export default router;

import { Router } from "express";
import { requireAuth } from "@/lib/auth/authMiddleware";
import { validateBody } from "@/lib/inputValidation";
import { publishDreamSchema } from "@/sharedTypes/dream/dream.model";
import { publishDreamController, getDreamController, listDreamsController } from "./dream.controller";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(publishDreamSchema), publishDreamController);
router.get("/", listDreamsController);
router.get("/:id", getDreamController);

export default router;

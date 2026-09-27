import { Router } from "express";
import { requireAuth } from "@/lib/auth/authMiddleware";
import { validateBody } from "@/lib/inputValidation";
import { publishDreamSchema } from "@/sharedTypes/dream/dream.model";
import {
  getDreamController,
  getDreamWorldController,
  likeDreamController,
  listDreamsController,
  listExploreDreamsController,
  publishDreamController,
  unlikeDreamController,
} from "./dream.controller";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(publishDreamSchema), publishDreamController);
router.get("/", listDreamsController);
router.get("/explore", listExploreDreamsController);
router.get("/:id", getDreamController);
router.get("/:id/world", getDreamWorldController);
router.post("/:id/like", likeDreamController);
router.delete("/:id/like", unlikeDreamController);

export default router;

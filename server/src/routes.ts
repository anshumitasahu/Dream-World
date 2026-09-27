import { Router } from "express";
import authRoutes from "@/modules/auth/auth.route";
import dreamRoutes from "@/modules/dream/dream.route";
import chatRoutes from "@/modules/chat/chat.route";

const mainRouter = Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/dreams", dreamRoutes);
mainRouter.use("/chats", chatRoutes);

export default mainRouter;

import { Router } from "express";
import authRoutes from "@/modules/auth/auth.route";
import dreamRoutes from "@/modules/dream/dream.route";
import chatRoutes from "@/modules/chat/chat.route";
import creditRoutes from "@/modules/credit/credit.route";

const mainRouter = Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/dreams", dreamRoutes);
mainRouter.use("/chats", chatRoutes);
mainRouter.use("/credits", creditRoutes);

export default mainRouter;

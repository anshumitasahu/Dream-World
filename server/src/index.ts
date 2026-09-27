import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorMiddleware } from "@/lib/errors";
import mainRouter from "@/routes";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/api", mainRouter);
app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

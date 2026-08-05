import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.routes.js";
import systemRouter from "./routes/system.routes.js";
import { APP_CONFIG } from "./config/constants.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(`${APP_CONFIG.API_PREFIX}${APP_CONFIG.AI_ROUTE}`,aiRouter);
app.use(APP_CONFIG.API_PREFIX,systemRouter);
app.use(notFoundMiddleware);
export default app;

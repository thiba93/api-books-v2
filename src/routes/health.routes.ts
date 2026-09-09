import { Router } from "express";
import { env } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-books-v2",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

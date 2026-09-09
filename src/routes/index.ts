import { Router } from "express";
import { healthRouter } from "./health.routes";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "api-books-v2",
    version: "0.1.0",
    documentation: "/api/docs"
  });
});

apiRouter.use(healthRouter);

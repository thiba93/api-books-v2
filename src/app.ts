import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openApiDocument } from "./docs/openapi";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiRouter } from "./routes";
import { healthRouter } from "./routes/health.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.use(healthRouter);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: "not_found",
      message: "Route introuvable."
    });
  });

  app.use(errorMiddleware);

  return app;
}

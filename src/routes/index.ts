import { Router } from "express";
import { authRouter } from "./auth.routes";
import { authorsRouter } from "./authors.routes";
import { booksRouter } from "./books.routes";
import { categoriesRouter } from "./categories.routes";
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
apiRouter.use(authRouter);
apiRouter.use(booksRouter);
apiRouter.use(authorsRouter);
apiRouter.use(categoriesRouter);

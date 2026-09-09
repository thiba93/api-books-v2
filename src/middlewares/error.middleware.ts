import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "validation_error",
      message: "Donnees invalides.",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      res.status(404).json({
        error: "not_found",
        message: "Ressource introuvable."
      });
      return;
    }

    if (error.code === "P2002") {
      res.status(409).json({
        error: "unique_constraint",
        message: "Une ressource avec ces donnees existe deja."
      });
      return;
    }
  }

  console.error(error);
  res.status(500).json({
    error: "internal_server_error",
    message: "Une erreur interne est survenue."
  });
};

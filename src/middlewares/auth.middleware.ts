import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { HttpError } from "../utils/http-error";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
};

export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "missing_token", "Token d authentification manquant.");
    }

    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      throw new HttpError(401, "invalid_token", "Token d authentification invalide.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    next(new HttpError(401, "invalid_token", "Token d authentification invalide."));
  }
}

export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    next(new HttpError(403, "forbidden", "Droits administrateur requis."));
    return;
  }

  next();
}

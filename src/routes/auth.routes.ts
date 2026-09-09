import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { authenticate, type AuthenticatedRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

export const authRouter = Router();

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(120)
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

function signAccessToken(user: { id: string; email: string; role: "ADMIN" | "USER" }) {
  const options: jwt.SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  };

  return jwt.sign(
    {
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    options
  );
}

authRouter.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });

    if (existingUser) {
      throw new HttpError(409, "email_already_used", "Cet email est deja utilise.");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        role: "USER"
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const token = signAccessToken(user);

    res.status(201).json({
      token,
      user
    });
  })
);

authRouter.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      throw new HttpError(401, "invalid_credentials", "Identifiants invalides.");
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, "invalid_credentials", "Identifiants invalides.");
    }

    const publicUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    res.json({
      token: signAccessToken(publicUser),
      user: publicUser
    });
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new HttpError(404, "user_not_found", "Utilisateur introuvable.");
    }

    res.json(user);
  })
);

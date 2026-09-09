import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { HttpError, notFound } from "../utils/http-error";

export const authorsRouter = Router();

const authorSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional().nullable(),
  lastName: z.string().trim().min(1).max(100),
  biography: z.string().trim().max(2000).optional().nullable()
});

authorsRouter.get(
  "/authors",
  asyncHandler(async (_req, res) => {
    const authors = await prisma.author.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { _count: { select: { books: true } } }
    });

    res.json(authors);
  })
);

authorsRouter.get(
  "/authors/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            book: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!author) {
      throw notFound("Auteur introuvable.");
    }

    res.json(author);
  })
);

authorsRouter.post(
  "/authors",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = authorSchema.parse(req.body);
    const author = await prisma.author.create({ data: payload });

    res.status(201).json(author);
  })
);

authorsRouter.put(
  "/authors/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = authorSchema.parse(req.body);
    const id = String(req.params.id);
    const author = await prisma.author.update({
      where: { id },
      data: payload
    });

    res.json(author);
  })
);

authorsRouter.delete(
  "/authors/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const linkedBooks = await prisma.bookAuthor.count({ where: { authorId: id } });

    if (linkedBooks > 0) {
      throw new HttpError(409, "author_has_books", "Impossible de supprimer un auteur lie a des livres.");
    }

    await prisma.author.delete({ where: { id } });
    res.status(204).send();
  })
);

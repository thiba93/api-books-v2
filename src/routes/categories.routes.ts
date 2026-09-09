import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { HttpError, notFound } from "../utils/http-error";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().nullable()
});

categoriesRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } }
    });

    res.json(categories);
  })
);

categoriesRouter.get(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: { title: "asc" },
          include: {
            authors: { include: { author: true } }
          }
        }
      }
    });

    if (!category) {
      throw notFound("Categorie introuvable.");
    }

    res.json(category);
  })
);

categoriesRouter.post(
  "/categories",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = categorySchema.parse(req.body);

    const category = await prisma.category.create({ data: payload });

    res.status(201).json(category);
  })
);

categoriesRouter.put(
  "/categories/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = categorySchema.parse(req.body);
    const id = String(req.params.id);

    const category = await prisma.category.update({
      where: { id },
      data: payload
    });

    res.json(category);
  })
);

categoriesRouter.delete(
  "/categories/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const linkedBooks = await prisma.book.count({ where: { categoryId: id } });

    if (linkedBooks > 0) {
      throw new HttpError(409, "category_has_books", "Impossible de supprimer une categorie liee a des livres.");
    }

    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  })
);

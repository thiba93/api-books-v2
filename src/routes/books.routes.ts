import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { HttpError, notFound } from "../utils/http-error";

export const booksRouter = Router();

const bookBaseSchema = z.object({
  title: z.string().trim().min(1).max(180),
  isbn: z.string().trim().min(3).max(32).optional().nullable(),
  description: z.string().trim().max(3000).optional().nullable(),
  publishedAt: z.string().date().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  totalStock: z.number().int().min(0),
  availableStock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid(),
  authorIds: z.array(z.string().uuid()).min(1)
});

const bookCreateSchema = bookBaseSchema
  .refine((data) => (data.availableStock ?? data.totalStock) <= data.totalStock, {
    message: "availableStock ne peut pas depasser totalStock.",
    path: ["availableStock"]
  });

const bookUpdateSchema = bookBaseSchema.partial().refine(
  (data) =>
    data.totalStock === undefined ||
    data.availableStock === undefined ||
    data.availableStock <= data.totalStock,
  {
    message: "availableStock ne peut pas depasser totalStock.",
    path: ["availableStock"]
  }
);

const bookInclude = {
  category: true,
  authors: {
    include: {
      author: true
    }
  }
} satisfies Prisma.BookInclude;

booksRouter.get(
  "/books",
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const available = req.query.available === "true" ? true : req.query.available === "false" ? false : undefined;

    const where: Prisma.BookWhereInput = {
      ...(categoryId ? { categoryId } : {}),
      ...(available === true ? { availableStock: { gt: 0 } } : {}),
      ...(available === false ? { availableStock: 0 } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { isbn: { contains: search, mode: "insensitive" } },
              {
                authors: {
                  some: {
                    author: {
                      OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } }
                      ]
                    }
                  }
                }
              }
            ]
          }
        : {})
    };

    const [total, items] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: bookInclude,
        orderBy: { title: "asc" },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  })
);

booksRouter.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id },
      include: bookInclude
    });

    if (!book) {
      throw notFound("Livre introuvable.");
    }

    res.json(book);
  })
);

booksRouter.post(
  "/books",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = bookCreateSchema.parse(req.body);

    const book = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id: payload.categoryId } });
      if (!category) {
        throw new HttpError(400, "invalid_category", "Categorie invalide.");
      }

      const authors = await tx.author.count({ where: { id: { in: payload.authorIds } } });
      if (authors !== new Set(payload.authorIds).size) {
        throw new HttpError(400, "invalid_authors", "Un ou plusieurs auteurs sont invalides.");
      }

      return tx.book.create({
        data: {
          title: payload.title,
          isbn: payload.isbn,
          description: payload.description,
          publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
          coverUrl: payload.coverUrl,
          totalStock: payload.totalStock,
          availableStock: payload.availableStock ?? payload.totalStock,
          categoryId: payload.categoryId,
          authors: {
            createMany: {
              data: [...new Set(payload.authorIds)].map((authorId) => ({ authorId }))
            }
          }
        },
        include: bookInclude
      });
    });

    res.status(201).json(book);
  })
);

booksRouter.put(
  "/books/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = bookUpdateSchema.parse(req.body);
    const id = String(req.params.id);

    const book = await prisma.$transaction(async (tx) => {
      const existingBook = await tx.book.findUnique({ where: { id } });
      if (!existingBook) {
        throw notFound("Livre introuvable.");
      }

      if (payload.categoryId) {
        const category = await tx.category.findUnique({ where: { id: payload.categoryId } });
        if (!category) {
          throw new HttpError(400, "invalid_category", "Categorie invalide.");
        }
      }

      if (payload.authorIds) {
        const authorIds = [...new Set(payload.authorIds)];
        const authors = await tx.author.count({ where: { id: { in: authorIds } } });
        if (authors !== authorIds.length) {
          throw new HttpError(400, "invalid_authors", "Un ou plusieurs auteurs sont invalides.");
        }

        await tx.bookAuthor.deleteMany({ where: { bookId: id } });
        await tx.bookAuthor.createMany({
          data: authorIds.map((authorId) => ({
            bookId: id,
            authorId
          }))
        });
      }

      const nextTotalStock = payload.totalStock ?? existingBook.totalStock;
      const nextAvailableStock = payload.availableStock ?? existingBook.availableStock;

      if (nextAvailableStock > nextTotalStock) {
        throw new HttpError(400, "invalid_stock", "Le stock disponible ne peut pas depasser le stock total.");
      }

      return tx.book.update({
        where: { id },
        data: {
          title: payload.title,
          isbn: payload.isbn,
          description: payload.description,
          publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
          coverUrl: payload.coverUrl,
          totalStock: payload.totalStock,
          availableStock: payload.availableStock,
          categoryId: payload.categoryId
        },
        include: bookInclude
      });
    });

    res.json(book);
  })
);

booksRouter.delete(
  "/books/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const activeLoans = await prisma.loan.count({
      where: {
        bookId: id,
        status: "ACTIVE"
      }
    });

    if (activeLoans > 0) {
      throw new HttpError(409, "book_has_active_loans", "Impossible de supprimer un livre avec emprunt actif.");
    }

    await prisma.book.delete({ where: { id } });
    res.status(204).send();
  })
);

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@apibooks.fr" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "Books",
      email: "admin@apibooks.fr",
      passwordHash,
      role: "ADMIN"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@apibooks.fr" },
    update: {},
    create: {
      firstName: "User",
      lastName: "Demo",
      email: "user@apibooks.fr",
      passwordHash,
      role: "USER"
    }
  });

  const category = await prisma.category.upsert({
    where: { name: "Developpement" },
    update: {},
    create: {
      name: "Developpement",
      description: "Livres autour du developpement logiciel."
    }
  });

  const author = await prisma.author.create({
    data: {
      firstName: "Robert",
      lastName: "Martin",
      biography: "Auteur specialise dans la qualite logicielle."
    }
  });

  const book = await prisma.book.upsert({
    where: { isbn: "9780132350884" },
    update: {},
    create: {
      title: "Clean Code",
      isbn: "9780132350884",
      description: "Guide de bonnes pratiques pour produire du code lisible.",
      publishedAt: new Date("2008-08-01"),
      totalStock: 3,
      availableStock: 3,
      categoryId: category.id,
      authors: {
        create: {
          authorId: author.id
        }
      }
    }
  });

  await prisma.favorite.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: book.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      bookId: book.id
    }
  });

  console.log(`Seed OK: admin=${admin.email}, user=${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

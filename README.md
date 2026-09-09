# API Books v2

API REST de gestion de bibliotheque realisee en groupe de 3.

Le projet vise un rendu propre, comprehensible et demonstrable : backend structure,
base Neon/PostgreSQL, authentification JWT, documentation Swagger/OpenAPI, tests et
deploiement sans Docker.

## Choix techniques

| Besoin | Choix |
| --- | --- |
| Backend | Node.js + Express + TypeScript |
| Base de donnees | Neon PostgreSQL distante |
| ORM | Prisma |
| Authentification | JWT |
| Validation | Zod |
| Documentation API | Swagger / OpenAPI |
| Tests | Jest + Supertest |
| Deploiement vise | Render, Railway ou equivalent, sans Docker |

Pourquoi ce choix : Express et TypeScript restent rapides a developper, Prisma
documente clairement le modele de donnees, Neon permet aux 3 membres d utiliser
la meme base distante, et Swagger/Jest donnent des preuves visibles pour la soutenance.

## Prerequis

- Node.js 20 ou plus.
- Un projet Neon avec une base PostgreSQL distante.
- La variable `DATABASE_URL` fournie par Neon.
- Aucun Docker requis.

## Installation

```bash
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate:deploy
npm run db:seed
npm run dev
```

Avec PowerShell, si `npm` est bloque par la politique d execution, utiliser :

```bash
npm.cmd install
npm.cmd run dev
```

## Variables d environnement

Copier `.env.example` vers `.env`, puis adapter si besoin :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/api_books_v2?sslmode=require&channel_binding=require"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="1d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

## Scripts

| Commande | Role |
| --- | --- |
| `npm run dev` | Lance le serveur en mode developpement |
| `npm run build` | Compile TypeScript vers `dist/` |
| `npm start` | Lance la version compilee |
| `npm test` | Lance les tests |
| `npm run prisma:generate` | Genere le client Prisma |
| `npm run prisma:migrate` | Cree/applique une migration pendant le developpement |
| `npm run prisma:migrate:deploy` | Applique les migrations existantes sur Neon |
| `npm run prisma:studio` | Ouvre Prisma Studio |
| `npm run db:seed` | Ajoute des donnees de demonstration |

## Routes deja disponibles

- `GET /health`
- `GET /api/health`
- `GET /api`
- `GET /api/docs`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/authors`
- `GET /api/authors/:id`
- `POST /api/authors`
- `PUT /api/authors/:id`
- `DELETE /api/authors/:id`
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

## Fonctionnalites prevues

- CRUD livres.
- CRUD auteurs.
- CRUD categories.
- Inscription et connexion utilisateur.
- Authentification JWT.
- Roles `ADMIN` et `USER`.
- Emprunts de livres.
- Retours de livres.
- Favoris utilisateur.
- Recherche, filtres et pagination.
- Documentation Swagger.
- Tests des parcours critiques.

## Structure

```text
api-books-v2/
  prisma/
    schema.prisma
    seed.ts
  src/
    app.ts
    server.ts
    config/
    docs/
    middlewares/
    routes/
  tests/
  .env.example
  .gitignore
  package.json
  tsconfig.json
```

## Workflow Git

- `main` : version stable.
- `dev` : integration.
- `feature/<nom>` : nouvelle fonctionnalite.
- `fix/<nom>` : correction.
- `docs/<nom>` : documentation.

Chaque fonctionnalite doit passer par une pull request.

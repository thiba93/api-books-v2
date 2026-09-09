export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "API Books v2",
    version: "0.1.0",
    description: "API REST de gestion de livres, auteurs, categories, emprunts et favoris."
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local"
    }
  ],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Books" },
    { name: "Authors" },
    { name: "Categories" },
    { name: "Loans" },
    { name: "Favorites" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Verifier que l API repond",
        responses: {
          "200": {
            description: "API disponible"
          }
        }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Creer un compte utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" }
            }
          }
        },
        responses: {
          "201": { description: "Utilisateur cree" },
          "409": { description: "Email deja utilise" }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Connecter un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" }
            }
          }
        },
        responses: {
          "200": { description: "Token JWT et profil utilisateur" },
          "401": { description: "Identifiants invalides" }
        }
      }
    },
    "/me": {
      get: {
        tags: ["Auth"],
        summary: "Recuperer le profil connecte",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profil utilisateur" },
          "401": { description: "Token manquant ou invalide" }
        }
      }
    },
    "/books": {
      get: {
        tags: ["Books"],
        summary: "Lister les livres avec pagination et recherche",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "available", in: "query", schema: { type: "boolean" } }
        ],
        responses: {
          "200": { description: "Liste paginee des livres" }
        }
      },
      post: {
        tags: ["Books"],
        summary: "Creer un livre",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookInput" }
            }
          }
        },
        responses: {
          "201": { description: "Livre cree" },
          "403": { description: "Admin requis" }
        }
      }
    },
    "/books/{id}": {
      get: {
        tags: ["Books"],
        summary: "Afficher un livre",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Detail du livre" },
          "404": { description: "Livre introuvable" }
        }
      },
      put: {
        tags: ["Books"],
        summary: "Modifier un livre",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookInput" }
            }
          }
        },
        responses: {
          "200": { description: "Livre modifie" },
          "403": { description: "Admin requis" },
          "404": { description: "Livre introuvable" }
        }
      },
      delete: {
        tags: ["Books"],
        summary: "Supprimer un livre",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "Livre supprime" },
          "409": { description: "Livre lie a un emprunt actif" }
        }
      }
    },
    "/authors": {
      get: {
        tags: ["Authors"],
        summary: "Lister les auteurs",
        responses: { "200": { description: "Liste des auteurs" } }
      },
      post: {
        tags: ["Authors"],
        summary: "Creer un auteur",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthorInput" } } }
        },
        responses: { "201": { description: "Auteur cree" }, "403": { description: "Admin requis" } }
      }
    },
    "/authors/{id}": {
      get: {
        tags: ["Authors"],
        summary: "Afficher un auteur",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Detail auteur" }, "404": { description: "Auteur introuvable" } }
      },
      put: {
        tags: ["Authors"],
        summary: "Modifier un auteur",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthorInput" } } }
        },
        responses: { "200": { description: "Auteur modifie" } }
      },
      delete: {
        tags: ["Authors"],
        summary: "Supprimer un auteur",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Auteur supprime" }, "409": { description: "Auteur lie a un livre" } }
      }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Lister les categories",
        responses: { "200": { description: "Liste des categories" } }
      },
      post: {
        tags: ["Categories"],
        summary: "Creer une categorie",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } }
        },
        responses: { "201": { description: "Categorie creee" }, "403": { description: "Admin requis" } }
      }
    },
    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Afficher une categorie",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Detail categorie" }, "404": { description: "Categorie introuvable" } }
      },
      put: {
        tags: ["Categories"],
        summary: "Modifier une categorie",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } }
        },
        responses: { "200": { description: "Categorie modifiee" } }
      },
      delete: {
        tags: ["Categories"],
        summary: "Supprimer une categorie",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Categorie supprimee" }, "409": { description: "Categorie liee a un livre" } }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        }
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        }
      },
      BookInput: {
        type: "object",
        required: ["title", "totalStock", "categoryId", "authorIds"],
        properties: {
          title: { type: "string" },
          isbn: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          publishedAt: { type: "string", format: "date", nullable: true },
          coverUrl: { type: "string", format: "uri", nullable: true },
          totalStock: { type: "integer", minimum: 0 },
          availableStock: { type: "integer", minimum: 0 },
          categoryId: { type: "string", format: "uuid" },
          authorIds: {
            type: "array",
            items: { type: "string", format: "uuid" }
          }
        }
      },
      AuthorInput: {
        type: "object",
        required: ["lastName"],
        properties: {
          firstName: { type: "string", nullable: true },
          lastName: { type: "string" },
          biography: { type: "string", nullable: true }
        }
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true }
        }
      }
    }
  }
};

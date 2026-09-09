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
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

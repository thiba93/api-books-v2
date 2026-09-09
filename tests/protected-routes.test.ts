import request from "supertest";
import { createApp } from "../src/app";

describe("protected write routes", () => {
  const app = createApp();

  it.each([
    ["POST", "/api/books"],
    ["PUT", "/api/books/book-id"],
    ["DELETE", "/api/books/book-id"],
    ["POST", "/api/authors"],
    ["PUT", "/api/authors/author-id"],
    ["DELETE", "/api/authors/author-id"],
    ["POST", "/api/categories"],
    ["PUT", "/api/categories/category-id"],
    ["DELETE", "/api/categories/category-id"]
  ])("%s %s requires authentication", async (method, path) => {
    const response = await request(app)[method.toLowerCase() as "post" | "put" | "delete"](path).send({});

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("missing_token");
  });
});

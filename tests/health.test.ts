import request from "supertest";
import { createApp } from "../src/app";

describe("health routes", () => {
  const app = createApp();

  it("returns public health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      service: "api-books-v2"
    });
  });

  it("returns api health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

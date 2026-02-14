import { Hono } from "hono";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { sendError } from "./lib/response";
import withPrisma from "./lib/prisma";
import { cors } from "hono/cors";
import router from "./routes";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: false,
  }),
);

app.use("*", logger());
app.use("*", withPrisma);
app.route("/", router);
app.get("/", (c) => {
  return c.text("Hello World");
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return sendError(c, error.message, error.status);
  }

  console.error("Unhandled error: ", error);
  return sendError(c, "Internal server error", 500);
});

app.notFound((c) => {
  return sendError(c, "Route not found", 404);
});

export default process.env.NODE_ENV !== "production"
  ? {
      port: parseInt(process.env.PORT || "8000"),
      fetch: app.fetch,
    }
  : app;

export const fetch = app.fetch;

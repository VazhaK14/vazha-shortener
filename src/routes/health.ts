import { Hono } from "hono";
import { sendSuccess } from "../lib/response";

const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  return sendSuccess(
    c,
    {
      timestamp: new Date().toISOString(),
    },
    "Shortener is Running",
  );
});

export default healthRoutes;

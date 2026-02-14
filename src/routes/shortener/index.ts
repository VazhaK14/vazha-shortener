import { Hono } from "hono";
import { createShortUrl, redirectUrl } from "./handler";

const shortenerRoutes = new Hono();

shortenerRoutes.post("/shortener", createShortUrl);

shortenerRoutes.get("/:slug", redirectUrl);

export default shortenerRoutes;

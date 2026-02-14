import { Hono } from "hono";
import shortenerRoutes from "./shortener";
import healthRoutes from "./health";

const router = new Hono();

router.route("/", shortenerRoutes);
router.route("/health", healthRoutes);

export default router;

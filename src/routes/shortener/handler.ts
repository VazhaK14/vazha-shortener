import type { Context } from "hono";
import { sendSuccess, sendError } from "../../lib/response";
import { Bindings } from "../../lib/prisma";

const URL_VALIDATOR_REGEX = new RegExp(
  "^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \.-]*)*\\/?$",
);

type ShortUrlBody = {
  slug: string;
  originalUrl: string;
};

export const createShortUrl = async (c: Context<Bindings>) => {
  const prisma = c.get("prisma");
  try {
    const body: ShortUrlBody = await c.req.json();
    const slug = body.slug;
    let originalUrl = body.originalUrl;

    if (!slug || !originalUrl) {
      console.error("Request not found");
      return sendError(c, "Shortener input and original url needed", 400);
    }

    if (!URL_VALIDATOR_REGEX.test(originalUrl)) {
      return sendError(c, "Please input a valid URL", 400);
    }

    originalUrl = originalUrl.startsWith("http")
      ? originalUrl
      : `http://${originalUrl}`;

    const newUrlShortened = await prisma.shortUrl.create({
      data: { slug, originalUrl },
    });

    return sendSuccess(c, newUrlShortened, "URL shortened successfully", 200);
  } catch (error) {
    console.error(error);
    return sendError(
      c,
      error instanceof Error ? error.message : "Failed to fetch shortener",
      500,
    );
  }
};

export const redirectUrl = async (c: Context<Bindings>) => {
  const prisma = c.get("prisma");
  try {
    const slug = c.req.param("slug");
    if (!slug) {
      return sendError(c, "Request parameter not found", 400);
    }

    const redirectedUrl = await prisma.shortUrl.findUnique({
      where: { slug },
      select: { originalUrl: true },
    });

    if (!redirectedUrl) {
      return sendError(c, "Data Not Found", 404);
    }

    const updateCounterPromise = prisma.shortUrl
      .update({
        where: { slug },
        data: { clickCount: { increment: 1 } },
      })
      .catch((error) => console.error("Failed Update Counter", error));
    c.executionCtx.waitUntil(updateCounterPromise);
    return c.redirect(redirectedUrl.originalUrl, 302);
  } catch (error) {
    console.error(error);
    return sendError(
      c,
      error instanceof Error ? error.message : "Failed to fetch shortener",
      500,
    );
  }
};

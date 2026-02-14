import type { Context } from "hono";

type ApiResponse = {
  success: boolean;
  status: "success" | "error";
  message: string | null;
  data: any | null;
  errors: any[] | null;
  meta: Record<string, any> | null;
};

export const createResponse = (
  opts: Partial<ApiResponse> & {
    success: boolean;
    status: "success" | "error";
  },
) => {
  return {
    success: opts.success,
    status: opts.status,
    message: opts.message ?? null,
    data: opts.data ?? null,
    errors: opts.errors ?? null,
    meta: opts.meta ?? null,
  } as ApiResponse;
};

export const sendSuccess = (
  c: Context,
  data: any = null,
  message = "OK",
  statusCode = 200,
  meta: Record<string, any> | null = null,
) => {
  return c.json(
    createResponse({
      success: true,
      status: "success",
      message,
      data,
      errors: null,
      meta,
    }),
    { status: statusCode as unknown as any },
  );
};

export const sendError = (
  c: Context,
  message = "Error",
  statusCode = 500,
  errors: any = null,
  meta: Record<string, any> | null = null,
) => {
  return c.json(
    createResponse({
      success: false,
      status: "error",
      message,
      data: null,
      errors: Array.isArray(errors) ? errors : errors ? [errors] : null,
      meta,
    }),
    { status: statusCode as unknown as any },
  );
};

export const sendValidationError = (
  c: Context,
  message = "Validation failed",
  validationErrors: any[] = [],
  statusCode = 422,
) => {
  return sendError(c, message, statusCode, validationErrors, {
    type: "validation",
  });
};

export default {
  createResponse,
  sendSuccess,
  sendError,
  sendValidationError,
};

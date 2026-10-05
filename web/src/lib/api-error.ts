import { ZodError } from "zod";
import { errorResponse } from "./api-response";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code: string) {
    super(message);
  }
}

// Keep internal exception details out of responses and application logs.
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.status, error.code);
  }
  if (error instanceof Error && error.name === "VersionError") return errorResponse("Job changed. Refresh and retry.", 409, "CONFLICT");
  if (error instanceof ZodError) {
    const detail = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return errorResponse(`Invalid request: ${detail}`, 400, "INVALID_REQUEST");
  }
  if (error instanceof SyntaxError) {
    return errorResponse("Invalid request", 400, "INVALID_REQUEST");
  }
  return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
}

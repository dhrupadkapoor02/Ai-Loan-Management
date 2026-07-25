/**
 * Operational error class.
 *
 * Thrown deliberately from services/controllers for expected failure cases
 * (validation failures, not-found, unauthorized, conflicts, etc.), as
 * opposed to unexpected bugs/exceptions. The centralized error handler uses
 * `isOperational` to decide whether to expose the message to the client or
 * mask it with a generic "Internal Server Error".
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

export default ApiError;

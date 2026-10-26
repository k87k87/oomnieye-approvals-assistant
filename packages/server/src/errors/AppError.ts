export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, true, details);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = "AI operation exceeded 8s timeout threshold", details?: unknown) {
    super(message, 504, true, details);
  }
}

export class RateLimitExceededError extends AppError {
  constructor(
    message: string = "Too many requests to AI service. Please try again later.",
    details?: unknown,
  ) {
    super(message, 429, true, details);
  }
}

export class LLMServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, true, details);
  }
}

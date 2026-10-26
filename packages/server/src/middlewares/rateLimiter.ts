import rateLimit from "express-rate-limit";

/**
 * Basic per-session/IP throttling on the AI endpoints.
 * Limits each client to 60 requests per 1-minute window.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "AI request rate limit exceeded. Please wait a moment before sending another request.",
    },
  },
});

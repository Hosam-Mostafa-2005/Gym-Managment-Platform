// src/middleware/rateLimit.middleware.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

interface ClientRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory sliding-window rate limiter for sensitive authentication endpoints.
 * Automatically evicts expired records to prevent memory leaks.
 */
export const createRateLimiter = (options: RateLimitOptions): RequestHandler => {
  const {
    windowMs,
    max,
    message = "Too many requests. Please try again later.",
    keyGenerator = (req: Request) => {
      return req.ip || req.socket.remoteAddress || "unknown-ip";
    },
    skip = (req: Request) => {
      // In test mode, allow tests to bypass unless specifically testing rate limiting
      return process.env.NODE_ENV === "test" && !req.headers["x-test-rate-limit"];
    },
  } = options;

  const hits = new Map<string, ClientRecord>();

  // Periodically clean up expired entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetAt) {
        hits.delete(key);
      }
    }
  }, 2 * 60 * 1000);

  // Unref interval so it does not keep node process alive in tests or shutdown
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetAt) {
      hits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", max - 1);
      res.setHeader("RateLimit-Reset", Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", 0);
      res.setHeader("RateLimit-Reset", Math.ceil(record.resetAt / 1000));

      res.status(429).json({
        status: "fail",
        message,
      });
      return;
    }

    record.count += 1;
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", max - record.count);
    res.setHeader("RateLimit-Reset", Math.ceil(record.resetAt / 1000));
    next();
  };
};

/**
 * 5 password reset requests per 15 minutes per IP
 */
export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests from this address. Please try again after 15 minutes.",
});

/**
 * 10 recovery code verification attempts per 15 minutes per IP
 */
export const verifyResetCodeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts from this address. Please try again after 15 minutes.",
});

/**
 * 5 password reset submissions per 15 minutes per IP
 */
export const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset attempts from this address. Please try again after 15 minutes.",
});

/**
 * 20 authentication attempts (login/register) per 15 minutes per IP
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
});

/**
 * 15 email verification attempts per 15 minutes per IP
 */
export const verificationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many verification requests from this IP. Please try again after 15 minutes.",
});

/**
 * 60 workout share preview requests per 15 minutes per IP
 */
export const sharePreviewLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many share preview requests. Please try again later.",
});

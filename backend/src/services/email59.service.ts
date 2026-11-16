// src/services/email59.service.ts
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

export interface VerifyStartResult {
  success: boolean;
  id?: string;
  expiresInSeconds?: number;
  resendAfterSeconds?: number;
}

export interface VerifyCheckResult {
  valid: boolean;
  status: string;
  id?: string;
  attempts?: number;
  attemptsLeft?: number;
}

export type FetchFn = typeof fetch;

export class Email59Service {
  private baseUrl = "https://email59.com/v1/verify";
  private customFetch: FetchFn | null = null;

  /**
   * Inject custom fetch handler for unit testing
   */
  setFetchHandler(custom: FetchFn | null) {
    this.customFetch = custom;
  }

  private get fetchClient(): FetchFn {
    return this.customFetch || fetch;
  }

  private get apiKey(): string {
    if (this.customFetch && !env.EMAIL59_KEY) {
      return "test_mock_e59_key";
    }
    return env.EMAIL59_KEY ? env.EMAIL59_KEY.trim() : "";
  }

  /**
   * Start email verification by dispatching a 6-digit OTP to the user's email.
   * Documentation: POST https://email59.com/v1/verify/start
   */
  async startVerification(to: string): Promise<VerifyStartResult> {
    const normalizedTo = to.trim().toLowerCase();

    if (!normalizedTo) {
      throw new AppError("A valid email address is required.", 400);
    }

    if (!this.apiKey) {
      if (env.NODE_ENV === "production") {
        throw new AppError(
          "Email verification provider is not configured. Missing EMAIL59_KEY.",
          500,
        );
      }

      return {
        success: true,
        id: `vrf_dev_${Date.now()}`,
        expiresInSeconds: 600,
        resendAfterSeconds: 30,
      };
    }

    try {
      const response = await this.fetchClient(`${this.baseUrl}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: normalizedTo,
          app_name: "STREN",
        }),
        signal: AbortSignal.timeout(10000), // 10s maximum timeout
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle specific email59 error codes
        if (response.status === 422) {
          throw new AppError(
            "The email address provided is invalid, disposable, or cannot receive verification emails.",
            422,
          );
        }

        if (response.status === 429) {
          const detail =
            (typeof data.detail === "object" ? data.detail?.error : data.detail) ||
            data.error ||
            "";

          if (detail === "too_soon") {
            const retryAfter = data.retry_after_seconds || 30;
            throw new AppError(
              `Please wait ${retryAfter} seconds before requesting a new verification code.`,
              429,
            );
          }

          if (detail === "too_many_codes") {
            throw new AppError(
              "Too many verification requests for this email address. Please try again later.",
              429,
            );
          }

          if (detail === "daily_limit_reached") {
            throw new AppError(
              "Email verification service daily quota reached. Please contact support.",
              429,
            );
          }

          throw new AppError(
            "Too many verification attempts. Please wait a moment before trying again.",
            429,
          );
        }

        if (response.status === 401) {
          throw new AppError(
            "Email verification service authentication failed. Please check server configuration.",
            500,
          );
        }

        const fallbackMsg =
          (typeof data.detail === "object" ? data.detail?.error : data.detail) ||
          data.message ||
          "Failed to send email verification code.";
        throw new AppError(fallbackMsg, response.status < 500 ? response.status : 502);
      }

      return {
        success: true,
        id: data.id,
        expiresInSeconds: data.expires_in_seconds || 600,
        resendAfterSeconds: data.resend_after_seconds || 30,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new AppError(
          "Email verification service timed out. Please check your network connection and try again.",
          504,
        );
      }

      throw new AppError(
        "Email verification service is temporarily unreachable. Please try again shortly.",
        503,
      );
    }
  }

  /**
   * Check verification OTP submitted by user.
   * Documentation: POST https://email59.com/v1/verify/check
   */
  async checkVerification(to: string, code: string): Promise<VerifyCheckResult> {
    const normalizedTo = to.trim().toLowerCase();
    const sanitizedCode = code.trim().replace(/[\s-]/g, "");

    if (!normalizedTo) {
      throw new AppError("A valid email address is required.", 400);
    }

    if (!sanitizedCode || !/^\d{4,10}$/.test(sanitizedCode)) {
      throw new AppError("Verification code must be 6 digits.", 400);
    }

    if (!this.apiKey) {
      const isExplicitDevBypassAllowed =
        env.NODE_ENV === "development" &&
        process.env.ALLOW_DEV_OTP === "true";

      if (isExplicitDevBypassAllowed) {
        if (sanitizedCode === "123456") {
          return {
            valid: true,
            status: "approved",
            id: "vrf_dev_approved",
          };
        }
        throw new AppError("Incorrect verification code.", 400);
      }

      throw new AppError(
        "Email verification provider is not configured. Missing EMAIL59_KEY.",
        500,
      );
    }

    try {
      const response = await this.fetchClient(`${this.baseUrl}/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: normalizedTo,
          code: sanitizedCode,
        }),
        signal: AbortSignal.timeout(10000), // 10s maximum timeout
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new AppError(
            "Email verification service authentication failed. Please check server configuration.",
            500,
          );
        }

        const errorMsg =
          (typeof data.detail === "object" ? data.detail?.error : data.detail) ||
          data.message ||
          "Failed to verify code.";
        throw new AppError(errorMsg, response.status < 500 ? response.status : 502);
      }

      // Important: As per email59 documentation, check always returns HTTP 200.
      // Must strictly check data.valid === true and data.status === "approved".
      if (data.valid === true && data.status === "approved") {
        return {
          valid: true,
          status: "approved",
          id: data.id,
        };
      }

      // Handle specific invalid status conditions
      switch (data.status) {
        case "wrong_code": {
          const attemptsLeft = data.attempts_left;
          const attemptText =
            typeof attemptsLeft === "number"
              ? ` (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining)`
              : "";
          throw new AppError(
            `Incorrect verification code. Please check your inbox and try again${attemptText}.`,
            400,
          );
        }
        case "too_many_attempts":
          throw new AppError(
            "Too many incorrect attempts. This code has been locked. Please request a new code.",
            400,
          );
        case "expired":
          throw new AppError(
            "Verification code has expired. Please request a new code.",
            400,
          );
        case "already_used":
          throw new AppError(
            "This verification code has already been used. Please request a new code or sign in.",
            400,
          );
        case "replaced":
          throw new AppError(
            "A newer verification code was requested. Please use the newest code sent to your email.",
            400,
          );
        case "not_found":
          throw new AppError(
            "No active verification code found for this email address. Please request a new code.",
            400,
          );
        default:
          throw new AppError("Invalid or expired verification code.", 400);
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new AppError(
          "Email verification check timed out. Please try again.",
          504,
        );
      }

      throw new AppError(
        "Email verification service is temporarily unreachable. Please try again shortly.",
        503,
      );
    }
  }
}

export const email59Service = new Email59Service();
export default email59Service;

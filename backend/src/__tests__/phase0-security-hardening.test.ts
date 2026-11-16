import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Roles } from "../constants/roles.js";
import { googleAuthSchema } from "../validators/auth.validator.js";
import AppError from "../utils/AppError.js";
import globalErrorHandler from "../middleware/error.middleware.js";
import {
  authLimiter,
  verificationLimiter,
  sharePreviewLimiter,
  forgotPasswordLimiter,
} from "../middleware/rateLimit.middleware.js";
import exerciseService from "../services/exercise.service.js";

describe("Phase 0 — Security Hardening & Authorization Controls", () => {
  describe("1. Google Auth Schema & Role Constraints", () => {
    it("allows valid Google ID token with MEMBER or TRAINER intendedRole", () => {
      const memberAttempt = googleAuthSchema.safeParse({
        body: { idToken: "valid-token", intendedRole: Roles.MEMBER },
      });
      assert.equal(memberAttempt.success, true);

      const trainerAttempt = googleAuthSchema.safeParse({
        body: { idToken: "valid-token", intendedRole: Roles.TRAINER },
      });
      assert.equal(trainerAttempt.success, true);

      const noRoleAttempt = googleAuthSchema.safeParse({
        body: { idToken: "valid-token" },
      });
      assert.equal(noRoleAttempt.success, true);
    });

    it("rejects ADMIN or invalid roles in Google Auth registration", () => {
      const adminAttempt = googleAuthSchema.safeParse({
        body: { idToken: "valid-token", intendedRole: Roles.ADMIN },
      });
      assert.equal(adminAttempt.success, false);

      const invalidAttempt = googleAuthSchema.safeParse({
        body: { idToken: "valid-token", intendedRole: "superadmin" },
      });
      assert.equal(invalidAttempt.success, false);
    });
  });

  describe("2. Rate Limiting Middleware Registration", () => {
    it("exports dedicated rate limiters for auth, verification, and share preview", () => {
      assert.equal(typeof authLimiter, "function");
      assert.equal(typeof verificationLimiter, "function");
      assert.equal(typeof sharePreviewLimiter, "function");
      assert.equal(typeof forgotPasswordLimiter, "function");
    });
  });

  describe("3. Storage & Staged Image Deletion Isolation", () => {
    it("rejects deletion of avatar assets via exercise deleteStagedImage", async () => {
      const avatarUrl = "https://res.cloudinary.com/demo/image/upload/v1234567/stren/avatars/user123.jpg";
      const result = await exerciseService.deleteStagedImage(avatarUrl);
      assert.equal(result, false);
    });

    it("returns false for null, empty or undefined image URLs", async () => {
      assert.equal(await exerciseService.deleteStagedImage(null), false);
      assert.equal(await exerciseService.deleteStagedImage(undefined), false);
      assert.equal(await exerciseService.deleteStagedImage(""), false);
    });
  });

  describe("4. Prisma and JWT Global Error Handler", () => {
    it("formats Prisma P2002 unique constraint error as 409", () => {
      let status = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => {
          status = code;
          return res;
        },
        json: (data: any) => {
          jsonPayload = data;
          return res;
        },
      };

      const prismaError: any = new Error("Unique constraint failed");
      prismaError.code = "P2002";

      globalErrorHandler(prismaError, {} as any, res, (() => {}) as any);

      assert.equal(status, 409);
      assert.equal(jsonPayload.status, "fail");
      assert.match(jsonPayload.message, /unique value already exists/i);
    });

    it("formats Prisma P2025 not found error as 404", () => {
      let status = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => {
          status = code;
          return res;
        },
        json: (data: any) => {
          jsonPayload = data;
          return res;
        },
      };

      const prismaError: any = new Error("Record not found");
      prismaError.code = "P2025";

      globalErrorHandler(prismaError, {} as any, res, (() => {}) as any);

      assert.equal(status, 404);
      assert.equal(jsonPayload.status, "fail");
      assert.match(jsonPayload.message, /resource was not found/i);
    });

    it("formats JWT expiration as 401", () => {
      let status = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => {
          status = code;
          return res;
        },
        json: (data: any) => {
          jsonPayload = data;
          return res;
        },
      };

      const jwtError: any = new Error("jwt expired");
      jwtError.name = "TokenExpiredError";

      globalErrorHandler(jwtError, {} as any, res, (() => {}) as any);

      assert.equal(status, 401);
      assert.equal(jsonPayload.status, "fail");
      assert.match(jsonPayload.message, /expired/i);
    });
  });
});

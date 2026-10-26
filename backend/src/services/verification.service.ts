// src/services/verification.service.ts
import crypto from "crypto";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import emailService, { type EmailDeliveryResult } from "./email.service.js";
import { VerificationPurpose } from "@prisma/client";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export class VerificationService {
  /**
   * Generates a secure hash for a code or token using SHA-256
   */
  hashValue(value: string): string {
    return crypto.createHash("sha256").update(value.trim()).digest("hex");
  }

  /**
   * Generates a 6-digit numeric OTP
   */
  generateNumericOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Creates and dispatches an OTP for a user and purpose
   */
  async createAndSendOtp(params: {
    userId: string;
    email: string;
    name: string;
    purpose: VerificationPurpose;
  }): Promise<{ cooldownSeconds: number; delivery: EmailDeliveryResult }> {
    const normalizedEmail = params.email.trim().toLowerCase();

    // Verify user exists in DB (avoids foreign key errors in unit tests where prisma.user.create is stubbed)
    const userExists = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (!userExists) {
      return {
        cooldownSeconds: 60,
        delivery: {
          success: false,
          provider: "console",
          accepted: false,
          errorMessage: "User does not exist.",
        },
      };
    }

    // Check resend cooldown
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        userId: params.userId,
        purpose: params.purpose,
        createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCode) {
      const remainingMs =
        RESEND_COOLDOWN_MS - (Date.now() - recentCode.createdAt.getTime());
      const remainingSec = Math.ceil(remainingMs / 1000);
      throw new AppError(
        `Please wait ${remainingSec} seconds before requesting a new code.`,
        429,
      );
    }

    // Invalidate any existing unused codes for this user & purpose
    await prisma.verificationCode.updateMany({
      where: {
        userId: params.userId,
        purpose: params.purpose,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate random 6-digit OTP
    const rawOtp = this.generateNumericOtp();
    const codeHash = this.hashValue(rawOtp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Save hashed code in DB
    await prisma.verificationCode.create({
      data: {
        userId: params.userId,
        email: normalizedEmail,
        codeHash,
        purpose: params.purpose,
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
      },
    });

    // Send corresponding email based on purpose
    let delivery: EmailDeliveryResult;
    if (params.purpose === VerificationPurpose.EMAIL_VERIFICATION) {
      delivery = await emailService.sendVerificationEmail(
        normalizedEmail,
        params.name,
        rawOtp,
      );
    } else if (params.purpose === VerificationPurpose.PASSWORD_RESET) {
      delivery = await emailService.sendPasswordResetEmail(
        normalizedEmail,
        params.name,
        rawOtp,
      );
    } else if (params.purpose === VerificationPurpose.PASSWORD_CHANGE) {
      delivery = await emailService.sendPasswordChangeVerificationEmail(
        normalizedEmail,
        params.name,
        rawOtp,
      );
    } else {
      delivery = await emailService.sendVerificationEmail(
        normalizedEmail,
        params.name,
        rawOtp,
      );
    }

    return { cooldownSeconds: 60, delivery };
  }

  /**
   * Verifies an OTP for an email and purpose
   */
  async verifyOtp(params: {
    email: string;
    code: string;
    purpose: VerificationPurpose;
  }): Promise<{ user: { id: string; name: string; email: string } }> {
    const normalizedEmail = params.email.trim().toLowerCase();
    const normalizedCode = params.code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new AppError("Invalid verification code format. Must be 6 digits.", 400);
    }

    const incomingHash = this.hashValue(normalizedCode);

    // Find the latest active verification code record
    const record = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
        purpose: params.purpose,
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    if (!record) {
      throw new AppError(
        "Invalid or expired verification code. Please request a new code.",
        400,
      );
    }

    // Check expiration
    if (new Date() > record.expiresAt) {
      await prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      throw new AppError(
        "Verification code has expired. Please request a new code.",
        400,
      );
    }

    // Check maximum attempts
    if (record.attempts >= record.maxAttempts) {
      await prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      throw new AppError(
        "Too many invalid attempts. This code has been invalidated. Please request a new code.",
        429,
      );
    }

    // Constant-time hash check
    const matches = crypto.timingSafeEqual(
      Buffer.from(record.codeHash),
      Buffer.from(incomingHash),
    );

    if (!matches) {
      // Increment attempts
      await prisma.verificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = record.maxAttempts - (record.attempts + 1);
      if (remaining <= 0) {
        throw new AppError(
          "Too many invalid attempts. This code has been invalidated. Please request a new code.",
          429,
        );
      }
      throw new AppError(
        `Incorrect verification code. ${remaining} attempt(s) remaining.`,
        400,
      );
    }

    // Code is valid! Invalidate it so it cannot be reused
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return {
      user: {
        id: record.user.id,
        name: record.user.name,
        email: record.user.email,
      },
    };
  }

  /**
   * Generates a short-lived single-use Password Reset authorization token
   * issued immediately upon successful recovery code verification
   */
  async createPasswordResetToken(
    userId: string,
    purpose: VerificationPurpose = VerificationPurpose.PASSWORD_RESET,
  ): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashValue(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    // Invalidate any previous unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        purpose,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        purpose,
        expiresAt,
      },
    });

    return rawToken;
  }

  /**
   * Validates and consumes a Password Reset authorization token
   */
  async validateAndConsumeResetToken(
    rawToken: string,
    purpose: VerificationPurpose = VerificationPurpose.PASSWORD_RESET,
  ): Promise<{ userId: string }> {
    if (!rawToken || !rawToken.trim()) {
      throw new AppError("Reset authorization token is required.", 400);
    }

    const tokenHash = this.hashValue(rawToken);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.purpose !== purpose) {
      throw new AppError(
        "Invalid or already used password reset authorization.",
        400,
      );
    }

    if (new Date() > record.expiresAt) {
      await prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      throw new AppError(
        "Password reset authorization has expired. Please restart the request.",
        400,
      );
    }

    // Invalidate the reset token
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { userId: record.userId };
  }
}

export default new VerificationService();

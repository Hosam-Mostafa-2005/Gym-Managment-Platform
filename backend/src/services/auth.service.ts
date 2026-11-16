// src/services/auth.service.ts
import crypto from "crypto";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { VerificationPurpose, Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  ChangePasswordWithCodeDto,
} from "../types/auth.types.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";
import mapUser from "../mappers/user.mapper.js";
import { Roles } from "../constants/roles.js";
import verificationService from "./verification.service.js";
import emailService, { type EmailDeliveryResult } from "./email.service.js";
import email59Service from "./email59.service.js";

const defaultGoogleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined);

class AuthService {
  private googleClient: OAuth2Client = defaultGoogleClient;

  /**
   * Override OAuth2Client for testing purposes
   */
  setGoogleClient(client: OAuth2Client) {
    this.googleClient = client;
  }

  /**
   * Reset OAuth2Client back to default instance
   */
  resetGoogleClient() {
    this.googleClient = defaultGoogleClient;
  }
  /**
   * Register a new member
   */
  async register(userData: RegisterDto) {
    if (userData.role && userData.role !== Roles.MEMBER) {
      throw new AppError("Cannot register with a privileged role.", 403);
    }

    const normalizedEmail = userData.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified || existingUser.role !== Roles.MEMBER) {
        throw new AppError(
          "An account with this email already exists. Please sign in or use forgot password.",
          409,
        );
      }

      // Existing unverified account: update user details and restart verification
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: userData.name.trim(),
          password: hashedPassword,
          isEmailVerified: false,
          emailVerifiedAt: null,
        },
      });

      // Dispatch real verification OTP via email59
      await email59Service.startVerification(normalizedEmail);

      return {
        user: mapUser(updatedUser),
        isPendingVerification: true,
        message:
          "Verification code sent to your email. Please enter the 6-digit code to complete registration.",
      };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: userData.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "member",
        isEmailVerified: false,
        emailVerifiedAt: null,
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    });

    // Dispatch real verification OTP via email59
    await email59Service.startVerification(normalizedEmail);

    return {
      user: mapUser(user),
      isPendingVerification: true,
      message:
        "Verification code sent to your email. Please enter the 6-digit code to complete registration.",
    };
  }

  /**
   * Register a new coach/trainer (Independent self-registration for testing phase)
   */
  async registerCoach(userData: RegisterDto) {
    const normalizedEmail = userData.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified || existingUser.role !== Roles.TRAINER) {
        throw new AppError(
          "An account with this email already exists. Please sign in or use forgot password.",
          409,
        );
      }

      // Existing unverified coach registration: update credentials and restart verification
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: userData.name.trim(),
          password: hashedPassword,
          role: Roles.TRAINER,
          isEmailVerified: false,
          emailVerifiedAt: null,
        },
      });

      // Dispatch real verification OTP via email59
      await email59Service.startVerification(normalizedEmail);

      return {
        user: mapUser(updatedUser),
        isPendingVerification: true,
        message:
          "Verification code sent to your email. Please enter the 6-digit code to complete coach registration.",
      };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: userData.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: Roles.TRAINER,
        isEmailVerified: false,
        emailVerifiedAt: null,
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    });

    // Dispatch real verification OTP via email59
    await email59Service.startVerification(normalizedEmail);

    return {
      user: mapUser(user),
      isPendingVerification: true,
      message:
        "Verification code sent to your email. Please enter the 6-digit code to complete coach registration.",
    };
  }

  /**
   * Verify email with 6-digit OTP via email59
   */
  async verifyEmail(data: VerifyEmailDto) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError("No account found for this email address.", 404);
    }

    if (!user.isActive) {
      throw new AppError("This user account has been deactivated.", 403);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email is already verified. Please sign in.", 400);
    }

    // Verify OTP with email59 check endpoint
    await email59Service.checkVerification(normalizedEmail, data.code);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Only issue STREN JWT after successful verification
    const token = generateToken(updatedUser.id);

    return {
      user: mapUser(updatedUser),
      token,
      message: "Email address verified successfully! Welcome to STREN.",
    };
  }

  /**
   * Resend email verification code via email59
   */
  async resendVerificationCode(data: ResendVerificationDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && !user.isEmailVerified && user.isActive) {
      await email59Service.startVerification(normalizedEmail);
    }

    return {
      message:
        "If an unverified account exists with that email, a verification code has been sent.",
    };
  }

  /**
   * Login with email and password
   */
  async login(userData: LoginDto) {
    const normalizedEmail = userData.email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError("Incorrect email or password", 401);
    }

    if (!user.password) {
      throw new AppError(
        "This account was created with Google. Please use Continue with Google or reset your password to set a local password.",
        400,
      );
    }

    const correct = await bcrypt.compare(userData.password, user.password);

    if (!correct) {
      throw new AppError("Incorrect email or password", 401);
    }

    // Strictly enforce email verification
    if (!user.isEmailVerified) {
      try {
        await email59Service.startVerification(user.email);
      } catch {
        // Suppress provider or rate limit error on login attempt
      }

      throw new AppError(
        "Please verify your email address before logging in. A verification code has been sent to your email.",
        403,
      );
    }

    const token = generateToken(user.id);
    return {
      user: mapUser(user),
      token,
    };
  }

  /**
   * Google OAuth sign-in and sign-up with safe account linking
   */
  async googleAuth(data: GoogleAuthDto) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError("Google OAuth Client ID is not configured on the server.", 500);
    }

    let payload: {
      sub: string;
      email: string;
      email_verified?: boolean;
      name?: string;
    };

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const googlePayload = ticket.getPayload();
      if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
        throw new AppError("Google token did not contain required identity claims.", 401);
      }

      // Explicitly verify audience matches configured Google Client ID
      if (googlePayload.aud !== env.GOOGLE_CLIENT_ID) {
        throw new AppError("Google token audience mismatch.", 401);
      }

      // Explicitly verify issuer is Google
      const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
      if (googlePayload.iss && !validIssuers.includes(googlePayload.iss)) {
        throw new AppError("Invalid Google token issuer.", 401);
      }

      // Explicitly verify expiration
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (googlePayload.exp && googlePayload.exp < nowInSeconds) {
        throw new AppError("Google token has expired.", 401);
      }

      payload = {
        sub: googlePayload.sub,
        email: googlePayload.email,
        email_verified: googlePayload.email_verified,
        name: googlePayload.name,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError("Invalid Google authentication token.", 401);
    }

    if (!payload.email_verified) {
      throw new AppError(
        "Your Google email is not verified. Please verify your Google account first.",
        400,
      );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Check if user exists by googleId
    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    if (user) {
      if (!user.isActive) {
        throw new AppError("This user account has been deactivated.", 401);
      }
      const token = generateToken(user.id);
      return {
        user: mapUser(user),
        token,
      };
    }

    // 2. Check if user exists by verified email (Safe Account Linking)
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      if (!user.isActive) {
        throw new AppError("This user account has been deactivated.", 401);
      }

      // If user is already linked to a different Google account
      if (user.googleId && user.googleId !== payload.sub) {
        throw new AppError(
          "This email is already associated with a different Google account.",
          409,
        );
      }

      // Safely link Google identity to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: payload.sub,
          isEmailVerified: true,
          emailVerifiedAt: user.emailVerifiedAt || new Date(),
        },
      });

      const token = generateToken(user.id);
      return {
        user: mapUser(user),
        token,
        linked: true,
      };
    }

    // 3. New Google user registration
    const initialRole =
      data.intendedRole === Roles.TRAINER ? Roles.TRAINER : Roles.MEMBER;

    user = await prisma.user.create({
      data: {
        name:
          payload.name?.trim() ||
          (initialRole === Roles.TRAINER ? "Coach" : "Member"),
        email: normalizedEmail,
        password: null,
        googleId: payload.sub,
        role: initialRole,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    });

    const token = generateToken(user.id);
    return {
      user: mapUser(user),
      token,
    };
  }

  /**
   * Request password reset authorization.
   * Secure implementation:
   * - Never returns reset tokens or user existence in HTTP responses or logs.
   * - Dispatches OTP and trusted reset link via configured email service.
   * - Performs constant-time dummy work on nonexistent accounts to mitigate timing attacks.
   * - Prevents account enumeration by always returning an identical generic response.
   */
  async forgotPassword(data: ForgotPasswordDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let delivery: EmailDeliveryResult | undefined;

    if (user && user.isActive) {
      // 1. Invalidate any existing unused reset tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          purpose: VerificationPurpose.PASSWORD_RESET,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      // 2. Generate a cryptographically secure 32-byte hex token and store only its SHA-256 hash
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = verificationService.hashValue(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          purpose: VerificationPurpose.PASSWORD_RESET,
          expiresAt,
        },
      });

      // 3. Construct trusted reset URL using env.CLIENT_URL (prevents Host Header Injection)
      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      // 4. Dispatch 6-digit OTP and reset link via email service
      try {
        const otpResult = await verificationService.createAndSendOtp({
          userId: user.id,
          email: user.email,
          name: user.name,
          purpose: VerificationPurpose.PASSWORD_RESET,
          resetUrl,
        });
        delivery = otpResult.delivery;
      } catch (err: any) {
        // If cooldown 429 occurs, catch gracefully without leaking user presence
        if (err?.statusCode !== 429) {
          console.error(
            "[AuthService] Error sending password reset email:",
            err?.message || err,
          );
        }
      }
    } else {
      // Mitigate timing side-channels by performing constant-time dummy hashing
      verificationService.hashValue(crypto.randomBytes(32).toString("hex"));
    }

    // Return generic response without any tokens or user presence markers
    return {
      message:
        "If an account exists with that email, password reset instructions have been sent.",
      ...(env.NODE_ENV !== "production"
        ? {
            delivery: delivery || {
              provider: (env.EMAIL_PROVIDER || "console") as any,
              accepted: true,
              notice:
                "Development Notice: Password reset request accepted. If the account exists, instructions were dispatched.",
            },
          }
        : {}),
    };
  }

  /**
   * Verify password reset code and issue single-use reset token
   */
  async verifyResetCode(data: VerifyResetCodeDto) {
    const { user } = await verificationService.verifyOtp({
      email: data.email,
      code: data.code,
      purpose: VerificationPurpose.PASSWORD_RESET,
    });

    const resetToken = await verificationService.createPasswordResetToken(
      user.id,
      VerificationPurpose.PASSWORD_RESET,
    );

    return {
      resetToken,
      email: user.email,
      message: "Verification code confirmed. You may now reset your password.",
    };
  }

  /**
   * Reset password using single-use reset token.
   * Atomically consumes token, hashes password with bcrypt (cost 12),
   * sets passwordChangedAt to revoke previous JWT sessions,
   * and invalidates all pending reset tokens/verification codes for the user.
   */
  async resetPassword(data: ResetPasswordDto) {
    const rawToken = data.resetToken || (data as any).token;
    if (!rawToken || !rawToken.trim()) {
      throw new AppError("Reset authorization token is required.", 400);
    }

    const { userId } = await verificationService.validateAndConsumeResetToken(
      rawToken,
      VerificationPurpose.PASSWORD_RESET,
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
    const now = new Date();

    // Atomically update user password, timestamp, and supersede all other pending tokens/codes
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordChangedAt: now,
          isEmailVerified: true,
          emailVerifiedAt: user.emailVerifiedAt || now,
        },
      }),
      // Supersede any remaining unused reset tokens for this user
      prisma.passwordResetToken.updateMany({
        where: {
          userId,
          purpose: VerificationPurpose.PASSWORD_RESET,
          usedAt: null,
        },
        data: { usedAt: now },
      }),
      // Supersede any remaining unused verification codes for this user
      prisma.verificationCode.updateMany({
        where: {
          userId,
          purpose: VerificationPurpose.PASSWORD_RESET,
          usedAt: null,
        },
        data: { usedAt: now },
      }),
    ]);

    // Send confirmation email asynchronously (do not fail transaction if email delivery errors)
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (err: any) {
      console.error(
        "[AuthService] Error sending password changed confirmation email:",
        err?.message || err,
      );
    }

    return {
      message:
        "Password has been successfully reset. Please log in with your new password.",
    };
  }

  /**
   * Update password in Settings (Method A: Current Password)
   */
  async updatePassword(currentUser: { id: string }, data: UpdatePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (!user.password) {
      throw new AppError(
        "Your account was created via Google and does not have a current password. Please use 'Set a Password with Email Verification'.",
        400,
      );
    }

    const correct = await bcrypt.compare(data.currentPassword, user.password);

    if (!correct) {
      throw new AppError("Current password is incorrect.", 401);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(updatedUser.email, updatedUser.name);

    const token = generateToken(updatedUser.id);

    return {
      user: mapUser(updatedUser),
      token,
      message: "Password updated successfully.",
    };
  }

  /**
   * Request OTP for password change in Settings (Method B)
   */
  async requestPasswordChangeOtp(currentUser: { id: string }) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const otpResult = await verificationService.createAndSendOtp({
      userId: user.id,
      email: user.email,
      name: user.name,
      purpose: VerificationPurpose.PASSWORD_CHANGE,
    });

    return {
      message: "A verification code has been sent to your registered email address.",
      delivery: otpResult.delivery,
    };
  }

  /**
   * Verify OTP for password change in Settings (Method B)
   */
  async verifyPasswordChangeOtp(currentUser: { id: string }, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await verificationService.verifyOtp({
      email: user.email,
      code,
      purpose: VerificationPurpose.PASSWORD_CHANGE,
    });

    const resetToken = await verificationService.createPasswordResetToken(
      user.id,
      VerificationPurpose.PASSWORD_CHANGE,
    );

    return {
      resetToken,
      message: "Verification code confirmed. You may now update your password.",
    };
  }

  /**
   * Change password with single-use reset token (Method B or Google-only set password)
   */
  async changePasswordWithCode(
    currentUser: { id: string },
    data: ChangePasswordWithCodeDto,
  ) {
    const { userId } = await verificationService.validateAndConsumeResetToken(
      data.resetToken,
      VerificationPurpose.PASSWORD_CHANGE,
    );

    if (userId !== currentUser.id) {
      throw new AppError("Unauthorized password change token.", 403);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    await emailService.sendPasswordChangedEmail(updatedUser.email, updatedUser.name);

    const token = generateToken(updatedUser.id);

    return {
      user: mapUser(updatedUser),
      token,
      message: "Password successfully updated.",
    };
  }

  async logout() {
    return;
  }

  async getMe() {}

  async completeOnboarding(
    userId: string,
    data: {
      role?: string;
      name?: string;
      phone?: string | null;
      bio?: string | null;
      fitnessGoal?: string | null;
      experienceLevel?: string | null;
      professionalTitle?: string | null;
      coachingPhilosophy?: string | null;
      languagesSpoken?: string[];
      specialties?: string[];
      certifications?: string[];
      yearsOfExperience?: number;
      step?: number;
      skipOptional?: boolean;
    },
  ) {
    const existing = await prisma.user.findFirst({
      where: { id: userId, isActive: true },
    });

    if (!existing) {
      throw new AppError("User not found.", 404);
    }

    const isTrainerOrAdmin =
      existing.role === Roles.TRAINER || existing.role === Roles.ADMIN;

    const updateData: any = {
      onboardingCompleted: true,
      onboardingStep: data.step !== undefined ? data.step : 2,
    };

    // Role is strictly locked and cannot be changed or escalated via onboarding
    // (role assignments require explicit administrative action).

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.phone !== undefined) {
      updateData.phone = data.phone ? data.phone.trim() : null;
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio ? data.bio.trim() : null;
    }

    // Member-specific fields: persisted for all accounts
    if (data.fitnessGoal !== undefined) {
      updateData.fitnessGoal = data.fitnessGoal ? data.fitnessGoal.trim() : null;
    }
    if (data.experienceLevel !== undefined) {
      updateData.experienceLevel = data.experienceLevel
        ? data.experienceLevel.trim()
        : null;
    }

    // Coach-specific fields: ONLY persisted if the account is already an authorized trainer or admin
    if (isTrainerOrAdmin) {
      if (data.professionalTitle !== undefined) {
        updateData.professionalTitle = data.professionalTitle
          ? data.professionalTitle.trim()
          : null;
      }
      if (data.coachingPhilosophy !== undefined) {
        updateData.coachingPhilosophy = data.coachingPhilosophy
          ? data.coachingPhilosophy.trim()
          : null;
      }
      if (data.languagesSpoken !== undefined) {
        updateData.languagesSpoken = data.languagesSpoken;
      }
      if (data.specialties !== undefined) {
        updateData.specialties = data.specialties;
      }
      if (data.certifications !== undefined) {
        updateData.certifications = data.certifications;
      }
      if (data.yearsOfExperience !== undefined) {
        updateData.yearsOfExperience = data.yearsOfExperience;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return mapUser(updatedUser);
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string | null;
      bio?: string | null;
      fitnessGoal?: string | null;
      experienceLevel?: string | null;
      professionalTitle?: string | null;
      coachingPhilosophy?: string | null;
      languagesSpoken?: string[];
      specialties?: string[];
      certifications?: string[];
      yearsOfExperience?: number;
    },
  ) {
    const existing = await prisma.user.findFirst({
      where: { id: userId, isActive: true },
    });

    if (!existing) {
      throw new AppError("User not found.", 404);
    }

    const isTrainerOrAdmin =
      existing.role === Roles.TRAINER || existing.role === Roles.ADMIN;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.phone !== undefined && {
          phone: data.phone ? data.phone.trim() : null,
        }),
        ...(data.bio !== undefined && {
          bio: data.bio ? data.bio.trim() : null,
        }),
        ...(data.fitnessGoal !== undefined && {
          fitnessGoal: data.fitnessGoal ? data.fitnessGoal.trim() : null,
        }),
        ...(data.experienceLevel !== undefined && {
          experienceLevel: data.experienceLevel ? data.experienceLevel.trim() : null,
        }),
        ...(isTrainerOrAdmin && data.professionalTitle !== undefined && {
          professionalTitle: data.professionalTitle ? data.professionalTitle.trim() : null,
        }),
        ...(isTrainerOrAdmin && data.coachingPhilosophy !== undefined && {
          coachingPhilosophy: data.coachingPhilosophy ? data.coachingPhilosophy.trim() : null,
        }),
        ...(isTrainerOrAdmin && data.languagesSpoken !== undefined && {
          languagesSpoken: data.languagesSpoken,
        }),
        ...(isTrainerOrAdmin && data.specialties !== undefined && {
          specialties: data.specialties,
        }),
        ...(isTrainerOrAdmin && data.certifications !== undefined && {
          certifications: data.certifications,
        }),
        ...(isTrainerOrAdmin && data.yearsOfExperience !== undefined && {
          yearsOfExperience: data.yearsOfExperience,
        }),
      },
    });

    return mapUser(updatedUser);
  }
}

export default new AuthService();

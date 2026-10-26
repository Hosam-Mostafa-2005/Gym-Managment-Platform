// src/services/auth.service.ts
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { VerificationPurpose } from "@prisma/client";
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
      if (existingUser.isEmailVerified) {
        throw new AppError(
          "An account with this email already exists. Please sign in or use forgot password.",
          409,
        );
      }

      // Existing unverified account: update user details and re-dispatch verification code
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: userData.name.trim(),
          password: hashedPassword,
        },
      });

      let delivery: EmailDeliveryResult | undefined;
      try {
        const otpResult = await verificationService.createAndSendOtp({
          userId: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
        });
        delivery = otpResult.delivery;
      } catch (err: any) {
        if (err.statusCode === 429) {
          delivery = {
            success: true,
            provider: (env.EMAIL_PROVIDER || "console") as any,
            accepted: true,
            notice: "A verification code was recently dispatched. Cooldown active.",
          };
        } else {
          console.error(
            "[AuthService] Failed to dispatch pending registration OTP:",
            err,
          );
        }
      }

      const token = generateToken(updatedUser.id);
      return {
        user: mapUser(updatedUser),
        token,
        isPendingRegistration: true,
        delivery,
        message:
          "An unverified account with this email is pending verification. A fresh verification code has been dispatched.",
      };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: userData.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "member",
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    });

    let delivery: EmailDeliveryResult | undefined;
    try {
      const otpResult = await verificationService.createAndSendOtp({
        userId: user.id,
        email: user.email,
        name: user.name,
        purpose: VerificationPurpose.EMAIL_VERIFICATION,
      });
      delivery = otpResult.delivery;
    } catch (err) {
      console.error("[AuthService] Failed to dispatch registration OTP:", err);
    }

    const token = generateToken(user.id);

    return {
      user: mapUser(user),
      token,
      isPendingRegistration: false,
      delivery,
      message:
        delivery?.accepted
          ? "Account registered successfully. A verification code has been sent to your email."
          : "Account registered successfully. Please enter your 6-digit verification code.",
    };
  }

  /**
   * Verify email with 6-digit OTP
   */
  async verifyEmail(data: VerifyEmailDto) {
    const { user: verifiedSummary } = await verificationService.verifyOtp({
      email: data.email,
      code: data.code,
      purpose: VerificationPurpose.EMAIL_VERIFICATION,
    });

    const user = await prisma.user.update({
      where: { id: verifiedSummary.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const token = generateToken(user.id);

    return {
      user: mapUser(user),
      token,
      message: "Email address verified successfully.",
    };
  }

  /**
   * Resend email verification code
   */
  async resendVerificationCode(data: ResendVerificationDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let delivery: EmailDeliveryResult | undefined;
    if (user && !user.isEmailVerified && user.isActive) {
      const otpResult = await verificationService.createAndSendOtp({
        userId: user.id,
        email: user.email,
        name: user.name,
        purpose: VerificationPurpose.EMAIL_VERIFICATION,
      });
      delivery = otpResult.delivery;
    }

    return {
      message:
        "If an unverified account exists with that email, a verification code has been sent.",
      delivery,
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

    // Email verification check
    if (!user.isEmailVerified) {
      try {
        await verificationService.createAndSendOtp({
          userId: user.id,
          email: user.email,
          name: user.name,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
        });
      } catch {
        // Cooldown active, ignore
      }

      throw new AppError(
        "Please verify your email address to continue. A new verification code has been sent.",
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
    user = await prisma.user.create({
      data: {
        name: payload.name?.trim() || "Member",
        email: normalizedEmail,
        password: null,
        googleId: payload.sub,
        role: "member",
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
   * Request password reset code
   */
  async forgotPassword(data: ForgotPasswordDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let delivery: EmailDeliveryResult | undefined;
    if (user && user.isActive) {
      try {
        const otpResult = await verificationService.createAndSendOtp({
          userId: user.id,
          email: user.email,
          name: user.name,
          purpose: VerificationPurpose.PASSWORD_RESET,
        });
        delivery = otpResult.delivery;
      } catch (err: any) {
        // If rate-limited, surface error message
        if (err.statusCode === 429) {
          throw err;
        }
      }
    }

    // Generic safe response to prevent user enumeration
    return {
      message:
        "If an account exists with that email, a password reset code has been sent.",
      delivery,
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
   * Reset password using single-use reset token
   */
  async resetPassword(data: ResetPasswordDto) {
    const { userId } = await verificationService.validateAndConsumeResetToken(
      data.resetToken,
      VerificationPurpose.PASSWORD_RESET,
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        isEmailVerified: true,
        emailVerifiedAt: user.emailVerifiedAt || new Date(),
      },
    });

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email, user.name);

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
        ...(data.professionalTitle !== undefined && {
          professionalTitle: data.professionalTitle ? data.professionalTitle.trim() : null,
        }),
        ...(data.coachingPhilosophy !== undefined && {
          coachingPhilosophy: data.coachingPhilosophy ? data.coachingPhilosophy.trim() : null,
        }),
        ...(data.languagesSpoken !== undefined && {
          languagesSpoken: data.languagesSpoken,
        }),
        ...(data.specialties !== undefined && {
          specialties: data.specialties,
        }),
        ...(data.certifications !== undefined && {
          certifications: data.certifications,
        }),
        ...(data.yearsOfExperience !== undefined && {
          yearsOfExperience: data.yearsOfExperience,
        }),
        onboardingCompleted: true,
        onboardingStep: data.step !== undefined ? data.step : 2,
      },
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
        ...(data.professionalTitle !== undefined && {
          professionalTitle: data.professionalTitle ? data.professionalTitle.trim() : null,
        }),
        ...(data.coachingPhilosophy !== undefined && {
          coachingPhilosophy: data.coachingPhilosophy ? data.coachingPhilosophy.trim() : null,
        }),
        ...(data.languagesSpoken !== undefined && {
          languagesSpoken: data.languagesSpoken,
        }),
        ...(data.specialties !== undefined && {
          specialties: data.specialties,
        }),
        ...(data.certifications !== undefined && {
          certifications: data.certifications,
        }),
        ...(data.yearsOfExperience !== undefined && {
          yearsOfExperience: data.yearsOfExperience,
        }),
      },
    });

    return mapUser(updatedUser);
  }
}

export default new AuthService();

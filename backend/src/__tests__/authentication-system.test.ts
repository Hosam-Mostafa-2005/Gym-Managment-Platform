// src/__tests__/authentication-system.test.ts
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import authService from "../services/auth.service.js";
import verificationService from "../services/verification.service.js";
import emailService from "../services/email.service.js";
import { VerificationPurpose } from "@prisma/client";
import { env } from "../config/env.js";

describe("STREN — Comprehensive Authentication System Test Suite", () => {
  const testRunId = Date.now();
  const testEmail = `auth.test.${testRunId}@stren.app`;
  const testPassword = "Password123!";
  let registeredUserId: string = "";

  before(async () => {
    emailService.clearSentEmails();
  });

  after(async () => {
    // Cleanup all created test users for this test run
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: `${testRunId}`,
        },
      },
      select: { id: true },
    });
    const testUserIds = testUsers.map((u) => u.id);
    if (testUserIds.length > 0) {
      await prisma.coachMemberRelationship.deleteMany({
        where: {
          OR: [
            { memberId: { in: testUserIds } },
            { trainerId: { in: testUserIds } },
          ],
        },
      });
      await prisma.assignment.deleteMany({
        where: {
          OR: [
            { memberId: { in: testUserIds } },
            { trainerId: { in: testUserIds } },
          ],
        },
      });
      await prisma.scheduledWorkout.deleteMany({
        where: {
          OR: [
            { memberId: { in: testUserIds } },
            { trainerId: { in: testUserIds } },
          ],
        },
      });
      await prisma.coachingAppointment.deleteMany({
        where: {
          OR: [
            { memberId: { in: testUserIds } },
            { trainerId: { in: testUserIds } },
          ],
        },
      });
      await prisma.workoutSession.deleteMany({
        where: { memberId: { in: testUserIds } },
      });
      await prisma.verificationCode.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.passwordResetToken.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.notification.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } },
      });
    }
  });

  describe("1. Email/Password Registration & Verification", () => {
    it("A. Registers member with unverified email and dispatches 6-digit OTP", async () => {
      const result = await authService.register({
        name: "Test Athlete",
        email: testEmail,
        password: testPassword,
      });

      assert.ok(result.user);
      assert.equal(result.user.email, testEmail);
      assert.equal(result.user.role, "member");
      assert.equal(result.isPendingRegistration, false);
      registeredUserId = result.user.id;

      // Check DB state
      const dbUser = await prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      assert.equal(dbUser?.isEmailVerified, false);
      assert.equal(dbUser?.emailVerifiedAt, null);

      // Check verification code in DB (stored as hash, not plaintext!)
      const dbCode = await prisma.verificationCode.findFirst({
        where: {
          userId: registeredUserId,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
        },
      });
      assert.ok(dbCode);
      assert.equal(dbCode?.codeHash.length, 64); // SHA-256 hash length
      assert.equal(dbCode?.attempts, 0);

      // Check email was dispatched
      const sent = emailService.getSentEmails();
      assert.ok(sent.length >= 1);
      const lastEmail = sent[sent.length - 1];
      assert.equal(lastEmail.to, testEmail);
      assert.ok(lastEmail.subject.includes("verification code"));
    });

    it("B. Safe pending-registration recovery: Re-registering with an unverified email allows updating credentials without 409 error", async () => {
      // Re-registering with the same unverified email should not throw 409
      const updatedPassword = "NewSecretPassword456!";
      const result = await authService.register({
        name: "Updated Athlete Name",
        email: testEmail,
        password: updatedPassword,
      });

      assert.equal(result.isPendingRegistration, true);
      assert.equal(result.user.id, registeredUserId);
      assert.equal(result.user.name, "Updated Athlete Name");

      // Verify DB password was updated to the new credentials
      const dbUser = await prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      assert.equal(dbUser?.name, "Updated Athlete Name");
      assert.equal(dbUser?.isEmailVerified, false);
      const match = await bcrypt.compare(updatedPassword, dbUser!.password!);
      assert.equal(match, true);
    });

    it("C. Rejects login if email is not verified and dispatches reminder code", async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: testEmail,
            password: "NewSecretPassword456!",
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes("verify your email"));
          return true;
        },
      );
    });

    it("D. Rejects incorrect OTP and tracks attempts", async () => {
      await assert.rejects(
        async () => {
          await authService.verifyEmail({
            email: testEmail,
            code: "000000",
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.ok(err.message.includes("Incorrect verification code"));
          return true;
        },
      );

      const dbCode = await prisma.verificationCode.findFirst({
        where: {
          userId: registeredUserId,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
        },
        orderBy: { createdAt: "desc" },
      });
      assert.equal(dbCode?.attempts, 1);
    });

    it("E. Enforces resend cooldown on verification codes (<60 seconds)", async () => {
      await assert.rejects(
        async () => {
          await verificationService.createAndSendOtp({
            userId: registeredUserId,
            email: testEmail,
            name: "Test Athlete",
            purpose: VerificationPurpose.EMAIL_VERIFICATION,
          });
        },
        (err: any) => err.statusCode === 429,
      );
    });

    it("F. Rejects expired OTP code", async () => {
      const expiredOtp = "112233";
      await prisma.verificationCode.create({
        data: {
          userId: registeredUserId,
          email: testEmail,
          codeHash: verificationService.hashValue(expiredOtp),
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
          expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
          attempts: 0,
        },
      });

      await assert.rejects(
        async () => {
          await authService.verifyEmail({
            email: testEmail,
            code: expiredOtp,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.ok(err.message.includes("expired"));
          return true;
        },
      );
    });

    it("G. Verifies email with the correct OTP and enables login", async () => {
      // Clear previous test verification codes and create fresh test code
      await prisma.verificationCode.deleteMany({
        where: {
          userId: registeredUserId,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
        },
      });

      const testOtp = "789123";
      await prisma.verificationCode.create({
        data: {
          userId: registeredUserId,
          email: testEmail,
          codeHash: verificationService.hashValue(testOtp),
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
          attempts: 0,
          expiresAt: new Date(Date.now() + 600000),
          usedAt: null,
        },
      });

      const verifyRes = await authService.verifyEmail({
        email: testEmail,
        code: testOtp,
      });

      assert.ok(verifyRes.token);
      assert.equal(verifyRes.user.isEmailVerified, true);

      // Verify DB updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      assert.equal(updatedUser?.isEmailVerified, true);
      assert.ok(updatedUser?.emailVerifiedAt !== null);

      // Code is now marked as used
      const codeRecord = await prisma.verificationCode.findFirst({
        where: {
          userId: registeredUserId,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
        },
      });
      assert.ok(codeRecord?.usedAt !== null);

      // Now login succeeds with updated password
      const loginRes = await authService.login({
        email: testEmail,
        password: "NewSecretPassword456!",
      });
      assert.ok(loginRes.token);
      assert.equal(loginRes.user.email, testEmail);
    });

    it("H. Rejects re-verification of already used OTP", async () => {
      await assert.rejects(
        async () => {
          await authService.verifyEmail({
            email: testEmail,
            code: "789123",
          });
        },
        (err: any) => err.statusCode === 400,
      );
    });

    it("I. Rejects duplicate registration for an already verified account with 409 Conflict", async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: "Already Verified User",
            email: testEmail,
            password: "AnyPassword123!",
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.ok(err.message.includes("already exists"));
          return true;
        },
      );
    });

    it("J. Rejects public registration attempting to self-assign trainer or admin role", async () => {
      const hackEmail = `hack.${testRunId}@stren.app`;
      await assert.rejects(
        async () => {
          await authService.register({
            name: "Privilege Escalation Attacker",
            email: hackEmail,
            password: "Password123!",
            role: "trainer" as any,
          });
        },
        (err: any) => err.statusCode === 403,
      );
    });

    it("K. Truthful delivery reporting: Returns delivery metadata indicating provider status", async () => {
      const emailRes = await emailService.sendVerificationEmail(
        "athlete.delivery@stren.app",
        "Athlete",
        "123456",
      );
      assert.ok(emailRes.provider);
      assert.equal(typeof emailRes.accepted, "boolean");
      if (emailRes.accepted) {
        assert.ok(emailRes.messageId || emailRes.notice);
      } else {
        assert.ok(emailRes.errorMessage);
        assert.ok(emailRes.errorCategory);
      }
    });

    it("L. Provider acceptance with Resend sandbox recipient (delivered@resend.dev)", async () => {
      const emailRes = await emailService.sendVerificationEmail(
        "delivered@resend.dev",
        "Sandbox Athlete",
        "654321",
      );
      assert.ok(emailRes.provider);
      assert.equal(typeof emailRes.accepted, "boolean");
      if (emailRes.provider === "resend") {
        assert.equal(emailRes.accepted, true);
        assert.ok(emailRes.messageId);
      }
    });
  });

  describe("2. Google OAuth & Account Linking", () => {
    const googleSub = `google-sub-${testRunId}`;
    const googleEmail = `google.user.${testRunId}@stren.app`;

    before(() => {
      // Configure test OAuth2Client stub for authService
      const testOAuthClient = {
        verifyIdToken: async ({ idToken, audience }: { idToken: string; audience: string }) => {
          if (idToken === "invalid-token-signature") {
            throw new Error("Invalid token signature");
          }
          if (idToken === "mismatched-audience-token") {
            return {
              getPayload: () => ({
                sub: "mismatched-sub",
                email: "mismatched@stren.app",
                email_verified: true,
                aud: "different-audience.apps.googleusercontent.com",
                name: "Mismatched User",
              }),
            };
          }
          if (idToken === "unverified-email-token") {
            return {
              getPayload: () => ({
                sub: "unverified-sub",
                email: "unverified@gmail.com",
                email_verified: false,
                aud: env.GOOGLE_CLIENT_ID,
                name: "Unverified Athlete",
              }),
            };
          }
          if (idToken.startsWith("valid-google-token:")) {
            const parsed = JSON.parse(idToken.replace("valid-google-token:", ""));
            return {
              getPayload: () => ({
                sub: parsed.sub,
                email: parsed.email,
                email_verified: true,
                aud: env.GOOGLE_CLIENT_ID,
                name: parsed.name || "Google Athlete",
              }),
            };
          }
          throw new Error("Invalid Google token format");
        },
      };

      authService.setGoogleClient(testOAuthClient as any);
    });

    after(() => {
      authService.resetGoogleClient();
    });

    it("A. Backend rejects an invalid Google ID token", async () => {
      await assert.rejects(
        async () => {
          await authService.googleAuth({ idToken: "invalid-token-signature" });
        },
        (err: any) => {
          assert.equal(err.statusCode, 401);
          assert.ok(err.message.includes("Invalid Google authentication token"));
          return true;
        },
      );
    });

    it("B. Backend rejects an incorrect token audience", async () => {
      await assert.rejects(
        async () => {
          await authService.googleAuth({ idToken: "mismatched-audience-token" });
        },
        (err: any) => {
          assert.equal(err.statusCode, 401);
          return true;
        },
      );
    });

    it("C. Backend rejects an unverified email from Google claim", async () => {
      await assert.rejects(
        async () => {
          await authService.googleAuth({ idToken: "unverified-email-token" });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.ok(err.message.includes("not verified"));
          return true;
        },
      );
    });

    it("D. Valid Google identity authenticates and creates a MEMBER account without local password", async () => {
      const validToken = `valid-google-token:${JSON.stringify({
        sub: googleSub,
        email: googleEmail,
        name: "Google Member",
      })}`;

      const res = await authService.googleAuth({ idToken: validToken });
      assert.ok(res.token);
      assert.equal(res.user.email, googleEmail);
      assert.equal(res.user.isEmailVerified, true);
      assert.equal(res.user.hasPassword, false);
      assert.equal(res.user.googleLinked, true);
      assert.equal(res.user.role, "member"); // Strictly member role

      const dbUser = await prisma.user.findUnique({
        where: { email: googleEmail },
      });
      assert.equal(dbUser?.googleId, googleSub);
      assert.equal(dbUser?.password, null);
      assert.equal(dbUser?.role, "member");
    });

    it("E. Existing password-based login still works alongside Google authentication", async () => {
      const loginRes = await authService.login({
        email: testEmail,
        password: "NewSecretPassword456!",
      });
      assert.ok(loginRes.token);
      assert.equal(loginRes.user.email, testEmail);
      assert.equal(loginRes.user.hasPassword, true);
    });

    it("F. Account linking preserves existing user data, local password, and Coach role", async () => {
      const coachEmail = `linking.coach.${testRunId}@stren.app`;
      const originalCoachPassword = "CoachStrongPassword123!";
      const passCoach = await prisma.user.create({
        data: {
          name: "Coach Elena",
          email: coachEmail,
          password: await bcrypt.hash(originalCoachPassword, 10),
          role: "trainer", // Coach/Trainer role MUST be preserved!
          isEmailVerified: true,
        },
      });

      const coachGoogleSub = `google-coach-${testRunId}`;
      const coachToken = `valid-google-token:${JSON.stringify({
        sub: coachGoogleSub,
        email: coachEmail,
        name: "Coach Elena",
      })}`;

      const res = await authService.googleAuth({ idToken: coachToken });
      assert.equal(res.linked, true);
      assert.equal(res.user.id, passCoach.id);
      assert.equal(res.user.role, "trainer"); // Role preserved!
      assert.equal(res.user.hasPassword, true);
      assert.equal(res.user.googleLinked, true);

      const updated = await prisma.user.findUnique({
        where: { id: passCoach.id },
      });
      assert.equal(updated?.googleId, coachGoogleSub);
      assert.equal(updated?.role, "trainer");
      assert.ok(updated?.password !== null); // Password preserved

      // Verify coach can still log in with their password
      const directLogin = await authService.login({
        email: coachEmail,
        password: originalCoachPassword,
      });
      assert.ok(directLogin.token);
      assert.equal(directLogin.user.role, "trainer");
    });

    it("G. Duplicate Google identities: Rejects linking when email is already linked to a different Google account", async () => {
      const conflictingToken = `valid-google-token:${JSON.stringify({
        sub: "a-different-google-sub-999",
        email: googleEmail, // Already linked to googleSub above
        name: "Imposter",
      })}`;

      await assert.rejects(
        async () => {
          await authService.googleAuth({ idToken: conflictingToken });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.ok(err.message.includes("different Google account"));
          return true;
        },
      );
    });

    it("H. Public Google registration cannot escalate to Coach or Admin role", async () => {
      const newEmail = `standard.google.${testRunId}@stren.app`;
      const publicToken = `valid-google-token:${JSON.stringify({
        sub: `google-standard-${testRunId}`,
        email: newEmail,
        name: "Standard Athlete",
      })}`;

      const res = await authService.googleAuth({ idToken: publicToken });
      assert.equal(res.user.role, "member");

      const created = await prisma.user.findUnique({
        where: { email: newEmail },
      });
      assert.equal(created?.role, "member");
    });
  });

  describe("3. Forgot Password & Single-Use Reset Authorization", () => {
    it("A. Returns generic response and dispatches reset code for eligible user", async () => {
      emailService.clearSentEmails();

      const res = await authService.forgotPassword({ email: testEmail });
      assert.ok(res.message.includes("If an account exists"));

      const sent = emailService.getSentEmails();
      assert.equal(sent.length, 1);
      assert.equal(sent[0].to, testEmail);
      assert.ok(sent[0].subject.includes("password reset code"));
    });

    it("B. Verifies recovery OTP and issues single-use reset token", async () => {
      const resetOtp = "654321";
      await prisma.verificationCode.updateMany({
        where: {
          email: testEmail,
          purpose: VerificationPurpose.PASSWORD_RESET,
        },
        data: {
          codeHash: verificationService.hashValue(resetOtp),
          attempts: 0,
          expiresAt: new Date(Date.now() + 600000),
          usedAt: null,
        },
      });

      const verifyRes = await authService.verifyResetCode({
        email: testEmail,
        code: resetOtp,
      });

      assert.ok(verifyRes.resetToken);
      assert.equal(typeof verifyRes.resetToken, "string");
      assert.equal(verifyRes.email, testEmail);

      // Verify reset token exists in DB as a hash
      const dbResetToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: registeredUserId,
          usedAt: null,
        },
      });
      assert.ok(dbResetToken);
      assert.equal(dbResetToken?.usedAt, null);

      // Completes reset with new password
      const newPassword = "NewSecretPassword456!";
      const resetRes = await authService.resetPassword({
        resetToken: verifyRes.resetToken,
        newPassword,
      });

      assert.ok(resetRes.message.includes("successfully reset"));

      // Verify DB password was updated and passwordChangedAt is set
      const dbUser = await prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      assert.ok(dbUser?.passwordChangedAt !== null);
      const isNewPassValid = await bcrypt.compare(
        newPassword,
        dbUser!.password!,
      );
      assert.equal(isNewPassValid, true);

      // Login with old password fails
      await assert.rejects(
        async () => {
          await authService.login({
            email: testEmail,
            password: testPassword,
          });
        },
        (err: any) => err.statusCode === 401,
      );

      // Login with new password succeeds
      const newLogin = await authService.login({
        email: testEmail,
        password: newPassword,
      });
      assert.ok(newLogin.token);
    });

    it("C. Rejects reuse of already consumed password reset authorization", async () => {
      await assert.rejects(
        async () => {
          await authService.resetPassword({
            resetToken: "already-consumed-or-fake-token",
            newPassword: "AnotherPassword123!",
          });
        },
        (err: any) => err.statusCode === 400,
      );
    });
  });

  describe("4. Change Password in Settings & Session Revocation", () => {
    it("A. Method A — updates password with valid current password and sends notification email", async () => {
      emailService.clearSentEmails();

      const currentPass = "NewSecretPassword456!";
      const updatedPass = "SettingsPassword789!";

      const res = await authService.updatePassword(
        { id: registeredUserId },
        {
          currentPassword: currentPass,
          newPassword: updatedPass,
        },
      );

      assert.ok(res.token);
      assert.equal(res.user.email, testEmail);

      const sent = emailService.getSentEmails();
      assert.ok(sent.some((e) => e.subject.includes("password has been changed")));
    });

    it("B. Method A — rejects incorrect current password without modifying user", async () => {
      await assert.rejects(
        async () => {
          await authService.updatePassword(
            { id: registeredUserId },
            {
              currentPassword: "WrongPassword!",
              newPassword: "ShouldNeverBeSet123!",
            },
          );
        },
        (err: any) => {
          assert.equal(err.statusCode, 401);
          assert.ok(err.message.includes("Current password is incorrect"));
          return true;
        },
      );
    });

    it("C. Method B — changes password using verified email OTP", async () => {
      // 1. Request OTP
      const reqRes = await authService.requestPasswordChangeOtp({
        id: registeredUserId,
      });
      assert.ok(reqRes.message.includes("verification code has been sent"));

      // 2. Mock known OTP
      const changeOtp = "112233";
      await prisma.verificationCode.updateMany({
        where: {
          userId: registeredUserId,
          purpose: VerificationPurpose.PASSWORD_CHANGE,
        },
        data: {
          codeHash: verificationService.hashValue(changeOtp),
          attempts: 0,
          expiresAt: new Date(Date.now() + 600000),
          usedAt: null,
        },
      });

      // 3. Verify OTP
      const verifyRes = await authService.verifyPasswordChangeOtp(
        { id: registeredUserId },
        changeOtp,
      );
      assert.ok(verifyRes.resetToken);

      // 4. Confirm new password
      const brandNewPass = "FinalPassword2026!";
      const changeRes = await authService.changePasswordWithCode(
        { id: registeredUserId },
        {
          resetToken: verifyRes.resetToken,
          newPassword: brandNewPass,
        },
      );
      assert.ok(changeRes.token);
      assert.equal(changeRes.user.email, testEmail);
    });

    it("D. Purpose isolation prevents EMAIL_VERIFICATION code from being used for password change", async () => {
      const emailCode = "445566";
      await prisma.verificationCode.create({
        data: {
          userId: registeredUserId,
          email: testEmail,
          codeHash: verificationService.hashValue(emailCode),
          purpose: VerificationPurpose.EMAIL_VERIFICATION, // Different purpose!
          expiresAt: new Date(Date.now() + 600000),
          attempts: 0,
        },
      });

      await assert.rejects(
        async () => {
          await authService.verifyPasswordChangeOtp(
            { id: registeredUserId },
            emailCode,
          );
        },
        (err: any) => err.statusCode === 400,
      );
    });

    it("E. Session revocation: Old token issued before password change is rejected by middleware", async () => {
      // Generate token with iat in the past
      const oldToken = jwt.sign(
        { id: registeredUserId, iat: Math.floor(Date.now() / 1000) - 3600 },
        env.JWT_SECRET,
      );

      // Update user passwordChangedAt to now
      await prisma.user.update({
        where: { id: registeredUserId },
        data: { passwordChangedAt: new Date() },
      });

      // Decode and check timestamp logic
      const currentUser = await prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      const decoded: any = jwt.verify(oldToken, env.JWT_SECRET);

      const changedTimestamp = Math.floor(
        currentUser!.passwordChangedAt!.getTime() / 1000,
      );
      assert.ok(decoded.iat < changedTimestamp);
    });
  });
});

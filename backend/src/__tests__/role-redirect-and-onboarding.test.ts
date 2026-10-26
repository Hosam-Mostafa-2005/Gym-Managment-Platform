// src/__tests__/role-redirect-and-onboarding.test.ts
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../config/prisma.js";
import authService from "../services/auth.service.js";
import coachProfileService from "../services/coach-profile.service.js";
import { Roles } from "../constants/roles.js";

describe("STREN — Role Redirect, Profile Onboarding & Post-Setup Editing Test Suite", () => {
  const testRunId = Date.now();
  const memberEmail = `onboarding.member.${testRunId}@stren.app`;
  const coachEmail = `onboarding.coach.${testRunId}@stren.app`;
  const testPassword = "Password123!";

  let memberUserId = "";
  let coachUserId = "";

  after(async () => {
    // Teardown created test accounts
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
      await prisma.verificationCode.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } },
      });
    }
  });

  it("1. Public registration sets role to MEMBER and onboardingCompleted to false", async () => {
    const regResult = await authService.register({
      name: "Onboarding Test Member",
      email: memberEmail,
      password: testPassword,
    });

    assert.ok(regResult.user, "User should be returned");
    memberUserId = regResult.user.id;

    assert.equal(regResult.user.role, Roles.MEMBER, "Role must default strictly to MEMBER");
    assert.equal(
      regResult.user.onboardingCompleted,
      false,
      "Newly registered member must have onboardingCompleted: false",
    );
    assert.equal(regResult.user.onboardingStep, 0, "Initial onboardingStep must be 0");

    // Verify in database directly
    const dbUser = await prisma.user.findUnique({
      where: { id: memberUserId },
    });
    assert.ok(dbUser);
    assert.equal(dbUser.onboardingCompleted, false);
    assert.equal(dbUser.onboardingStep, 0);
  });

  it("2. Member onboarding completes setup and persists fitness goals without privilege escalation", async () => {
    const memberSetupData = {
      name: "Alex Morgan Athlete",
      phone: "+1 555-019-2834",
      bio: "Focusing on progressive hypertrophy and functional mobility.",
      fitnessGoal: "STRENGTH_HYPERTROPHY",
      experienceLevel: "INTERMEDIATE",
      // Attemped escalation in payload should be ignored
      role: Roles.ADMIN,
    };

    const completionResult = await authService.completeOnboarding(
      memberUserId,
      memberSetupData as any,
    );

    assert.ok(completionResult, "Onboarding response must include updated user");
    assert.equal(
      completionResult.onboardingCompleted,
      true,
      "onboardingCompleted must be true after completion",
    );
    assert.equal(
      completionResult.role,
      Roles.MEMBER,
      "Role must remain strictly MEMBER (no privilege escalation)",
    );
    assert.equal(
      completionResult.name,
      "Alex Morgan Athlete",
      "Name must be updated",
    );
    assert.equal(
      completionResult.phone,
      "+1 555-019-2834",
      "Phone must be persisted",
    );
    assert.equal(
      completionResult.fitnessGoal,
      "STRENGTH_HYPERTROPHY",
      "fitnessGoal must be persisted",
    );
    assert.equal(
      completionResult.experienceLevel,
      "INTERMEDIATE",
      "experienceLevel must be persisted",
    );

    // Verify directly in database
    const dbUser = await prisma.user.findUnique({
      where: { id: memberUserId },
    });
    assert.ok(dbUser);
    assert.equal(dbUser.onboardingCompleted, true);
    assert.equal(dbUser.role, Roles.MEMBER);
    assert.equal(dbUser.fitnessGoal, "STRENGTH_HYPERTROPHY");
    assert.equal(dbUser.experienceLevel, "INTERMEDIATE");
  });

  it("3. Member can edit onboarding fields later via updateProfile without changing role", async () => {
    const updateData = {
      fitnessGoal: "FAT_LOSS_LEANING",
      experienceLevel: "ADVANCED",
      bio: "Updated athlete bio after 6 months of training.",
      phone: "+1 555-999-8888",
    };

    const updated = await authService.updateProfile(memberUserId, updateData);

    assert.equal(updated.fitnessGoal, "FAT_LOSS_LEANING");
    assert.equal(updated.experienceLevel, "ADVANCED");
    assert.equal(updated.phone, "+1 555-999-8888");
    assert.equal(updated.bio, "Updated athlete bio after 6 months of training.");
    assert.equal(updated.role, Roles.MEMBER);
  });

  it("4. Coach onboarding persists optional professional title, philosophy, specialties, and languages", async () => {
    // Provision coach account
    const coachDb = await prisma.user.create({
      data: {
        name: "Coach Marcus Vance",
        email: coachEmail,
        password: "HashedPassword123!",
        role: Roles.TRAINER,
        isEmailVerified: true,
        isActive: true,
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    });
    coachUserId = coachDb.id;

    const coachOnboardingData = {
      name: "Marcus Vance, CSCS",
      professionalTitle: "Head Strength & Biomechanics Coach",
      yearsOfExperience: 8,
      phone: "+1 555-432-1098",
      bio: "Elite powerlifting coach specializing in bar speed telemetry and injury reduction.",
      coachingPhilosophy: "Evidence-based progressive overload with high bio-feedback fidelity.",
      specialties: ["Strength Training", "Powerlifting", "Hypertrophy"],
      certifications: ["CSCS (NSCA)", "USAW Level 1"],
      languagesSpoken: ["English", "Arabic", "German"],
    };

    const completionResult = await authService.completeOnboarding(
      coachUserId,
      coachOnboardingData,
    );

    assert.equal(completionResult.onboardingCompleted, true);
    assert.equal(completionResult.role, Roles.TRAINER);
    assert.equal(
      completionResult.professionalTitle,
      "Head Strength & Biomechanics Coach",
    );
    assert.equal(
      completionResult.coachingPhilosophy,
      "Evidence-based progressive overload with high bio-feedback fidelity.",
    );
    assert.deepEqual(completionResult.specialties, [
      "Strength Training",
      "Powerlifting",
      "Hypertrophy",
    ]);
    assert.deepEqual(completionResult.certifications, [
      "CSCS (NSCA)",
      "USAW Level 1",
    ]);
    assert.deepEqual(completionResult.languagesSpoken, [
      "English",
      "Arabic",
      "German",
    ]);

    // Verify coachProfileService.getProfile reflects these fields
    const coachProfile = await coachProfileService.getProfile(
      coachUserId,
      Roles.TRAINER,
    );
    assert.equal(
      coachProfile.profile.professionalTitle,
      "Head Strength & Biomechanics Coach",
    );
    assert.equal(
      coachProfile.profile.coachingPhilosophy,
      "Evidence-based progressive overload with high bio-feedback fidelity.",
    );
    assert.deepEqual(coachProfile.profile.languagesSpoken, [
      "English",
      "Arabic",
      "German",
    ]);
    assert.equal(coachProfile.profile.yearsOfExperience, 8);
  });

  it("5. Coach profile can be updated via coachProfileService.updateProfile", async () => {
    const updated = await coachProfileService.updateProfile(
      coachUserId,
      Roles.TRAINER,
      {
        professionalTitle: "Director of Athletic Performance",
        yearsOfExperience: 9,
        coachingPhilosophy: "Periodized microcycles tailored to metabolic efficiency.",
        specialties: ["Strength Training", "Hypertrophy", "Mobility & Rehab"],
        languagesSpoken: ["English", "Arabic", "German", "French"],
      },
    );

    assert.equal(updated.professionalTitle, "Director of Athletic Performance");
    assert.equal(updated.yearsOfExperience, 9);
    assert.equal(
      updated.coachingPhilosophy,
      "Periodized microcycles tailored to metabolic efficiency.",
    );
    assert.deepEqual(updated.specialties, [
      "Strength Training",
      "Hypertrophy",
      "Mobility & Rehab",
    ]);
    assert.deepEqual(updated.languagesSpoken, [
      "English",
      "Arabic",
      "German",
      "French",
    ]);
  });
});

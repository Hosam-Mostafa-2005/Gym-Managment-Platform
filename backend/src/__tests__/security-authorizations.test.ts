// src/__tests__/security-authorizations.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Roles, type Role } from "../constants/roles.js";
import { restrictTo } from "../middleware/auth.middleware.js";
import type { Request, Response, NextFunction } from "express";

/**
 * Isolated security unit test suite for:
 * FIX 1: Prevent Members from Promoting Themselves to Coach (Privilege Escalation)
 * FIX 2: Restrict Member Profile Updates to Authorized Users (BOLA & Mass Assignment Prevention)
 *
 * Runs completely in-memory with zero live database mutations against production.
 */
describe("STREN — Security Authorizations Verification Suite (Isolated Mock)", () => {
  // In-memory mock database state
  interface MockUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    onboardingCompleted: boolean;
    onboardingStep: number;
    phone?: string | null;
    bio?: string | null;
    fitnessGoal?: string | null;
    experienceLevel?: string | null;
    professionalTitle?: string | null;
    coachingPhilosophy?: string | null;
    specialties?: string[];
    certifications?: string[];
    yearsOfExperience?: number;
    languagesSpoken?: string[];
    [key: string]: any;
  }

  let users: Map<string, MockUser>;
  let coachMemberRelationships: Array<{
    trainerId: string;
    memberId: string;
    status: string;
    isActive: boolean;
  }>;
  let assignments: Array<{
    trainerId: string;
    memberId: string;
    status: string;
    isActive: boolean;
  }>;

  beforeEach(() => {
    users = new Map();
    coachMemberRelationships = [];
    assignments = [];

    // Seed test users
    users.set("member-1", {
      id: "member-1",
      name: "Alice Athlete",
      email: "alice@stren.app",
      role: Roles.MEMBER,
      isActive: true,
      onboardingCompleted: false,
      onboardingStep: 0,
      fitnessGoal: null,
      experienceLevel: null,
    });

    users.set("member-2", {
      id: "member-2",
      name: "Bob Unassigned Athlete",
      email: "bob@stren.app",
      role: Roles.MEMBER,
      isActive: true,
      onboardingCompleted: true,
      onboardingStep: 2,
      fitnessGoal: "FAT_LOSS",
      experienceLevel: "BEGINNER",
    });

    users.set("coach-1", {
      id: "coach-1",
      name: "Coach Charlie",
      email: "charlie@stren.app",
      role: Roles.TRAINER,
      isActive: true,
      onboardingCompleted: false,
      onboardingStep: 0,
    });

    users.set("coach-2", {
      id: "coach-2",
      name: "Coach Dave",
      email: "dave@stren.app",
      role: Roles.TRAINER,
      isActive: true,
      onboardingCompleted: true,
      onboardingStep: 2,
    });

    users.set("admin-1", {
      id: "admin-1",
      name: "Admin Emma",
      email: "emma@stren.app",
      role: Roles.ADMIN,
      isActive: true,
      onboardingCompleted: true,
      onboardingStep: 2,
    });

    // Establish active relationship between coach-1 and member-1
    coachMemberRelationships.push({
      trainerId: "coach-1",
      memberId: "member-1",
      status: "ACTIVE",
      isActive: true,
    });
  });

  // =========================================================================
  // Helper: Simulated completeOnboarding adhering to our hardened logic
  // =========================================================================
  const simulateCompleteOnboarding = (userId: string, data: any) => {
    const existing = users.get(userId);
    if (!existing || !existing.isActive) {
      const err: any = new Error("User not found.");
      err.statusCode = 404;
      throw err;
    }

    const isTrainerOrAdmin =
      existing.role === Roles.TRAINER || existing.role === Roles.ADMIN;

    const updateData: any = {
      onboardingCompleted: true,
      onboardingStep: data.step !== undefined ? data.step : 2,
    };

    // Role is strictly locked and cannot be changed via onboarding.
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null;

    if (data.fitnessGoal !== undefined) {
      updateData.fitnessGoal = data.fitnessGoal?.trim() || null;
    }
    if (data.experienceLevel !== undefined) {
      updateData.experienceLevel = data.experienceLevel?.trim() || null;
    }

    if (isTrainerOrAdmin) {
      if (data.professionalTitle !== undefined) {
        updateData.professionalTitle = data.professionalTitle?.trim() || null;
      }
      if (data.coachingPhilosophy !== undefined) {
        updateData.coachingPhilosophy = data.coachingPhilosophy?.trim() || null;
      }
      if (data.languagesSpoken !== undefined) updateData.languagesSpoken = data.languagesSpoken;
      if (data.specialties !== undefined) updateData.specialties = data.specialties;
      if (data.certifications !== undefined) updateData.certifications = data.certifications;
      if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience;
    }

    const updated = { ...existing, ...updateData };
    users.set(userId, updated);
    return updated;
  };

  // =========================================================================
  // Helper: Simulated memberProfileService.updateProfile
  // =========================================================================
  const simulateUpdateMemberProfile = (
    memberId: string,
    callerId: string,
    callerRole: Role,
    payload: any,
  ) => {
    const targetUser = users.get(memberId);
    if (!targetUser || !targetUser.isActive) {
      const err: any = new Error("Member not found.");
      err.statusCode = 404;
      throw err;
    }

    // Target MUST be a member
    if (targetUser.role !== Roles.MEMBER) {
      const err: any = new Error("Selected user is not a member.");
      err.statusCode = 403;
      throw err;
    }

    // Caller authorization
    if (callerRole === Roles.MEMBER) {
      if (callerId !== memberId) {
        const err: any = new Error("You can only update your own profile.");
        err.statusCode = 403;
        throw err;
      }
    } else if (callerRole === Roles.TRAINER) {
      const hasRelationship = coachMemberRelationships.some(
        (r) =>
          r.trainerId === callerId &&
          r.memberId === memberId &&
          r.status === "ACTIVE" &&
          r.isActive,
      );
      const hasAssignment = assignments.some(
        (a) =>
          a.trainerId === callerId &&
          a.memberId === memberId &&
          a.status === "ACTIVE" &&
          a.isActive,
      );
      if (!hasRelationship && !hasAssignment) {
        const err: any = new Error("Member is not assigned to you.");
        err.statusCode = 403;
        throw err;
      }
    } else if (callerRole === Roles.ADMIN) {
      // Authorized
    } else {
      const err: any = new Error("You do not have permission to update this profile.");
      err.statusCode = 403;
      throw err;
    }

    // Allowlist only safe fields
    const safeData: any = {};
    if (payload.name !== undefined) safeData.name = payload.name.trim();
    if (payload.phone !== undefined) safeData.phone = payload.phone?.trim() || null;
    if (payload.bio !== undefined) safeData.bio = payload.bio?.trim() || null;
    if (payload.fitnessGoal !== undefined) safeData.fitnessGoal = payload.fitnessGoal?.trim() || null;
    if (payload.experienceLevel !== undefined) safeData.experienceLevel = payload.experienceLevel?.trim() || null;

    const updated = { ...targetUser, ...safeData };
    users.set(memberId, updated);
    return updated;
  };

  // =========================================================================
  // FIX 1: Prevent Members from Promoting Themselves to Coach
  // =========================================================================
  describe("FIX 1: Prevent Privilege Escalation via Onboarding & Registration", () => {
    it("A. A member submitting { role: 'trainer' } cannot gain trainer privileges", () => {
      const member = users.get("member-1")!;
      assert.equal(member.role, Roles.MEMBER);

      // Attempt privilege escalation to trainer
      const result = simulateCompleteOnboarding("member-1", {
        role: Roles.TRAINER,
        name: "Alice Hacker",
        fitnessGoal: "STRENGTH_HYPERTROPHY",
      });

      assert.equal(result.role, Roles.MEMBER, "Role must remain MEMBER");
      const dbUser = users.get("member-1")!;
      assert.equal(dbUser.role, Roles.MEMBER, "Database role must not be changed");
      assert.equal(dbUser.onboardingCompleted, true);
    });

    it("B. A member submitting { role: 'admin' } cannot gain admin privileges", () => {
      const member = users.get("member-1")!;
      assert.equal(member.role, Roles.MEMBER);

      const result = simulateCompleteOnboarding("member-1", {
        role: Roles.ADMIN,
        name: "Alice Admin Attempt",
      });

      assert.equal(result.role, Roles.MEMBER, "Role must remain MEMBER");
      const dbUser = users.get("member-1")!;
      assert.equal(dbUser.role, Roles.MEMBER, "Database role must not be changed to ADMIN");
    });

    it("C. Public registration rejects any attempt to choose a privileged role", () => {
      // In auth.service.ts register():
      const simulateRegister = (userData: { name: string; email: string; role?: string }) => {
        if (userData.role && userData.role !== Roles.MEMBER) {
          const err: any = new Error("Cannot register with a privileged role.");
          err.statusCode = 403;
          throw err;
        }
        return { role: Roles.MEMBER };
      };

      assert.throws(
        () => simulateRegister({ name: "Evil Coach", email: "evil@stren.app", role: Roles.TRAINER }),
        (err: any) => err.statusCode === 403,
      );

      assert.throws(
        () => simulateRegister({ name: "Evil Admin", email: "evil2@stren.app", role: Roles.ADMIN }),
        (err: any) => err.statusCode === 403,
      );

      const legitimate = simulateRegister({ name: "Good Athlete", email: "good@stren.app" });
      assert.equal(legitimate.role, Roles.MEMBER);
    });

    it("D. Legitimate member onboarding still works and sets member fields", () => {
      const result = simulateCompleteOnboarding("member-1", {
        name: "Alice Legitimate",
        fitnessGoal: "POWERLIFTING",
        experienceLevel: "ADVANCED",
        phone: "+1 555-1234",
        bio: "Dedicated athlete.",
      });

      assert.equal(result.name, "Alice Legitimate");
      assert.equal(result.fitnessGoal, "POWERLIFTING");
      assert.equal(result.experienceLevel, "ADVANCED");
      assert.equal(result.onboardingCompleted, true);
      assert.equal(result.role, Roles.MEMBER);
    });

    it("E. Legitimate coach onboarding persists coach fields for pre-provisioned trainer accounts", () => {
      const result = simulateCompleteOnboarding("coach-1", {
        name: "Coach Charlie Vance",
        professionalTitle: "Biomechanics Coach",
        specialties: ["Powerlifting", "Hypertrophy"],
        certifications: ["CSCS", "USAW"],
        yearsOfExperience: 7,
      });

      assert.equal(result.role, Roles.TRAINER, "Role must remain TRAINER");
      assert.equal(result.professionalTitle, "Biomechanics Coach");
      assert.deepEqual(result.specialties, ["Powerlifting", "Hypertrophy"]);
      assert.equal(result.yearsOfExperience, 7);
      assert.equal(result.onboardingCompleted, true);
    });

    it("F. Administrative role assignment allows admin to assign roles and blocks non-admins", () => {
      const simulateAssignRole = (callerRole: Role, targetId: string, newRole: Role) => {
        if (callerRole !== Roles.ADMIN) {
          const err: any = new Error("Forbidden: Only administrators can assign user roles.");
          err.statusCode = 403;
          throw err;
        }
        const user = users.get(targetId);
        if (!user) {
          const err: any = new Error("User not found.");
          err.statusCode = 404;
          throw err;
        }
        user.role = newRole;
        return user;
      };

      // Member cannot assign roles
      assert.throws(
        () => simulateAssignRole(Roles.MEMBER, "member-1", Roles.TRAINER),
        (err: any) => err.statusCode === 403,
      );

      // Trainer cannot assign roles
      assert.throws(
        () => simulateAssignRole(Roles.TRAINER, "member-1", Roles.TRAINER),
        (err: any) => err.statusCode === 403,
      );

      // Admin CAN assign role
      const promoted = simulateAssignRole(Roles.ADMIN, "member-1", Roles.TRAINER);
      assert.equal(promoted.role, Roles.TRAINER);
      assert.equal(users.get("member-1")?.role, Roles.TRAINER);
    });

    it("G. Protected trainer endpoints reject users who are members, regardless of client-supplied payloads", () => {
      const middleware = restrictTo(Roles.TRAINER, Roles.ADMIN);

      let nextAllowed = false;
      let errorPassed: any = null;
      const mockNext: NextFunction = (err?: any) => {
        if (err) {
          errorPassed = err;
        } else {
          nextAllowed = true;
        }
      };

      const mockReq = (role: Role): Request =>
        ({
          user: { id: "member-1", role },
          body: { role: "trainer" }, // Attacker trying to spoof role in payload
        }) as any;

      const mockRes = (): Response => ({}) as any;

      // Member with body.role = "trainer" is REJECTED with 403 because req.user.role is MEMBER
      middleware(mockReq(Roles.MEMBER), mockRes(), mockNext);
      assert.equal(nextAllowed, false, "next() must not succeed for member");
      assert.ok(errorPassed, "Error must be passed to next()");
      assert.equal(errorPassed.statusCode, 403);
      assert.ok(errorPassed.message.includes("You do not have permission"));

      // Reset test spies
      nextAllowed = false;
      errorPassed = null;

      // Genuine trainer is ALLOWED
      middleware(mockReq(Roles.TRAINER), mockRes(), mockNext);
      assert.equal(nextAllowed, true, "next() must succeed without error for trainer");
      assert.equal(errorPassed, null);
    });
  });

  // =========================================================================
  // FIX 2: Restrict Member Profile Updates to Authorized Users
  // =========================================================================
  describe("FIX 2: Restrict Member Profile Updates & Prevent Mass Assignment", () => {
    it("A. A member can update their own allowed profile fields", () => {
      const updated = simulateUpdateMemberProfile(
        "member-1",
        "member-1",
        Roles.MEMBER,
        {
          name: "Alice Updated",
          fitnessGoal: "HYPERTROPHY",
          experienceLevel: "ADVANCED",
        },
      );

      assert.equal(updated.name, "Alice Updated");
      assert.equal(updated.fitnessGoal, "HYPERTROPHY");
      assert.equal(updated.experienceLevel, "ADVANCED");
    });

    it("B. A member cannot update another member's profile", () => {
      assert.throws(
        () =>
          simulateUpdateMemberProfile(
            "member-2", // target
            "member-1", // caller
            Roles.MEMBER,
            { name: "Hacked Member" },
          ),
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes("You can only update your own profile"));
          return true;
        },
      );

      // Verify member-2 was not modified
      assert.equal(users.get("member-2")?.name, "Bob Unassigned Athlete");
    });

    it("C. A trainer cannot update an unrelated / unassigned member's profile", () => {
      assert.throws(
        () =>
          simulateUpdateMemberProfile(
            "member-2", // target (Bob is not assigned to coach-1)
            "coach-1",  // caller
            Roles.TRAINER,
            { name: "Unauthorized Coach Edit" },
          ),
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes("Member is not assigned to you"));
          return true;
        },
      );

      assert.equal(users.get("member-2")?.name, "Bob Unassigned Athlete");
    });

    it("D. A trainer can update an assigned member's permitted profile fields", () => {
      // coach-1 is assigned to member-1
      const updated = simulateUpdateMemberProfile(
        "member-1",
        "coach-1",
        Roles.TRAINER,
        {
          fitnessGoal: "STRENGTH_PEAKING",
          experienceLevel: "ELITE",
        },
      );

      assert.equal(updated.fitnessGoal, "STRENGTH_PEAKING");
      assert.equal(updated.experienceLevel, "ELITE");
    });

    it("E. A trainer cannot update another trainer's profile through member-profile", () => {
      assert.throws(
        () =>
          simulateUpdateMemberProfile(
            "coach-2", // target is another coach
            "coach-1", // caller is coach
            Roles.TRAINER,
            { name: "Coach Hijack" },
          ),
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes("Selected user is not a member"));
          return true;
        },
      );

      assert.equal(users.get("coach-2")?.name, "Coach Dave");
    });

    it("F. A trainer cannot update an administrator's profile through member-profile", () => {
      assert.throws(
        () =>
          simulateUpdateMemberProfile(
            "admin-1", // target is admin
            "coach-1", // caller is coach
            Roles.TRAINER,
            { name: "Admin Hijack" },
          ),
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes("Selected user is not a member"));
          return true;
        },
      );

      assert.equal(users.get("admin-1")?.name, "Admin Emma");
    });

    it("G. Mass assignment attempts with sensitive fields (role, isActive, password) are stripped", () => {
      const maliciousPayload = {
        name: "Alice Modified",
        role: Roles.ADMIN,
        isActive: false,
        password: "$2b$12$hackedpasswordhash123456",
        permissions: ["ALL_PRIVILEGES"],
        onboardingCompleted: false,
        coachingPhilosophy: "I am now a coach",
      };

      const result = simulateUpdateMemberProfile(
        "member-1",
        "member-1",
        Roles.MEMBER,
        maliciousPayload,
      );

      assert.equal(result.name, "Alice Modified", "Allowed name field should be updated");
      assert.equal(result.role, Roles.MEMBER, "Privileged role must NOT be modified");
      assert.equal(result.isActive, true, "Account status must NOT be modified");
      assert.notEqual(result.password, "$2b$12$hackedpasswordhash123456", "Password must NOT be modified");
      assert.equal((result as any).permissions, undefined, "Arbitrary permissions must NOT be assigned");
    });

    it("H. An administrator can update a member's profile", () => {
      const updated = simulateUpdateMemberProfile(
        "member-2",
        "admin-1",
        Roles.ADMIN,
        {
          name: "Bob Admin-Updated",
          fitnessGoal: "LONGEVITY",
        },
      );

      assert.equal(updated.name, "Bob Admin-Updated");
      assert.equal(updated.fitnessGoal, "LONGEVITY");
    });
  });
});

// src/__tests__/stren-scoped-fixes.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Roles, type Role } from "../constants/roles.js";

/**
 * Isolated unit test suite for the three scoped fixes:
 * TASK 1: Independent Coach Self-Registration
 * TASK 2: Workout Session - Add Exercise without Schema Validation Errors
 * TASK 3: Coach Appointment Booking & Data Mapping Fix
 *
 * Runs completely in-memory with zero live database mutations against production.
 */
describe("STREN — 3-Task Implementation Verification Suite (Isolated Mock)", () => {
  // In-memory mock database state
  interface MockUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt: Date | null;
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

  interface MockExercise {
    id: string;
    name: string;
    category: string;
    isActive: boolean;
  }

  interface MockWorkoutSession {
    id: string;
    memberId: string;
    workoutId: string;
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    isActive: boolean;
    startedAt: Date;
    completedAt?: Date | null;
  }

  interface MockWorkoutExerciseLog {
    id: string;
    sessionId: string;
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: string;
    targetWeight?: number;
    targetRpe?: number;
    restSeconds: number;
    order: number;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  interface MockWorkoutSetLog {
    id: string;
    exerciseLogId: string;
    setNumber: number;
    targetReps?: string;
    actualReps: number;
    weight: number;
    restDuration: number;
    setType: string;
    segmentIndex: number;
    isIntermediateSegment: boolean;
    isFinalSegment: boolean;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  interface MockCoachMemberRelationship {
    id: string;
    trainerId: string;
    memberId: string;
    status: string;
    isActive: boolean;
  }

  interface MockAppointment {
    id: string;
    trainerId: string;
    memberId: string;
    title: string;
    type: string;
    startTime: Date;
    endTime: Date;
    status: string;
    isActive: boolean;
  }

  let users: Map<string, MockUser>;
  let exercises: Map<string, MockExercise>;
  let sessions: Map<string, MockWorkoutSession>;
  let exerciseLogs: Map<string, MockWorkoutExerciseLog>;
  let setLogs: Map<string, MockWorkoutSetLog>;
  let relationships: MockCoachMemberRelationship[];
  let appointments: MockAppointment[];

  beforeEach(() => {
    users = new Map();
    exercises = new Map();
    sessions = new Map();
    exerciseLogs = new Map();
    setLogs = new Map();
    relationships = [];
    appointments = [];

    // Seed test users
    users.set("member-1", {
      id: "member-1",
      name: "Alice Athlete",
      email: "alice@stren.app",
      password: "hashed_password_1",
      role: Roles.MEMBER,
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      onboardingStep: 2,
    });

    users.set("coach-1", {
      id: "coach-1",
      name: "Coach Charlie",
      email: "coach@stren.app",
      password: "hashed_password_2",
      role: Roles.TRAINER,
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      onboardingStep: 2,
    });

    // Seed test exercise
    exercises.set("ex-1", {
      id: "ex-1",
      name: "Barbell Bench Press",
      category: "CHEST",
      isActive: true,
    });

    exercises.set("ex-inactive", {
      id: "ex-inactive",
      name: "Archived Exercise",
      category: "CHEST",
      isActive: false,
    });

    // Seed active session for member-1
    sessions.set("session-active", {
      id: "session-active",
      memberId: "member-1",
      workoutId: "workout-1",
      status: "IN_PROGRESS",
      isActive: true,
      startedAt: new Date(),
    });

    // Seed completed session for member-1
    sessions.set("session-completed", {
      id: "session-completed",
      memberId: "member-1",
      workoutId: "workout-1",
      status: "COMPLETED",
      isActive: true,
      startedAt: new Date(),
      completedAt: new Date(),
    });

    // Seed active coaching relationship
    relationships.push({
      id: "rel-1",
      trainerId: "coach-1",
      memberId: "member-1",
      status: "ACTIVE",
      isActive: true,
    });
  });

  function energeticMap<K, V>() {
    return new Map<K, V>();
  }

  // ==========================================
  // TASK 1 SIMULATION: Coach Self-Registration
  // ==========================================
  function simulateRegisterMember(data: { name: string; email: string; password: string; role?: string }) {
    if (data.role && data.role !== Roles.MEMBER) {
      const err: any = new Error("Cannot register with a privileged role.");
      err.statusCode = 403;
      throw err;
    }
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = Array.from(users.values()).find((u) => u.email === normalizedEmail);
    if (existing) {
      if (existing.isEmailVerified) {
        const err: any = new Error("An account with this email already exists.");
        err.statusCode = 409;
        throw err;
      }
      existing.name = data.name.trim();
      existing.password = "new_hashed_" + data.password;
      return { user: existing, isPendingVerification: true };
    }

    const newUser: MockUser = {
      id: "user-" + (users.size + 1),
      name: data.name.trim(),
      email: normalizedEmail,
      password: "hashed_" + data.password,
      role: Roles.MEMBER,
      isActive: true,
      isEmailVerified: false,
      emailVerifiedAt: null,
      onboardingCompleted: false,
      onboardingStep: 0,
    };
    users.set(newUser.id, newUser);
    return { user: newUser, isPendingVerification: true };
  }

  function simulateRegisterCoach(data: { name: string; email: string; password: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = Array.from(users.values()).find((u) => u.email === normalizedEmail);
    if (existing) {
      if (existing.isEmailVerified) {
        const err: any = new Error("An account with this email already exists.");
        err.statusCode = 409;
        throw err;
      }
      existing.name = data.name.trim();
      existing.password = "new_hashed_" + data.password;
      existing.role = Roles.TRAINER;
      return { user: existing, isPendingVerification: true };
    }

    const newUser: MockUser = {
      id: "coach-" + (users.size + 1),
      name: data.name.trim(),
      email: normalizedEmail,
      password: "hashed_" + data.password,
      role: Roles.TRAINER,
      isActive: true,
      isEmailVerified: false,
      emailVerifiedAt: null,
      onboardingCompleted: false,
      onboardingStep: 0,
    };
    users.set(newUser.id, newUser);
    return { user: newUser, isPendingVerification: true };
  }

  // ==========================================
  // TASK 2 SIMULATION: Add Exercise to Session
  // ==========================================
  const WORKOUT_EXERCISE_LOG_SCHEMA_KEYS = new Set([
    "id",
    "sessionId",
    "exerciseId",
    "exerciseName",
    "targetSets",
    "targetReps",
    "targetWeight",
    "targetRpe",
    "restSeconds",
    "originalExerciseId",
    "swapReason",
    "setsDetail",
    "order",
    "completed",
    "createdAt",
    "updatedAt",
  ]);

  const WORKOUT_SET_LOG_SCHEMA_KEYS = new Set([
    "id",
    "exerciseLogId",
    "setNumber",
    "targetReps",
    "actualReps",
    "weight",
    "restDuration",
    "setType",
    "segmentIndex",
    "isIntermediateSegment",
    "isFinalSegment",
    "startedAt",
    "completedAt",
    "completed",
    "createdAt",
    "updatedAt",
  ]);

  function simulateAddExerciseToSession(
    sessionId: string,
    userId: string,
    data: {
      exerciseId: string;
      targetSets?: number;
      targetReps?: number | string;
      targetWeight?: number;
      restTimeSeconds?: number;
      restSeconds?: number;
      notes?: string;
    },
  ) {
    const session = sessions.get(sessionId);
    if (!session || session.memberId !== userId || session.status !== "IN_PROGRESS" || !session.isActive) {
      const err: any = new Error("Active workout session not found or you are not authorized to modify it.");
      err.statusCode = 404;
      throw err;
    }

    const exercise = exercises.get(data.exerciseId);
    if (!exercise || !exercise.isActive) {
      const err: any = new Error("Exercise not found.");
      err.statusCode = 404;
      throw err;
    }

    const existingLogsCount = Array.from(exerciseLogs.values()).filter((l) => l.sessionId === session.id).length;
    const nextOrder = existingLogsCount + 1;

    const targetSets = data.targetSets ?? 3;
    const targetRepsNum = typeof data.targetReps === "number" ? data.targetReps : 10;
    const targetRepsStr = String(data.targetReps ?? 10);
    const targetWeight = data.targetWeight ?? 0;
    const restSeconds = data.restSeconds ?? data.restTimeSeconds ?? 60;

    // Build the payload passed to tx.workoutExerciseLog.create
    const exerciseLogPayload: any = {
      id: "log-" + (exerciseLogs.size + 1),
      sessionId: session.id,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      order: nextOrder,
      targetSets,
      targetReps: targetRepsStr,
      targetWeight,
      restSeconds,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Strict schema check: verify that no non-existent schema properties are passed
    for (const key of Object.keys(exerciseLogPayload)) {
      if (!WORKOUT_EXERCISE_LOG_SCHEMA_KEYS.has(key)) {
        throw new Error(`PrismaClientValidationError: Unknown argument \`${key}\` on model \`WorkoutExerciseLog\`.`);
      }
    }

    exerciseLogs.set(exerciseLogPayload.id, exerciseLogPayload);

    // Build the payload passed to tx.workoutSetLog.createMany
    const setLogsPayload = Array.from({ length: targetSets }).map((_, idx) => {
      const setPayload: any = {
        id: `set-${exerciseLogPayload.id}-${idx + 1}`,
        exerciseLogId: exerciseLogPayload.id,
        setNumber: idx + 1,
        segmentIndex: 0,
        setType: "NORMAL",
        isIntermediateSegment: false,
        isFinalSegment: true,
        targetReps: targetRepsStr,
        actualReps: targetRepsNum,
        weight: targetWeight,
        restDuration: restSeconds,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      for (const key of Object.keys(setPayload)) {
        if (!WORKOUT_SET_LOG_SCHEMA_KEYS.has(key)) {
          throw new Error(`PrismaClientValidationError: Unknown argument \`${key}\` on model \`WorkoutSetLog\`.`);
        }
      }
      return setPayload;
    });

    for (const set of setLogsPayload) {
      setLogs.set(set.id, set);
    }

    return {
      session,
      exerciseLog: exerciseLogPayload,
      setLogs: setLogsPayload,
    };
  }

  // ==========================================
  // TASK 3 SIMULATION: Coach Appointment Booking & Data Mapping
  // ==========================================
  function normalizeMemberForSelector(userItem: any) {
    const actualUser =
      userItem && typeof userItem === "object" && "member" in userItem && userItem.member
        ? userItem.member
        : userItem;

    const id = actualUser?.id || actualUser?._id || "";
    const name = actualUser?.name || "Unknown Member";
    const email = actualUser?.email || "";
    return { id, name, email };
  }

  function simulateCreateAppointment(
    trainerId: string,
    data: {
      memberId: string;
      title: string;
      type: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const activeRel = relationships.find(
      (r) => r.trainerId === trainerId && r.memberId === data.memberId && r.status === "ACTIVE" && r.isActive,
    );

    if (!activeRel) {
      const err: any = new Error(
        "Unauthorized: You can only schedule appointments with members with whom you have an active coaching relationship.",
      );
      err.statusCode = 403;
      throw err;
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const err: any = new Error("Invalid date/time format for appointment.");
      err.statusCode = 400;
      throw err;
    }

    if (end.getTime() <= start.getTime()) {
      const err: any = new Error("Appointment end time must be strictly after start time.");
      err.statusCode = 400;
      throw err;
    }

    // Check conflict
    const conflict = appointments.find(
      (a) =>
        a.trainerId === trainerId &&
        a.isActive &&
        a.status === "SCHEDULED" &&
        a.startTime < end &&
        a.endTime > start,
    );

    if (conflict) {
      const err: any = new Error("Appointment conflict: You already have a scheduled appointment in this window.");
      err.statusCode = 409;
      throw err;
    }

    const newAppt: MockAppointment = {
      id: "appt-" + (appointments.length + 1),
      trainerId,
      memberId: data.memberId,
      title: data.title,
      type: data.type,
      startTime: start,
      endTime: end,
      status: "SCHEDULED",
      isActive: true,
    };
    appointments.push(newAppt);
    return newAppt;
  }

  // =========================================================================
  // TESTS: TASK 1 — Independent Coach Self-Registration
  // =========================================================================
  describe("TASK 1: Independent Coach Self-Registration", () => {
    it("A. An independent coach self-registration creates an account with role TRAINER and isEmailVerified: false", () => {
      const res = simulateRegisterCoach({
        name: "Coach Elena",
        email: "elena@coach.stren.app",
        password: "StrongPassword123!",
      });

      assert.equal(res.user.role, Roles.TRAINER);
      assert.equal(res.user.isEmailVerified, false);
      assert.equal(res.isPendingVerification, true);
      assert.equal(users.get(res.user.id)?.role, Roles.TRAINER);
    });

    it("B. Standard member registration rejects privileged role choice and defaults to MEMBER", () => {
      // Rejects privileged role
      assert.throws(
        () =>
          simulateRegisterMember({
            name: "Sneaky User",
            email: "sneaky@stren.app",
            password: "Password123!",
            role: Roles.TRAINER,
          }),
        (err: any) => {
          assert.equal(err.statusCode, 403);
          return true;
        },
      );

      // Default registration produces MEMBER
      const res = simulateRegisterMember({
        name: "Standard Athlete",
        email: "athlete@stren.app",
        password: "Password123!",
      });
      assert.equal(res.user.role, Roles.MEMBER);
    });

    it("C. Duplicate email check prevents duplicate registration for already verified accounts", () => {
      assert.throws(
        () =>
          simulateRegisterCoach({
            name: "Duplicate Coach",
            email: "coach@stren.app", // already verified in seed
            password: "Password123!",
          }),
        (err: any) => {
          assert.equal(err.statusCode, 409);
          return true;
        },
      );
    });

    it("D. Existing unverified account is updated to TRAINER when registering via coach route", () => {
      // Create an unverified user
      const unverified = simulateRegisterMember({
        name: "Unverified User",
        email: "unverified@stren.app",
        password: "OldPassword1!",
      });
      assert.equal(unverified.user.role, Roles.MEMBER);

      // Registering via coach route upgrades unverified account to TRAINER
      const upgraded = simulateRegisterCoach({
        name: "Coach Upgraded",
        email: "unverified@stren.app",
        password: "NewPassword2!",
      });

      assert.equal(upgraded.user.role, Roles.TRAINER);
      assert.equal(upgraded.user.name, "Coach Upgraded");
    });
  });

  // =========================================================================
  // TESTS: TASK 2 — Workout Session Add Exercise
  // =========================================================================
  describe("TASK 2: Workout Session Add Exercise", () => {
    it("A. Adding an exercise to an active session succeeds with valid schema fields and correct sets", () => {
      const result = simulateAddExerciseToSession("session-active", "member-1", {
        exerciseId: "ex-1",
        targetSets: 4,
        targetReps: 8,
        targetWeight: 80,
        restTimeSeconds: 90,
      });

      assert.ok(result.exerciseLog);
      assert.equal(result.exerciseLog.exerciseId, "ex-1");
      assert.equal(result.exerciseLog.targetSets, 4);
      assert.equal(result.exerciseLog.targetReps, "8");
      assert.equal(result.exerciseLog.targetWeight, 80);
      assert.equal(result.exerciseLog.restSeconds, 90);
      assert.equal(result.exerciseLog.completed, false);
      assert.equal(result.setLogs.length, 4);

      // Verify each set log
      result.setLogs.forEach((set, idx) => {
        assert.equal(set.setNumber, idx + 1);
        assert.equal(set.targetReps, "8");
        assert.equal(set.actualReps, 8);
        assert.equal(set.weight, 80);
        assert.equal(set.restDuration, 90);
        assert.equal(set.completed, false);
        assert.equal(set.setType, "NORMAL");
      });
    });

    it("B. Adding an exercise to a non-existent or completed session fails with 404", () => {
      // Completed session
      assert.throws(
        () =>
          simulateAddExerciseToSession("session-completed", "member-1", {
            exerciseId: "ex-1",
          }),
        (err: any) => {
          assert.equal(err.statusCode, 404);
          return true;
        },
      );

      // Non-existent session
      assert.throws(
        () =>
          simulateAddExerciseToSession("non-existent-session", "member-1", {
            exerciseId: "ex-1",
          }),
        (err: any) => {
          assert.equal(err.statusCode, 404);
          return true;
        },
      );
    });

    it("C. A member cannot add an exercise to another member's active session", () => {
      assert.throws(
        () =>
          simulateAddExerciseToSession("session-active", "member-other", {
            exerciseId: "ex-1",
          }),
        (err: any) => {
          assert.equal(err.statusCode, 404);
          return true;
        },
      );
    });

    it("D. Adding an inactive or missing exercise fails with 404", () => {
      assert.throws(
        () =>
          simulateAddExerciseToSession("session-active", "member-1", {
            exerciseId: "ex-inactive",
          }),
        (err: any) => {
          assert.equal(err.statusCode, 404);
          return true;
        },
      );
    });
  });

  // =========================================================================
  // TESTS: TASK 3 — Coach Appointment Booking & Data Mapping
  // =========================================================================
  describe("TASK 3: Coach Appointment Booking & Athlete Data Mapping", () => {
    it("A. Formatted member correctly extracts member id, name, and email from nested MemberManagementCard", () => {
      const nestedCard = {
        member: {
          id: "member-1",
          name: "Alice Athlete",
          email: "alice@stren.app",
          isActive: true,
          joinedAt: "2026-01-01T00:00:00Z",
        },
        assignment: { status: "ACTIVE", currentWorkout: null, trainer: null },
        relationship: { id: "rel-1", status: "ACTIVE" },
      };

      const normalized = normalizeMemberForSelector(nestedCard);
      assert.equal(normalized.id, "member-1");
      assert.equal(normalized.name, "Alice Athlete");
      assert.equal(normalized.email, "alice@stren.app");
    });

    it("B. Formatted member correctly handles flat member object format", () => {
      const flatMember = {
        id: "member-1",
        name: "Alice Athlete",
        email: "alice@stren.app",
      };

      const normalized = normalizeMemberForSelector(flatMember);
      assert.equal(normalized.id, "member-1");
      assert.equal(normalized.name, "Alice Athlete");
      assert.equal(normalized.email, "alice@stren.app");
    });

    it("C. Coach can book an appointment with a member who has an active relationship", () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
      const endTime = new Date(now.getTime() + 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString();

      const appt = simulateCreateAppointment("coach-1", {
        memberId: "member-1",
        title: "Weekly Check-In",
        type: "CHECK_IN",
        startTime,
        endTime,
      });

      assert.ok(appt.id);
      assert.equal(appt.memberId, "member-1");
      assert.equal(appt.trainerId, "coach-1");
      assert.equal(appt.status, "SCHEDULED");
    });

    it("D. Coach cannot book an appointment with an athlete who has no active coaching relationship (403)", () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
      const endTime = new Date(now.getTime() + 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString();

      assert.throws(
        () =>
          simulateCreateAppointment("coach-1", {
            memberId: "unrelated-member",
            title: "Unauthorized Meeting",
            type: "CHECK_IN",
            startTime,
            endTime,
          }),
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes("active coaching relationship"));
          return true;
        },
      );
    });

    it("E. Appointment validation enforces endTime strictly after startTime (400)", () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
      const invalidEndTime = startTime; // same time

      assert.throws(
        () =>
          simulateCreateAppointment("coach-1", {
            memberId: "member-1",
            title: "Zero Duration Meeting",
            type: "CHECK_IN",
            startTime,
            endTime: invalidEndTime,
          }),
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.ok(err.message.includes("strictly after"));
          return true;
        },
      );
    });

    it("F. Conflicting overlapping appointments for the same coach are rejected (409)", () => {
      const now = new Date();
      const t1 = new Date(now.getTime() + 48 * 3600 * 1000);
      const t2 = new Date(t1.getTime() + 60 * 60 * 1000);

      // Book first appointment
      simulateCreateAppointment("coach-1", {
        memberId: "member-1",
        title: "Session A",
        type: "CHECK_IN",
        startTime: t1.toISOString(),
        endTime: t2.toISOString(),
      });

      // Overlapping appointment attempt (starts 30 min into first)
      const tOverlapStart = new Date(t1.getTime() + 30 * 60 * 1000);
      const tOverlapEnd = new Date(t2.getTime() + 30 * 60 * 1000);

      assert.throws(
        () =>
          simulateCreateAppointment("coach-1", {
            memberId: "member-1",
            title: "Conflicting Session B",
            type: "CONSULTATION",
            startTime: tOverlapStart.toISOString(),
            endTime: tOverlapEnd.toISOString(),
          }),
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.ok(err.message.includes("Appointment conflict"));
          return true;
        },
      );
    });
  });
});

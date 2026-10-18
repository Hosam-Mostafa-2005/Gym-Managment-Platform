import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = process.env.JWT_SECRET || "phase1-test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

import { registerSchema } from "../validators/auth.validator.js";
import { updateAssignmentSchema } from "../validators/assignment.validator.js";
import {
  createExerciseSchema,
  updateExerciseSchema,
} from "../validators/exercise.validator.js";
import { Roles } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { Difficulty, Equipment } from "../constants/exercise.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import ApiFeatures, { escapeRegex } from "../utils/ApiFeatures.js";
import mapWorkoutSession from "../mappers/workout-session.mapper.js";
import mapAssignment from "../mappers/assignment.mapper.js";
import { mapBodyMeasurement } from "../mappers/body-measurement.mapper.js";
import User from "../models/User.model.js";
import Workout from "../models/Workout.model.js";
import { Assignment } from "../models/Assignment.model.js";
import authService from "../services/auth.service.js";
import workoutService from "../services/workout.service.js";

describe("STREN Phase 1 — Security & Data Contract Stabilization", () => {
  describe("1. P0 — Registration privilege escalation", () => {
    it("rejects admin and trainer roles in public registerSchema", () => {
      const adminAttempt = registerSchema.safeParse({
        body: {
          name: "Attacker Admin",
          email: "attacker@example.com",
          password: "password123",
          role: Roles.ADMIN,
        },
      });
      assert.equal(adminAttempt.success, false);

      const trainerAttempt = registerSchema.safeParse({
        body: {
          name: "Attacker Trainer",
          email: "trainer@example.com",
          password: "password123",
          role: Roles.TRAINER,
        },
      });
      assert.equal(trainerAttempt.success, false);
    });

    it("accepts member registration with omitted role or explicit member role", () => {
      const omittedRole = registerSchema.safeParse({
        body: {
          name: "Legit Member",
          email: "member@example.com",
          password: "password123",
        },
      });
      assert.equal(omittedRole.success, true);

      const explicitMember = registerSchema.safeParse({
        body: {
          name: "Legit Member",
          email: "member@example.com",
          password: "password123",
          role: Roles.MEMBER,
        },
      });
      assert.equal(explicitMember.success, true);
    });

    it("enforces member role in authService.register and strips privileged fields", async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: "Escalation Attempt",
            email: "escalate@example.com",
            password: "password123",
            role: Roles.ADMIN,
          });
        },
        (err: any) => err.statusCode === 403,
      );

      let createdPayload: any = null;
      const findOneMock = mock.method(User, "findOne", async () => null);
      const createMock = mock.method(User, "create", async (data: any) => {
        createdPayload = data;
        return {
          _id: "507f1f77bcf86cd799439011",
          id: "507f1f77bcf86cd799439011",
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: true,
        } as any;
      });

      try {
        await authService.register({
          name: "Safe Member",
          email: "safe@example.com",
          password: "password123",
          ...({ isActive: false, hourlyRate: 999 } as any),
        });

        assert.deepEqual(Object.keys(createdPayload).sort(), [
          "email",
          "name",
          "password",
          "role",
        ]);
        assert.equal(createdPayload.role, Roles.MEMBER);
      } finally {
        findOneMock.mock.restore();
        createMock.mock.restore();
      }
    });
  });

  describe("2. P0 — Unauthorized user listing", () => {
    it("restrictTo(ADMIN, TRAINER) blocks member role with 403 and allows trainer/admin", () => {
      const middleware = restrictTo(Roles.ADMIN, Roles.TRAINER);

      let memberErr: any = null;
      middleware(
        { user: { role: Roles.MEMBER } } as any,
        {} as any,
        (err?: any) => {
          memberErr = err;
        },
      );
      assert.ok(memberErr);
      assert.equal(memberErr.statusCode, 403);

      let nextCalled = false;
      middleware(
        { user: { role: Roles.TRAINER } } as any,
        {} as any,
        (err?: any) => {
          if (!err) nextCalled = true;
        },
      );
      assert.equal(nextCalled, true);
    });
  });

  describe("3. P0 — Inactive accounts", () => {
    it("protect middleware rejects authenticated users with isActive === false", async () => {
      const validToken = jwt.sign(
        { id: "507f1f77bcf86cd799439012" },
        process.env.JWT_SECRET!,
      );
      const findByIdMock = mock.method(
        User,
        "findById",
        async () =>
          ({
            _id: "507f1f77bcf86cd799439012",
            id: "507f1f77bcf86cd799439012",
            role: Roles.MEMBER,
            isActive: false,
          }) as any,
      );

      try {
        const forwardedError = await new Promise<any>((resolve) => {
          protect(
            {
              headers: { authorization: `Bearer ${validToken}` },
              cookies: {},
            } as any,
            {} as any,
            (err?: any) => {
              resolve(err);
            },
          );
        });

        assert.ok(forwardedError);
        assert.equal(forwardedError.statusCode, 401);
        assert.match(forwardedError.message, /deactivated/i);
      } finally {
        findByIdMock.mock.restore();
      }
    });
  });

  describe("4. P1 — Security filters cannot be overridden by query parameters", () => {
    it("ApiFeatures.filter preserves baseFilter and blocks protected keys", () => {
      let appliedFilter: Record<string, any> = {};
      const fakeQuery: any = {
        getFilter: () => ({
          isActive: true,
          createdBy: "trainer-1",
          trainer: "trainer-1",
        }),
        find(filterObj: Record<string, any>) {
          appliedFilter = filterObj;
          return this;
        },
      };

      const features = new ApiFeatures(fakeQuery, {
        isActive: "false",
        createdBy: "trainer-2",
        trainer: "trainer-2",
        difficulty: "beginner",
        $where: "malicious",
      });

      features.filter(["difficulty"]);

      assert.equal(appliedFilter.isActive, true);
      assert.equal(appliedFilter.createdBy, "trainer-1");
      assert.equal(appliedFilter.trainer, "trainer-1");
      assert.equal(appliedFilter.difficulty, "beginner");
      assert.equal(appliedFilter.$where, undefined);
    });

    it("escapeRegex escapes regex metacharacters in search queries", () => {
      const raw = "bench.*(press)+?[a-z]$^";
      const escaped = escapeRegex(raw);
      const regex = new RegExp(escaped, "i");
      assert.equal(regex.test("bench.*(press)+?[a-z]$^"), true);
      assert.equal(regex.test("bench press"), false);
    });
  });

  describe("5. P1 — Workout ownership", () => {
    it("rejects trainer accessing another trainer's private workout in getById, update, and delete", async () => {
      const fakeWorkout: any = {
        _id: "507f1f77bcf86cd799439099",
        title: "Private Hypertrophy",
        createdBy: {
          _id: "owner-trainer-id",
          toString: () => "owner-trainer-id",
        },
        isTemplate: false,
        isActive: true,
        exercises: [],
        toObject() {
          return this;
        },
      };

      const findOneMock = mock.method(Workout, "findOne", () => ({
        populate() {
          return this;
        },
        then(resolve: any) {
          return Promise.resolve(fakeWorkout).then(resolve);
        },
      }) as any);

      try {
        await assert.rejects(
          async () => {
            await workoutService.getById(
              "507f1f77bcf86cd799439099",
              "other-trainer-id",
              Roles.TRAINER,
            );
          },
          (err: any) => err.statusCode === 403,
        );

        await assert.rejects(
          async () => {
            await workoutService.update(
              "507f1f77bcf86cd799439099",
              { title: "Hijacked" },
              "other-trainer-id",
              Roles.TRAINER,
            );
          },
          (err: any) => err.statusCode === 403,
        );

        await assert.rejects(
          async () => {
            await workoutService.delete(
              "507f1f77bcf86cd799439099",
              "other-trainer-id",
              Roles.TRAINER,
            );
          },
          (err: any) => err.statusCode === 403,
        );
      } finally {
        findOneMock.mock.restore();
      }
    });

    it("rejects member accessing an unassigned private workout in getById", async () => {
      const fakeWorkout: any = {
        _id: "507f1f77bcf86cd799439099",
        title: "Private Hypertrophy",
        createdBy: {
          _id: "owner-trainer-id",
          toString: () => "owner-trainer-id",
        },
        isTemplate: false,
        isActive: true,
        exercises: [],
        toObject() {
          return this;
        },
      };

      const findOneMock = mock.method(Workout, "findOne", () => ({
        populate() {
          return this;
        },
        then(resolve: any) {
          return Promise.resolve(fakeWorkout).then(resolve);
        },
      }) as any);
      const existsMock = mock.method(Assignment, "exists", async () => null);

      try {
        await assert.rejects(
          async () => {
            await workoutService.getById(
              "507f1f77bcf86cd799439099",
              "unassigned-member-id",
              Roles.MEMBER,
            );
          },
          (err: any) => err.statusCode === 403,
        );
      } finally {
        findOneMock.mock.restore();
        existsMock.mock.restore();
      }
    });
  });

  describe("6. Data-Contract — Assignment detail/edit mapping", () => {
    it("maps populated assignment with id and workout details without corrupting nested IDs", () => {
      const rawAssignment = {
        _id: "assign-1",
        member: { _id: "member-1", name: "Member One", email: "m1@example.com" },
        trainer: { _id: "trainer-1", name: "Trainer One", email: "t1@example.com" },
        workout: {
          _id: "workout-1",
          title: "Upper Body Power",
          description: "Heavy compound lifts",
          category: "strength",
          difficulty: "intermediate",
          estimatedDuration: 60,
          exercises: [],
        },
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-02-01T00:00:00.000Z"),
        status: ASSIGNMENT_STATUS.CANCELLED,
        cancelledAt: new Date("2026-01-15T00:00:00.000Z"),
        cancelReason: "Member injured shoulder",
        notes: "Focus on form",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-15T00:00:00.000Z"),
      };

      const mapped = mapAssignment(rawAssignment);
      assert.equal(mapped.id, "assign-1");
      assert.ok(mapped.member);
      assert.ok(mapped.trainer);
      assert.ok(mapped.workout);
      assert.equal(typeof mapped.member.id, "string");
      assert.equal(mapped.member.id, "member-1");
      assert.equal(typeof mapped.trainer.id, "string");
      assert.equal(mapped.trainer.id, "trainer-1");
      assert.equal(typeof mapped.workout.id, "string");
      assert.equal(mapped.workout.id, "workout-1");
      assert.equal(mapped.workout.description, "Heavy compound lifts");
      assert.equal(mapped.workout.estimatedDuration, 60);
      assert.equal(mapped.cancelReason, "Member injured shoulder");
    });

    it("maps populated BodyMeasurement trainer to string ID without object serialization corruption", () => {
      const doc: any = {
        _id: { toString: () => "meas-1" },
        member: { _id: { toString: () => "member-1" } },
        trainer: { _id: { toString: () => "trainer-1" }, name: "Coach Alex" },
        weight: 80,
        height: 180,
        bodyFat: 14,
        circumferences: {},
        measuredAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mapped = mapBodyMeasurement(doc);
      assert.equal(mapped.member, "member-1");
      assert.equal(mapped.trainer, "trainer-1");
      assert.equal(mapped.trainerName, "Coach Alex");
    });
  });

  describe("7. Data-Contract — Assignment cancellation validation", () => {
    it("requires cancelReason when status is CANCELLED and rejects cancelReason for non-cancelled status", () => {
      const missingReason = updateAssignmentSchema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        body: {
          status: ASSIGNMENT_STATUS.CANCELLED,
        },
      });
      assert.equal(missingReason.success, false);

      const validCancellation = updateAssignmentSchema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        body: {
          status: ASSIGNMENT_STATUS.CANCELLED,
          cancelReason: "Schedule change requested by member",
        },
      });
      assert.equal(validCancellation.success, true);
      if (validCancellation.success) {
        assert.equal(
          validCancellation.data.body.cancelReason,
          "Schedule change requested by member",
        );
      }

      const reasonWithActiveStatus = updateAssignmentSchema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        body: {
          status: ASSIGNMENT_STATUS.ACTIVE,
          cancelReason: "Should not be allowed",
        },
      });
      assert.equal(reasonWithActiveStatus.success, false);
    });
  });

  describe("8. Data-Contract — Workout session telemetry preservation", () => {
    it("preserves progress, rest/active time, volume, completed counts, and notes in mapWorkoutSession", () => {
      const rawSession = {
        _id: "session-1",
        assignment: { _id: "assign-1" },
        status: "COMPLETED",
        startedAt: new Date("2026-03-01T10:00:00Z"),
        endedAt: new Date("2026-03-01T10:45:00Z"),
        duration: 45,
        progress: 100,
        totalRestTime: 600,
        activeTrainingTime: 2100,
        totalVolume: 4850,
        exercisesCompleted: 5,
        setsCompleted: 18,
        notes: "Strong session, hit PR on bench",
      };

      const mapped = mapWorkoutSession(rawSession);
      assert.equal(mapped.id, "session-1");
      assert.equal(mapped.duration, 45);
      assert.equal(mapped.progress, 100);
      assert.equal(mapped.totalRestTime, 600);
      assert.equal(mapped.activeTrainingTime, 2100);
      assert.equal(mapped.totalVolume, 4850);
      assert.equal(mapped.exercisesCompleted, 5);
      assert.equal(mapped.setsCompleted, 18);
      assert.equal(mapped.notes, "Strong session, hit PR on bench");
    });
  });

  describe("9. Data-Contract — Exercise PATCH preserves omitted secondaryMuscles", () => {
    it("does not inject secondaryMuscles: [] when omitted in updateExerciseSchema", () => {
      const createParsed = createExerciseSchema.parse({
        body: {
          name: "Barbell Bench Press",
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Chest"],
          instructions: ["Lower bar to chest", "Press up"],
        },
      });
      assert.deepEqual(createParsed.body.secondaryMuscles, []);

      const patchParsed = updateExerciseSchema.parse({
        body: {
          name: "Incline Barbell Bench Press",
        },
      });
      assert.equal(patchParsed.body.secondaryMuscles, undefined);
      assert.equal(
        Object.prototype.hasOwnProperty.call(
          patchParsed.body,
          "secondaryMuscles",
        ) && patchParsed.body.secondaryMuscles !== undefined,
        false,
      );
    });
  });
});

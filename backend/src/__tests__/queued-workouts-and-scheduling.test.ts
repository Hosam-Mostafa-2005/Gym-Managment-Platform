// src/__tests__/queued-workouts-and-scheduling.test.ts
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import dashboardService from "../services/dashboard.service.js";
import scheduledWorkoutService from "../services/scheduled-workout.service.js";

describe("STREN — Workout Queue, Scheduling UX & Assignment Workflow", () => {
  const coachId = "coach-test-queue-001";
  const memberId = "member-test-queue-002";
  const unlinkedMemberId = "member-test-unlinked-003";
  const workoutId = "workout-test-queue-w1";

  const coachUser = {
    id: coachId,
    name: "Coach Marcus Vance",
    email: "marcus.vance@stren.app",
    role: Roles.TRAINER,
    isActive: true,
  };

  const memberUser = {
    id: memberId,
    name: "Lucas Bennett",
    email: "lucas.bennett@stren.app",
    role: Roles.MEMBER,
    isActive: true,
  };

  const unlinkedMember = {
    id: unlinkedMemberId,
    name: "Standard Athlete",
    email: "standard.google.17929620298989@stren.app",
    role: Roles.MEMBER,
    isActive: true,
  };

  const workoutRecord = {
    id: workoutId,
    title: "Hypertrophy Push Block A",
    description: "Chest, Shoulders & Triceps Progression",
    difficulty: "intermediate" as any,
    estimatedDuration: 60,
    category: "strength" as any,
    createdBy: coachId,
    isActive: true,
  };

  // Helper setup
  async function setupFixtures() {
    // Upsert users
    await prisma.user.upsert({
      where: { id: coachUser.id },
      update: {},
      create: {
        id: coachUser.id,
        name: coachUser.name,
        email: coachUser.email,
        password: "hashedpassword123",
        role: coachUser.role,
        isActive: coachUser.isActive,
      },
    });

    await prisma.user.upsert({
      where: { id: memberUser.id },
      update: {},
      create: {
        id: memberUser.id,
        name: memberUser.name,
        email: memberUser.email,
        password: "hashedpassword123",
        role: memberUser.role,
        isActive: memberUser.isActive,
      },
    });

    await prisma.user.upsert({
      where: { id: unlinkedMember.id },
      update: {},
      create: {
        id: unlinkedMember.id,
        name: unlinkedMember.name,
        email: unlinkedMember.email,
        password: "hashedpassword123",
        role: unlinkedMember.role,
        isActive: unlinkedMember.isActive,
      },
    });

    // Upsert workout
    await prisma.workout.upsert({
      where: { id: workoutRecord.id },
      update: {},
      create: {
        id: workoutRecord.id,
        title: workoutRecord.title,
        description: workoutRecord.description,
        difficulty: workoutRecord.difficulty,
        estimatedDuration: workoutRecord.estimatedDuration,
        category: workoutRecord.category,
        createdBy: workoutRecord.createdBy,
        isActive: workoutRecord.isActive,
      },
    });

    // Establish active coaching relationship between Marcus and Lucas
    const existingRel = await prisma.coachMemberRelationship.findFirst({
      where: { trainerId: coachId, memberId: memberId },
    });

    if (!existingRel) {
      await prisma.coachMemberRelationship.create({
        data: {
          trainerId: coachId,
          memberId: memberId,
          status: "ACTIVE",
          isActive: true,
          historySharingConsent: "GRANTED",
          historyConsentAt: new Date(),
          startedAt: new Date(),
        },
      });
    }
  }

  // ==========================================================================
  // SECTION 1: QUEUED WORKOUTS & START-OF-DAY FILTERING
  // ==========================================================================
  describe("1. Queued Workouts Window & Dashboard Service", () => {
    it("A. Preserves workout scheduled earlier today without vanishing before completion", async () => {
      await setupFixtures();

      // Clean old scheduled workouts for this member
      await prisma.scheduledWorkout.deleteMany({
        where: { memberId },
      });

      // Create a workout scheduled 2 hours ago today
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const schedule = await prisma.scheduledWorkout.create({
        data: {
          memberId,
          workoutId,
          scheduledAt: twoHoursAgo,
          status: "SCHEDULED",
          notes: "Focus on controlled eccentric phase",
        },
      });

      // Call dashboard service
      const dashboard = await dashboardService.getMemberDashboard(memberId);

      // Verify upcomingWorkouts includes the workout from earlier today
      assert.ok(dashboard.upcomingWorkouts, "upcomingWorkouts must be defined");
      assert.ok(
        dashboard.upcomingWorkouts.length > 0,
        "Workouts scheduled for earlier today must remain in queue until done",
      );

      const found = dashboard.upcomingWorkouts.find((sw) => sw.id === schedule.id);
      assert.ok(found, "The session from earlier today must be present in queue");
      assert.equal(found.workout?.title, workoutRecord.title);

      // Verify currentWorkout in overview is populated
      assert.ok(
        dashboard.overview.currentWorkout,
        "overview.currentWorkout must be populated when scheduled workout exists",
      );
      assert.equal(
        dashboard.overview.currentWorkout.title,
        workoutRecord.title,
      );
    });

    it("B. Prioritizes active assignment and loads trainer details", async () => {
      await setupFixtures();

      // Clean old assignments
      await prisma.assignment.deleteMany({
        where: { memberId },
      });

      const today = new Date();
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.assignment.create({
        data: {
          memberId,
          trainerId: coachId,
          workoutId,
          startDate: today,
          endDate: nextMonth,
          status: "ACTIVE",
          notes: "Custom training block for Q4",
        },
      });

      const dashboard = await dashboardService.getMemberDashboard(memberId);

      assert.ok(
        dashboard.overview.activeAssignment,
        "activeAssignment must be present on overview",
      );
      assert.equal(
        dashboard.overview.activeAssignment.workout?.title,
        workoutRecord.title,
      );
      assert.equal(
        dashboard.overview.activeAssignment.trainer?.name,
        coachUser.name,
      );
    });
  });

  // ==========================================================================
  // SECTION 2: COACH WORKOUT SCHEDULING (FORM / NON-CALENDAR)
  // ==========================================================================
  describe("2. Coach Workout Scheduling Workflow & Permissions", () => {
    it("A. Allows coach to schedule workout for assigned member", async () => {
      await setupFixtures();

      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const scheduled = await scheduledWorkoutService.createCoachScheduled(
        coachId,
        {
          memberId,
          workoutId,
          scheduledAt: futureDate.toISOString(),
          notes: "Scheduled via Coach Form Workflow",
        },
      );

      assert.ok(scheduled.id, "Scheduled workout must have an ID");
      assert.equal(scheduled.memberId, memberId);
      assert.equal(scheduled.workoutId, workoutId);
      assert.equal(scheduled.status, "SCHEDULED");
      assert.equal(scheduled.notes, "Scheduled via Coach Form Workflow");
    });

    it("B. Rejects coach scheduling for an athlete outside active coaching roster", async () => {
      await setupFixtures();

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await assert.rejects(
        async () => {
          await scheduledWorkoutService.createCoachScheduled(coachId, {
            memberId: unlinkedMemberId,
            workoutId,
            scheduledAt: futureDate.toISOString(),
            notes: "Unauthorized attempt",
          });
        },
        (err: any) => {
          assert.equal(err.statusCode || err.status, 403);
          return true;
        },
        "Must throw 403 Forbidden when scheduling for unlinked member",
      );
    });

    it("C. Starting scheduled workout initiates live WorkoutSession properly", async () => {
      await setupFixtures();

      // Clean old active sessions and scheduled workouts for clean state
      await prisma.workoutSession.deleteMany({
        where: { memberId },
      });
      await prisma.scheduledWorkout.deleteMany({
        where: { memberId },
      });

      // Create scheduled workout
      const schedule = await prisma.scheduledWorkout.create({
        data: {
          memberId,
          workoutId,
          scheduledAt: new Date(),
          status: "SCHEDULED",
          notes: "Session to start",
        },
      });

      // Member starts the scheduled session
      const startedSession = await scheduledWorkoutService.start(
        schedule.id,
        memberId,
      );

      assert.ok(startedSession.id, "Session must have an ID");
      assert.equal(startedSession.workoutId, workoutId);

      // Verify schedule was linked to the live workout session
      const updatedSchedule = await prisma.scheduledWorkout.findUnique({
        where: { id: schedule.id },
      });
      assert.equal(updatedSchedule?.sessionId, startedSession.id);

      // Clean up the session created during the test to preserve fixture isolation
      await prisma.workoutSession.delete({
        where: { id: startedSession.id },
      });
    });
  });

  // ==========================================================================
  // SECTION 3: COACH SCHEDULE RETRIEVAL FILTERING
  // ==========================================================================
  describe("3. Coach Schedule Scope & Filters", () => {
    it("A. Returns scheduled sessions scoped to specific memberId when filtered", async () => {
      await setupFixtures();

      const results = await scheduledWorkoutService.getCoachScheduledWorkouts(
        coachId,
        { memberId },
      );

      assert.ok(Array.isArray(results), "Results must be an array");
      results.forEach((sw) => {
        assert.equal(
          sw.memberId,
          memberId,
          "All returned workouts must belong to the filtered member",
        );
      });
    });
  });

  after(async () => {
    await prisma.scheduledWorkout.deleteMany({
      where: { memberId: { in: [memberId, unlinkedMemberId] } },
    });
    await prisma.workoutSession.deleteMany({
      where: { memberId: { in: [memberId, unlinkedMemberId] } },
    });
    await prisma.assignment.deleteMany({
      where: { memberId: { in: [memberId, unlinkedMemberId] } },
    });
  });
});

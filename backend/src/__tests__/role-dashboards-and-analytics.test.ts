import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import dashboardService from "../services/dashboard.service.js";
import coachDashboardService from "../services/coach-dashboard.service.js";

describe("STREN — Role-Specific Dashboards, Navigation Isolation & Data Analytics Verification", () => {
  const coachId = "coach-test-1111";
  const memberId = "member-test-2222";

  describe("1. Role Isolation & Access Control Invariants", () => {
    it("rejects Member role from accessing Coach Dashboard with 403 Forbidden", async () => {
      await assert.rejects(
        async () => {
          await coachDashboardService.getDashboard(memberId, Roles.MEMBER);
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          return true;
        },
      );
    });
  });

  describe("2. Member Dashboard Analytics & Status Distribution", () => {
    it("returns session status distribution with Completed, In Progress, and Cancelled counts", async () => {
      const origSessionFindMany = prisma.workoutSession.findMany;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origExLogGroupBy = prisma.workoutExerciseLog.groupBy;
      const origSetLogFindFirst = prisma.workoutSetLog.findFirst;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origSessionFindFirst = prisma.workoutSession.findFirst;
      const origScheduledFindMany = prisma.scheduledWorkout?.findMany;

      (prisma.assignment as any).findFirst = async () => null;
      (prisma.workout as any).findFirst = async () => null;
      (prisma.workoutExerciseLog as any).groupBy = async () => [];
      (prisma.workoutSetLog as any).findFirst = async () => null;
      (prisma.assignment as any).findMany = async () => [];
      (prisma.workoutSession as any).findFirst = async () => null;
      if (prisma.scheduledWorkout) {
        (prisma.scheduledWorkout as any).findMany = async () => [
          {
            id: "sched-1",
            memberId,
            workoutId: "workout-1",
            scheduledAt: new Date(Date.now() + 86400000),
            notes: "Morning session",
            workout: {
              id: "workout-1",
              title: "Hypertrophy Upper A",
              difficulty: "INTERMEDIATE",
              category: "HYPERTROPHY",
              estimatedDuration: 45,
            },
          },
        ];
      }

      (prisma.workoutSession as any).findMany = async (args: any) => {
        if (args?.where?.status === WORKOUT_SESSION_STATUS.COMPLETED) {
          return [
            {
              id: "sess-comp-1",
              startedAt: new Date(),
              status: WORKOUT_SESSION_STATUS.COMPLETED,
            },
          ];
        }
        return [
          {
            id: "sess-1",
            startedAt: new Date(),
            status: WORKOUT_SESSION_STATUS.COMPLETED,
            totalVolume: 5200,
            duration: 50,
            exercisesCompleted: 5,
            setsCompleted: 15,
          },
          {
            id: "sess-2",
            startedAt: new Date(),
            status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
            totalVolume: 1200,
            duration: 15,
            exercisesCompleted: 2,
            setsCompleted: 4,
          },
          {
            id: "sess-3",
            startedAt: new Date(),
            status: WORKOUT_SESSION_STATUS.CANCELLED,
            totalVolume: 0,
            duration: 5,
            exercisesCompleted: 0,
            setsCompleted: 0,
          },
        ];
      };

      try {
        const dashboard = await dashboardService.getMemberDashboard(memberId);

        assert.ok(dashboard);
        assert.ok(dashboard.overview);
        assert.equal(dashboard.overview.totalSessions, 3);
        assert.equal(dashboard.overview.completedSessions, 1);
        assert.equal(dashboard.overview.totalVolumeLifted, 6400);

        // Verify session status distribution for Donut chart
        assert.ok(dashboard.charts);
        assert.ok(dashboard.charts.sessionStatusDistribution);
        const dist = dashboard.charts.sessionStatusDistribution;
        assert.equal(dist.length, 3);

        const comp = dist.find((d: any) => d.status === "Completed");
        const inProg = dist.find((d: any) => d.status === "In Progress");
        const canc = dist.find((d: any) => d.status === "Cancelled");

        assert.ok(comp);
        assert.equal(comp.count, 1);
        assert.equal(comp.percentage, 33);
        assert.equal(comp.color, "#5BE584");

        assert.ok(inProg);
        assert.equal(inProg.count, 1);
        assert.equal(inProg.color, "#3B82F6");

        assert.ok(canc);
        assert.equal(canc.count, 1);
        assert.equal(canc.color, "#EF4444");

        // Verify upcoming scheduled workouts
        assert.ok(dashboard.upcomingWorkouts);
        assert.equal(dashboard.upcomingWorkouts.length, 1);
        assert.equal(dashboard.upcomingWorkouts[0].id, "sched-1");
        assert.equal(
          dashboard.upcomingWorkouts[0].workout?.title,
          "Hypertrophy Upper A",
        );
      } finally {
        prisma.workoutSession.findMany = origSessionFindMany;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.workoutExerciseLog.groupBy = origExLogGroupBy;
        prisma.workoutSetLog.findFirst = origSetLogFindFirst;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.workoutSession.findFirst = origSessionFindFirst;
        if (prisma.scheduledWorkout && origScheduledFindMany) {
          prisma.scheduledWorkout.findMany = origScheduledFindMany;
        }
      }
    });
  });

  describe("3. Coach Dashboard Advanced Analytics & Scoped Ranking", () => {
    it("returns assignment status distribution, member activity ranking, and upcoming member schedules", async () => {
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origAssignmentCount = prisma.assignment.count;
      const origAssignmentGroupBy = prisma.assignment.groupBy;
      const origUserCount = prisma.user.count;
      const origUserFindMany = prisma.user.findMany;
      const origWorkoutCount = prisma.workout.count;
      const origWorkoutSessionFindMany = prisma.workoutSession.findMany;
      const origWorkoutSessionGroupBy = prisma.workoutSession.groupBy;
      const origBodyMeasurementCount = prisma.bodyMeasurement.count;
      const origBodyMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origScheduledFindMany = prisma.scheduledWorkout?.findMany;

      (prisma.assignment as any).findMany = async (args: any) => {
        if (args?.select?.memberId) {
          return [{ memberId: "athlete-1" }, { memberId: "athlete-2" }];
        }
        return [
          {
            id: "asgn-1",
            member: { id: "athlete-1", name: "Athlete One" },
            workout: { id: "w-1", title: "Upper Power" },
            endDate: new Date(Date.now() + 86400000 * 3),
            createdAt: new Date(),
          },
        ];
      };
      (prisma.user as any).count = async () => 2;
      (prisma.assignment as any).count = async (args: any) => {
        if (args?.where?.status === ASSIGNMENT_STATUS.ACTIVE) return 3;
        return 5;
      };
      (prisma.workout as any).count = async () => 12;
      (prisma.workoutSession as any).findMany = async () => [
        {
          id: "sess-1",
          startedAt: new Date(),
          status: WORKOUT_SESSION_STATUS.COMPLETED,
        },
      ];
      (prisma.bodyMeasurement as any).count = async () => 4;
      (prisma.bodyMeasurement as any).findMany = async () => [];
      (prisma.user as any).findMany = async (args: any) => {
        if (args?.select?.workoutSessions) {
          return [
            {
              id: "athlete-1",
              name: "Athlete One",
              email: "one@stren.app",
              workoutSessions: [],
              measurementsAsMember: [],
            },
          ];
        }
        return [
          { id: "athlete-1", name: "Athlete One" },
          { id: "athlete-2", name: "Athlete Two" },
        ];
      };

      (prisma.assignment as any).groupBy = async () => [
        { status: ASSIGNMENT_STATUS.ACTIVE, _count: { status: 3 } },
        { status: ASSIGNMENT_STATUS.COMPLETED, _count: { status: 4 } },
        { status: ASSIGNMENT_STATUS.CANCELLED, _count: { status: 1 } },
      ];

      (prisma.workoutSession as any).groupBy = async () => [
        { memberId: "athlete-1", _count: { memberId: 10 } },
        { memberId: "athlete-2", _count: { memberId: 6 } },
      ];

      if (prisma.scheduledWorkout) {
        (prisma.scheduledWorkout as any).findMany = async () => [
          {
            id: "sched-coach-1",
            scheduledAt: new Date(Date.now() + 172800000),
            member: { id: "athlete-1", name: "Athlete One", email: "one@stren.app" },
            workout: { id: "w-1", title: "Heavy Deadlift Day", category: "STRENGTH" },
          },
        ];
      }

      try {
        const dashboard = await coachDashboardService.getDashboard(coachId, Roles.TRAINER);

        assert.ok(dashboard);
        assert.ok(dashboard.overview);
        assert.equal(dashboard.overview.members.active, 2);
        assert.equal(dashboard.overview.assignments.active, 3);
        assert.equal(dashboard.overview.workoutsCreated, 12);

        // Verify charts
        assert.ok(dashboard.charts);
        assert.ok(dashboard.charts.assignmentStatusDistribution);
        const dist = dashboard.charts.assignmentStatusDistribution;
        assert.equal(dist.length, 3);
        const activeItem = dist.find((d: any) => d.status === "Active");
        assert.ok(activeItem);
        assert.equal(activeItem.count, 3);
        assert.equal(activeItem.color, "#5BE584");

        // Verify horizontal ranking
        assert.ok(dashboard.charts.memberActivityRanking);
        const ranking = dashboard.charts.memberActivityRanking;
        assert.equal(ranking.length, 2);
        assert.equal(ranking[0].name, "Athlete One");
        assert.equal(ranking[0].completedSessions, 10);
        assert.equal(ranking[1].name, "Athlete Two");
        assert.equal(ranking[1].completedSessions, 6);

        // Verify upcoming scheduled workouts
        assert.ok(dashboard.upcomingScheduledWorkouts);
        assert.equal(dashboard.upcomingScheduledWorkouts.length, 1);
        assert.equal(dashboard.upcomingScheduledWorkouts[0].id, "sched-coach-1");
        assert.equal(dashboard.upcomingScheduledWorkouts[0].member?.name, "Athlete One");
      } finally {
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.assignment.count = origAssignmentCount;
        prisma.assignment.groupBy = origAssignmentGroupBy;
        prisma.user.count = origUserCount;
        prisma.user.findMany = origUserFindMany;
        prisma.workout.count = origWorkoutCount;
        prisma.workoutSession.findMany = origWorkoutSessionFindMany;
        prisma.workoutSession.groupBy = origWorkoutSessionGroupBy;
        prisma.bodyMeasurement.count = origBodyMeasurementCount;
        prisma.bodyMeasurement.findMany = origBodyMeasurementFindMany;
        if (prisma.scheduledWorkout && origScheduledFindMany) {
          prisma.scheduledWorkout.findMany = origScheduledFindMany;
        }
      }
    });
  });
});

// src/__tests__/dashboard-and-privacy-improvement.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import dashboardService from "../services/dashboard.service.js";
import coachDashboardService from "../services/coach-dashboard.service.js";
import bodyMeasurementService from "../services/body-measurement.service.js";

describe("STREN — Dashboard Aggregation & Measurement Privacy Invariants Test Suite", () => {
  const coachId = "coach-test-id-1";
  const memberId = "member-test-id-1";
  const otherMemberId = "member-test-id-2";

  const memberUser = {
    id: memberId,
    name: "Alex Athlete",
    email: "alex@stren.app",
    role: Roles.MEMBER,
    isActive: true,
  };

  const coachUser = {
    id: coachId,
    name: "Coach Sam",
    email: "coach.sam@stren.app",
    role: Roles.TRAINER,
    isActive: true,
  };

  // ==========================================================================
  // PART 1: MEASUREMENT PRIVACY REGRESSION TESTS
  // ==========================================================================
  describe("1. Measurement Privacy Enforcement & History Sharing Consent", () => {
    it("A. Workout assignment alone NEVER grants access to member's body measurements", async () => {
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origRelFindMany = prisma.coachMemberRelationship.findMany;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origUserFindMany = prisma.user.findMany;
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

      // Coach has an active assignment for member, but NO CoachMemberRelationship
      (prisma.coachMemberRelationship as any).findFirst = async () => null;
      (prisma.coachMemberRelationship as any).findMany = async () => [];

      (prisma.assignment as any).findFirst = async () => ({
        id: "assign-1",
        trainerId: coachId,
        memberId,
        status: ASSIGNMENT_STATUS.ACTIVE,
        isActive: true,
      });
      (prisma.assignment as any).findMany = async () => [
        { id: "assign-1", trainerId: coachId, memberId, status: ASSIGNMENT_STATUS.ACTIVE },
      ];

      (prisma.user as any).findMany = async () => [memberUser];

      let queriedWhere: any = null;
      (prisma.bodyMeasurement as any).findMany = async ({ where }: any) => {
        queriedWhere = where;
        return [];
      };

      try {
        // Coach calls bodyMeasurementService.getAllByMember
        await bodyMeasurementService.getAllByMember(memberId, coachId, Roles.TRAINER);

        // Verification: query was strictly restricted to coach's own measurements (trainerId: coachId)
        assert.ok(queriedWhere);
        assert.equal(queriedWhere.trainerId, coachId);
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFindFirst;
        prisma.coachMemberRelationship.findMany = origRelFindMany;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.user.findMany = origUserFindMany;
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
      }
    });

    it("B. Denies measurement access when relationship consent is PENDING, DECLINED, or REVOKED", async () => {
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origRelFindMany = prisma.coachMemberRelationship.findMany;
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origUserFindMany = prisma.user.findMany;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origSessionFindMany = prisma.workoutSession.findMany;

      const consentStatuses = [
        HISTORY_SHARING_CONSENT.PENDING,
        HISTORY_SHARING_CONSENT.DECLINED,
        HISTORY_SHARING_CONSENT.REVOKED,
      ];

      for (const consent of consentStatuses) {
        (prisma.coachMemberRelationship as any).findFirst = async () => ({
          id: "rel-1",
          trainerId: coachId,
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          historySharingConsent: consent,
          startedAt: new Date("2026-01-01"),
          isActive: true,
        });

        (prisma.coachMemberRelationship as any).findMany = async () => [
          {
            id: "rel-1",
            trainerId: coachId,
            memberId,
            status: RELATIONSHIP_STATUS.ACTIVE,
            historySharingConsent: consent,
            startedAt: new Date("2026-01-01"),
            isActive: true,
            member: memberUser,
          },
        ];

        (prisma.user as any).findMany = async () => [memberUser];
        (prisma.assignment as any).findMany = async () => [];
        (prisma.workoutSession as any).findMany = async () => [];

        let queriedWhere: any = null;
        (prisma.bodyMeasurement as any).findMany = async ({ where }: any) => {
          queriedWhere = where;
          return [];
        };

        const dashboard = await coachDashboardService.getDashboard(coachId, Roles.TRAINER);

        // Verification: in Coach Dashboard, recent measurements query does NOT include this member
        assert.ok(dashboard);
        assert.ok(dashboard.clientHealthOverview);
        const clientCard = dashboard.clientHealthOverview.find((c: any) => c.id === memberId);
        assert.ok(clientCard);
        // Explicit safe restriction state
        assert.equal(clientCard.latestMeasurement.isRestricted, true);
        assert.equal(clientCard.latestMeasurement.restrictionReason, "CONSENT_REQUIRED");
        assert.equal(clientCard.latestMeasurement.weight, null);
      }

      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.coachMemberRelationship.findMany = origRelFindMany;
      prisma.bodyMeasurement.findMany = origMeasurementFindMany;
      prisma.user.findMany = origUserFindMany;
      prisma.assignment.findMany = origAssignmentFindMany;
      prisma.workoutSession.findMany = origSessionFindMany;
    });

    it("C. Grants measurement access only when relationship consent is explicitly GRANTED", async () => {
      const origRelFindMany = prisma.coachMemberRelationship.findMany;
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origUserFindMany = prisma.user.findMany;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origSessionFindMany = prisma.workoutSession.findMany;
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origMeasurementFindFirst = prisma.bodyMeasurement.findFirst;

      (prisma.coachMemberRelationship as any).findMany = async () => [
        {
          id: "rel-1",
          trainerId: coachId,
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
          startedAt: new Date("2026-01-01"),
          isActive: true,
          member: memberUser,
        },
      ];

      (prisma.user as any).findMany = async () => [memberUser];
      (prisma.assignment as any).findMany = async () => [];
      (prisma.workoutSession as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).findFirst = async () => ({
        id: "m-1",
        memberId,
        weight: 82.5,
        measuredAt: new Date("2026-10-20"),
      });

      try {
        const dashboard = await coachDashboardService.getDashboard(coachId, Roles.TRAINER);
        const clientCard = dashboard.clientHealthOverview.find((c: any) => c.id === memberId);

        assert.ok(clientCard);
        assert.equal(clientCard.latestMeasurement.isRestricted, false);
        assert.equal(clientCard.latestMeasurement.weight, 82.5);
      } finally {
        prisma.coachMemberRelationship.findMany = origRelFindMany;
        prisma.coachMemberRelationship.findFirst = origRelFindFirst;
        prisma.user.findMany = origUserFindMany;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.workoutSession.findMany = origSessionFindMany;
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
        prisma.bodyMeasurement.findFirst = origMeasurementFindFirst;
      }
    });

    it("D. Member can always access their own measurements regardless of coach consent", async () => {
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

      let queriedMemberId: string | null = null;
      (prisma.bodyMeasurement as any).findMany = async ({ where }: any) => {
        queriedMemberId = where.memberId;
        return [
          {
            id: "m-self-1",
            memberId,
            weight: 79.2,
            height: 180,
            measuredAt: new Date(),
            isActive: true,
            trainer: null,
          },
        ];
      };

      try {
        const results = await bodyMeasurementService.getAllByMember(memberId, memberId, Roles.MEMBER);
        assert.equal(results.length, 1);
        assert.equal(results[0].weight, 79.2);
        assert.equal(queriedMemberId, memberId);
      } finally {
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
      }
    });
  });

  // ==========================================================================
  // PART 2: MEMBER DASHBOARD AGGREGATION TESTS
  // ==========================================================================
  describe("2. Member Dashboard Aggregation & Invariants", () => {
    it("Returns latestMeasurement, consistency30Days, coachConnection, and needsAttention", async () => {
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origNotifCount = prisma.notification.count;
      const origSessionFindMany = prisma.workoutSession.findMany;
      const origAssignmentFindFirst = prisma.assignment.findFirst;

      const now = new Date();
      const sessionDate1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const sessionDate2 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

      (prisma.bodyMeasurement as any).findMany = async () => [
        { weight: 78.4, measuredAt: new Date("2026-10-22") },
        { weight: 79.1, measuredAt: new Date("2026-10-15") },
      ];

      (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
        if (where.status === "ACTIVE") {
          return {
            id: "rel-1",
            trainerId: coachId,
            memberId,
            status: RELATIONSHIP_STATUS.ACTIVE,
            historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
            startedAt: new Date("2026-06-01"),
            trainer: coachUser,
          };
        }
        if (where.status === "PENDING") {
          return null;
        }
        return null;
      };

      (prisma.notification as any).count = async () => 3;

      (prisma.workoutSession as any).findMany = async () => [
        {
          id: "s-1",
          memberId,
          status: WORKOUT_SESSION_STATUS.COMPLETED,
          startedAt: sessionDate1,
          totalVolume: 5000,
          duration: 45,
          exercisesCompleted: 5,
          setsCompleted: 15,
        },
        {
          id: "s-2",
          memberId,
          status: WORKOUT_SESSION_STATUS.COMPLETED,
          startedAt: sessionDate2,
          totalVolume: 6200,
          duration: 50,
          exercisesCompleted: 6,
          setsCompleted: 18,
        },
      ];

      try {
        const dashboard = await dashboardService.getMemberDashboard(memberId);

        assert.ok(dashboard);
        assert.ok(dashboard.overview);

        // Verification: latestMeasurement
        assert.ok(dashboard.overview.latestMeasurement);
        assert.equal(dashboard.overview.latestMeasurement.weight, 78.4);
        assert.equal(dashboard.overview.latestMeasurement.unit, "kg");
        assert.equal(dashboard.overview.latestMeasurement.diffFromPrevious, -0.7);

        // Verification: consistency30Days
        assert.ok(dashboard.overview.consistency30Days);
        assert.equal(dashboard.overview.consistency30Days.activeDays, 2);
        assert.equal(dashboard.overview.consistency30Days.totalDays, 30);
        assert.equal(dashboard.overview.consistency30Days.percentage, 7);

        // Verification: coachConnection
        assert.ok(dashboard.overview.coachConnection);
        assert.equal(dashboard.overview.coachConnection.hasActiveCoach, true);
        assert.equal(dashboard.overview.coachConnection.coach?.name, "Coach Sam");
        assert.equal(
          dashboard.overview.coachConnection.historySharingConsent,
          HISTORY_SHARING_CONSENT.GRANTED,
        );

        // Verification: needsAttention
        assert.ok(dashboard.overview.needsAttention);
        assert.equal(dashboard.overview.needsAttention.unreadNotificationsCount, 3);
        assert.equal(dashboard.overview.needsAttention.pendingInvitation, null);
      } finally {
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
        prisma.coachMemberRelationship.findFirst = origRelFindFirst;
        prisma.notification.count = origNotifCount;
        prisma.workoutSession.findMany = origSessionFindMany;
        prisma.assignment.findFirst = origAssignmentFindFirst;
      }
    });

    it("Gracefully handles empty state for member with no coach, no measurements, no workouts", async () => {
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origNotifCount = prisma.notification.count;
      const origSessionFindMany = prisma.workoutSession.findMany;

      (prisma.bodyMeasurement as any).findMany = async () => [];
      (prisma.coachMemberRelationship as any).findFirst = async () => null;
      (prisma.notification as any).count = async () => 0;
      (prisma.workoutSession as any).findMany = async () => [];

      try {
        const dashboard = await dashboardService.getMemberDashboard(memberId);

        assert.ok(dashboard);
        assert.equal(dashboard.overview.latestMeasurement, null);
        assert.equal(dashboard.overview.consistency30Days.activeDays, 0);
        assert.equal(dashboard.overview.consistency30Days.percentage, 0);
        assert.equal(dashboard.overview.coachConnection.hasActiveCoach, false);
        assert.equal(dashboard.overview.coachConnection.coach, null);
        assert.equal(dashboard.overview.needsAttention.unreadNotificationsCount, 0);
        assert.equal(dashboard.overview.needsAttention.pendingInvitation, null);
      } finally {
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
        prisma.coachMemberRelationship.findFirst = origRelFindFirst;
        prisma.notification.count = origNotifCount;
        prisma.workoutSession.findMany = origSessionFindMany;
      }
    });
  });

  // ==========================================================================
  // PART 3: COACH DASHBOARD DEFENSIBLE METRICS & ACTION CENTER
  // ==========================================================================
  describe("3. Coach Dashboard Defensible Metrics & Action Center", () => {
    it("Calculates defensible activity status and Action Center items without arbitrary scores", async () => {
      const origRelFindMany = prisma.coachMemberRelationship.findMany;
      const origRelCount = prisma.coachMemberRelationship.count;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origAssignmentCount = prisma.assignment.count;
      const origUserFindMany = prisma.user.findMany;
      const origSessionFindMany = prisma.workoutSession.findMany;
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      (prisma.coachMemberRelationship as any).findMany = async ({ where }: any) => {
        if (where?.status === "PENDING") {
          return [
            {
              id: "inv-1",
              trainerId: coachId,
              memberId: otherMemberId,
              status: "PENDING",
              invitedAt: now,
              notes: "Join my team",
              member: { id: otherMemberId, name: "Pending Member", email: "pending@stren.app" },
            },
          ];
        }
        return [
          {
            id: "rel-1",
            trainerId: coachId,
            memberId,
            status: "ACTIVE",
            historySharingConsent: "GRANTED",
            member: memberUser,
          },
        ];
      };

      (prisma.coachMemberRelationship as any).count = async () => 1;

      (prisma.assignment as any).findMany = async () => [
        {
          id: "assign-expiring",
          trainerId: coachId,
          memberId,
          member: memberUser,
          workout: { id: "w-1", title: "Strength Cycle A" },
          endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days remaining
          daysRemaining: 3,
        },
      ];

      (prisma.assignment as any).count = async () => 1;

      (prisma.user as any).findMany = async () => [
        {
          id: memberId,
          name: memberUser.name,
          email: memberUser.email,
          workoutSessions: [
            { startedAt: tenDaysAgo, status: "COMPLETED" },
          ],
        },
      ];

      (prisma.workoutSession as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).findMany = async () => [];

      try {
        const dashboard = await coachDashboardService.getDashboard(coachId, Roles.TRAINER);

        // Verification: Overview
        assert.ok(dashboard.overview);
        assert.equal(dashboard.overview.activeCoachingMembers, 1);
        assert.equal(dashboard.overview.pendingInvitations, 1);

        // Verification: Client Health Overview
        assert.ok(dashboard.clientHealthOverview);
        const client = dashboard.clientHealthOverview.find((c: any) => c.id === memberId);
        assert.ok(client);
        assert.equal(client.activityStatus, "INACTIVE_7_DAYS");
        assert.equal(client.daysSinceLastWorkout, 10);

        // Verification: Action Center
        assert.ok(dashboard.actionCenter);
        assert.equal(dashboard.actionCenter.pendingInvitations.length, 1);
        assert.equal(dashboard.actionCenter.pendingInvitations[0].member.name, "Pending Member");
        assert.equal(dashboard.actionCenter.expiringAssignments.length, 1);
        assert.equal(dashboard.actionCenter.inactiveClients.length, 1);
        assert.equal(dashboard.actionCenter.inactiveClients[0].id, memberId);
      } finally {
        prisma.coachMemberRelationship.findMany = origRelFindMany;
        prisma.coachMemberRelationship.count = origRelCount;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.assignment.count = origAssignmentCount;
        prisma.user.findMany = origUserFindMany;
        prisma.workoutSession.findMany = origSessionFindMany;
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
      }
    });
  });
});

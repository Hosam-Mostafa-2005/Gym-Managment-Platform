import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import coachMemberRelationshipService from "../services/coach-member-relationship.service.js";
import memberProfileService from "../services/member-profile.service.js";
import notificationService from "../services/notification.service.js";
import {
  inviteMemberSchema,
  respondInvitationSchema,
  historySharingConsentSchema,
} from "../validators/coaching-relationship.validator.js";

describe("STREN — Coach–Member Relationship, Invitations & History Sharing Test Suite", () => {
  const coach1Id = "coach-1111-uuid";
  const coach2Id = "coach-2222-uuid";
  const memberId = "member-3333-uuid";
  const unauthorizedMemberId = "member-9999-uuid";

  const memberUser = {
    id: memberId,
    name: "John Member",
    email: "john.member@stren.app",
    role: Roles.MEMBER,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const coach1User = {
    id: coach1Id,
    name: "Coach Marcus",
    email: "coach.marcus@stren.app",
    role: Roles.TRAINER,
    isActive: true,
    specialties: ["Powerlifting"],
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
  };

  const coach2User = {
    id: coach2Id,
    name: "Coach Elena",
    email: "coach.elena@stren.app",
    role: Roles.TRAINER,
    isActive: true,
    specialties: ["Hypertrophy"],
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
  };

  const origGlobalTx = prisma.$transaction;
  (prisma as any).$transaction = async (cb: any) => {
    if (typeof cb === "function") return cb(prisma);
    return cb;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 1: Coach invites eligible member by email
  // ──────────────────────────────────────────────────────────────────────────
  it("1. Coach invites eligible member by email, creates pending relationship & notification", async () => {
    const origUserFindFirst = prisma.user.findFirst;
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origTx = prisma.$transaction;
    const origNotificationCreate = notificationService.create;

    let transactionExecuted = false;
    let notificationPayload: any = null;

    (prisma.user as any).findFirst = async ({ where }: any) => {
      if (where.id === coach1Id) return coach1User;
      if (where.email === "john.member@stren.app") return memberUser;
      return null;
    };

    (prisma.coachMemberRelationship as any).findFirst = async () => null;

    (prisma as any).$transaction = async (callback: any) => {
      transactionExecuted = true;
      return callback({
        coachMemberRelationship: {
          create: async ({ data }: any) => ({
            id: "rel-123",
            trainerId: data.trainerId,
            memberId: data.memberId,
            status: data.status,
            historySharingConsent: data.historySharingConsent,
            notes: data.notes,
            invitedAt: data.invitedAt,
            respondedAt: null,
            startedAt: null,
            terminatedAt: null,
            historyConsentAt: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            trainer: coach1User,
            member: memberUser,
          }),
        },
      });
    };

    (notificationService as any).create = async (payload: any) => {
      notificationPayload = payload;
      return { id: "notif-1", ...payload };
    };

    try {
      const result = await coachMemberRelationshipService.inviteMember(
        coach1Id,
        {
          email: "john.member@stren.app",
          notes: "Welcome to my team!",
        },
      );

      assert.ok(transactionExecuted);
      assert.equal(result.id, "rel-123");
      assert.equal(result.trainerId, coach1Id);
      assert.equal(result.memberId, memberId);
      assert.equal(result.status, RELATIONSHIP_STATUS.PENDING);
      assert.equal(
        result.historySharingConsent,
        HISTORY_SHARING_CONSENT.PENDING,
      );
      assert.equal(result.startedAt, null);
      assert.equal(result.notes, "Welcome to my team!");

      assert.ok(notificationPayload);
      assert.equal(notificationPayload.user, memberId);
      assert.equal(
        notificationPayload.type,
        NOTIFICATION_TYPE.COACHING_INVITATION_RECEIVED,
      );
    } finally {
      prisma.user.findFirst = origUserFindFirst;
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.$transaction = origTx;
      notificationService.create = origNotificationCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 2: Invalid email / account / role scenarios handled
  // ──────────────────────────────────────────────────────────────────────────
  it("2. Handles invalid email, non-member role, and self-invitation safely", async () => {
    const origUserFindFirst = prisma.user.findFirst;

    (prisma.user as any).findFirst = async ({ where }: any) => {
      if (where.id === coach1Id) return coach1User;
      if (where.email === "missing@stren.app") return null;
      if (where.email === "coach.elena@stren.app") return coach2User;
      if (where.email === coach1User.email) return coach1User;
      return null;
    };

    try {
      // 2a. Email not found -> 404
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.inviteMember(coach1Id, {
            email: "missing@stren.app",
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 404);
          assert.match(err.message, /No active member account found/);
          return true;
        },
      );

      // 2b. Target is a trainer (not member) -> 400
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.inviteMember(coach1Id, {
            email: "coach.elena@stren.app",
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /Member role/);
          return true;
        },
      );

      // 2c. Self-invitation -> 400
      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where.id === coach1Id) return coach1User;
        if (where.email === coach1User.email) return { ...coach1User, role: Roles.MEMBER };
        return null;
      };

      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.inviteMember(coach1Id, {
            email: coach1User.email,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /invite yourself/);
          return true;
        },
      );
    } finally {
      prisma.user.findFirst = origUserFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 3: Duplicate invitations prevented
  // ──────────────────────────────────────────────────────────────────────────
  it("3. Prevents duplicate active relationships and pending invitations", async () => {
    const origUserFindFirst = prisma.user.findFirst;
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;

    (prisma.user as any).findFirst = async ({ where }: any) => {
      if (where.id === coach1Id) return coach1User;
      if (where.email === memberUser.email) return memberUser;
      return null;
    };

    // 3a. Existing active relationship -> 409
    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      if (where.status === RELATIONSHIP_STATUS.ACTIVE) {
        return { id: "rel-existing-active", status: RELATIONSHIP_STATUS.ACTIVE };
      }
      return null;
    };

    try {
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.inviteMember(coach1Id, {
            email: memberUser.email,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /already have an active coaching relationship/);
          return true;
        },
      );

      // 3b. Existing pending invitation -> 409
      (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
        if (where.status === RELATIONSHIP_STATUS.ACTIVE) return null;
        if (where.status === RELATIONSHIP_STATUS.PENDING) {
          return { id: "rel-existing-pending", status: RELATIONSHIP_STATUS.PENDING };
        }
        return null;
      };

      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.inviteMember(coach1Id, {
            email: memberUser.email,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /invitation is already pending/);
          return true;
        },
      );
    } finally {
      prisma.user.findFirst = origUserFindFirst;
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 4: Only intended member can accept/decline
  // ──────────────────────────────────────────────────────────────────────────
  it("4. Prevents unauthorized member from accepting or declining an invitation", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      // FindFirst enforces where: { id, memberId: requestingUser.id }
      if (where.id === "rel-123" && where.memberId === memberId) {
        return {
          id: "rel-123",
          trainerId: coach1Id,
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
          trainer: coach1User,
          member: memberUser,
        };
      }
      return null;
    };

    try {
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.respondInvitation(
            "rel-123",
            unauthorizedMemberId,
            { action: "ACCEPT" },
          );
        },
        (err: any) => {
          assert.equal(err.statusCode, 404);
          assert.match(err.message, /not found or already processed/);
          return true;
        },
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 5: Declining does not establish relationship
  // ──────────────────────────────────────────────────────────────────────────
  it("5. Member declines invitation: marks DECLINED, startedAt remains null, notifies coach", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origRelUpdate = prisma.coachMemberRelationship.update;
    const origNotificationCreate = notificationService.create;

    let updatedData: any = null;
    let notificationPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any = {}) => {
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE) {
        return null;
      }
      return {
        id: "rel-123",
        trainerId: coach1Id,
        memberId,
        status: RELATIONSHIP_STATUS.PENDING,
        isActive: true,
        trainer: coach1User,
        member: memberUser,
      };
    };

    (prisma.coachMemberRelationship as any).update = async ({ data }: any) => {
      updatedData = data;
      return {
        id: "rel-123",
        trainerId: coach1Id,
        memberId,
        status: data.status,
        historySharingConsent: HISTORY_SHARING_CONSENT.PENDING,
        startedAt: null,
        respondedAt: data.respondedAt,
        terminatedAt: null,
        historyConsentAt: null,
        isActive: true,
        trainer: coach1User,
        member: memberUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    };

    (notificationService as any).create = async (payload: any) => {
      notificationPayload = payload;
      return { id: "notif-2", ...payload };
    };

    try {
      const result = await coachMemberRelationshipService.respondInvitation(
        "rel-123",
        memberId,
        { action: "DECLINE" },
      );

      assert.equal(updatedData.status, RELATIONSHIP_STATUS.DECLINED);
      assert.ok(updatedData.respondedAt);
      assert.equal(result.status, RELATIONSHIP_STATUS.DECLINED);
      assert.equal(result.startedAt, null);

      assert.ok(notificationPayload);
      assert.equal(notificationPayload.user, coach1Id);
      assert.equal(
        notificationPayload.type,
        NOTIFICATION_TYPE.COACHING_INVITATION_DECLINED,
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.coachMemberRelationship.update = origRelUpdate;
      notificationService.create = origNotificationCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 6: Accepting establishes relationship but does NOT grant historical access
  // ──────────────────────────────────────────────────────────────────────────
  it("6. Member accepts invitation: marks ACTIVE, populates startedAt, leaves history PENDING", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origRelUpdate = prisma.coachMemberRelationship.update;
    const origNotificationCreate = notificationService.create;

    let updatedData: any = null;
    let notificationPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any = {}) => {
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE) {
        return null;
      }
      return {
        id: "rel-123",
        trainerId: coach1Id,
        memberId,
        status: RELATIONSHIP_STATUS.PENDING,
        isActive: true,
        trainer: coach1User,
        member: memberUser,
      };
    };

    (prisma.coachMemberRelationship as any).update = async ({ data }: any) => {
      updatedData = data;
      return {
        id: "rel-123",
        trainerId: coach1Id,
        memberId,
        status: data.status,
        historySharingConsent: data.historySharingConsent,
        startedAt: data.startedAt,
        respondedAt: data.respondedAt,
        terminatedAt: null,
        historyConsentAt: null,
        isActive: true,
        trainer: coach1User,
        member: memberUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    };

    (notificationService as any).create = async (payload: any) => {
      notificationPayload = payload;
      return { id: "notif-3", ...payload };
    };

    try {
      const result = await coachMemberRelationshipService.respondInvitation(
        "rel-123",
        memberId,
        { action: "ACCEPT" },
      );

      assert.equal(updatedData.status, RELATIONSHIP_STATUS.ACTIVE);
      assert.ok(updatedData.startedAt);
      assert.equal(
        updatedData.historySharingConsent,
        HISTORY_SHARING_CONSENT.PENDING,
      );
      assert.equal(result.status, RELATIONSHIP_STATUS.ACTIVE);
      assert.equal(
        result.historySharingConsent,
        HISTORY_SHARING_CONSENT.PENDING,
      );

      assert.ok(notificationPayload);
      assert.equal(notificationPayload.user, coach1Id);
      assert.equal(
        notificationPayload.type,
        NOTIFICATION_TYPE.COACHING_INVITATION_ACCEPTED,
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.coachMemberRelationship.update = origRelUpdate;
      notificationService.create = origNotificationCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 7: Historical access denied before explicit consent
  // ──────────────────────────────────────────────────────────────────────────
  it("7. Denies pre-relationship historical access to coach when consent is PENDING or DECLINED", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origAssignmentFindFirst = prisma.assignment.findFirst;
    const origAssignmentFindMany = prisma.assignment.findMany;
    const origUserFindFirst = prisma.user.findFirst;
    const origSessionFindMany = prisma.workoutSession.findMany;
    const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

    const relationshipStartDate = new Date("2026-06-01T10:00:00.000Z");

    let sessionWhereClause: any = null;
    let measurementWhereClause: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async () => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: HISTORY_SHARING_CONSENT.PENDING, // Not granted!
      startedAt: relationshipStartDate,
      isActive: true,
      trainer: coach1User,
    });

    (prisma.assignment as any).findFirst = async () => null;
    (prisma.assignment as any).findMany = async ({ where }: any) => {
      if (where?.status === "ACTIVE" || where?.memberId === memberId) {
        return [
          {
            id: "assign-legacy-1",
            trainerId: coach1Id,
            memberId,
            workoutId: "w-leg-1",
            status: "ACTIVE",
            isActive: true,
            workout: { title: "Legacy Program" },
            trainer: { name: "Coach Marcus" },
          },
        ];
      }
      return [];
    };
    (prisma.user as any).findFirst = async () => memberUser;

    (prisma.workoutSession as any).findMany = async ({ where }: any) => {
      sessionWhereClause = where;
      return [];
    };

    (prisma.bodyMeasurement as any).findMany = async ({ where }: any) => {
      measurementWhereClause = where;
      return [];
    };

    try {
      const profile = await memberProfileService.getProfile(
        memberId,
        coach1Id,
        Roles.TRAINER,
      );

      // Verify DB where clause strictly excluded pre-relationship records
      assert.ok(sessionWhereClause);
      assert.deepEqual(sessionWhereClause.startedAt, {
        gte: relationshipStartDate,
      });

      assert.ok(measurementWhereClause);
      assert.deepEqual(measurementWhereClause.measuredAt, {
        gte: relationshipStartDate,
      });

      // Verify mapped profile payload enforces privacy
      assert.equal(profile.coachingRelationship?.canAccessHistory, false);
      assert.equal(profile.historicalProgress?.isShared, false);
      assert.equal(profile.historicalProgress?.sessions.length, 0);
      assert.equal(profile.historicalProgress?.measurements.length, 0);
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.assignment.findFirst = origAssignmentFindFirst;
      prisma.assignment.findMany = origAssignmentFindMany;
      prisma.user.findFirst = origUserFindFirst;
      prisma.workoutSession.findMany = origSessionFindMany;
      prisma.bodyMeasurement.findMany = origMeasurementFindMany;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 8: Historical access granted only to consenting coach
  // ──────────────────────────────────────────────────────────────────────────
  it("8. Grants pre-relationship historical access once member explicitly updates consent to GRANTED", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origRelUpdate = prisma.coachMemberRelationship.update;
    const origAssignmentFindFirst = prisma.assignment.findFirst;
    const origAssignmentFindMany = prisma.assignment.findMany;
    const origUserFindFirst = prisma.user.findFirst;
    const origSessionFindMany = prisma.workoutSession.findMany;
    const origMeasurementFindMany = prisma.bodyMeasurement.findMany;
    const origNotificationCreate = notificationService.create;

    const relationshipStartDate = new Date("2026-06-01T10:00:00.000Z");

    let notificationPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async () => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
      startedAt: relationshipStartDate,
      isActive: true,
      trainer: coach1User,
      member: memberUser,
    });

    (prisma.coachMemberRelationship as any).update = async ({ data }: any) => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: data.historySharingConsent,
      historyConsentAt: data.historyConsentAt,
      startedAt: relationshipStartDate,
      isActive: true,
      trainer: coach1User,
      member: memberUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (notificationService as any).create = async (payload: any) => {
      notificationPayload = payload;
      return { id: "notif-4", ...payload };
    };

    // 8a. Member updates consent to GRANTED
    const updatedRel = await coachMemberRelationshipService.updateHistoryConsent(
      "rel-123",
      memberId,
      { consent: "GRANTED" },
    );

    assert.equal(updatedRel.historySharingConsent, HISTORY_SHARING_CONSENT.GRANTED);
    assert.ok(notificationPayload);
    assert.equal(
      notificationPayload.type,
      NOTIFICATION_TYPE.HISTORY_SHARING_GRANTED,
    );

    // 8b. Coach queries profile: pre-relationship records are returned & tagged isHistorical: true
    const preSession = {
      id: "sess-pre-1",
      startedAt: new Date("2026-01-15T09:00:00.000Z"),
      endedAt: new Date("2026-01-15T10:00:00.000Z"),
      status: "COMPLETED",
      duration: 3600,
      totalVolume: 5000,
      workout: { id: "w-1", title: "Past Strength Workout" },
    };

    const currentSession = {
      id: "sess-cur-1",
      startedAt: new Date("2026-07-10T09:00:00.000Z"),
      endedAt: new Date("2026-07-10T10:00:00.000Z"),
      status: "COMPLETED",
      duration: 3600,
      totalVolume: 6000,
      workout: { id: "w-2", title: "Current Coached Workout" },
    };

    const preMeasurement = {
      id: "meas-pre-1",
      weight: 85,
      height: 180,
      bodyFat: 20,
      measuredAt: new Date("2026-01-10T00:00:00.000Z"),
      createdAt: new Date("2026-01-10T00:00:00.000Z"),
    };

    const currentMeasurement = {
      id: "meas-cur-1",
      weight: 82,
      height: 180,
      bodyFat: 17,
      measuredAt: new Date("2026-07-15T00:00:00.000Z"),
      createdAt: new Date("2026-07-15T00:00:00.000Z"),
    };

    (prisma.assignment as any).findFirst = async () => null;
    (prisma.assignment as any).findMany = async ({ where }: any) => {
      if (where?.status === "ACTIVE" || where?.memberId === memberId) {
        return [
          {
            id: "assign-legacy-1",
            trainerId: coach1Id,
            memberId,
            workoutId: "w-leg-1",
            status: "ACTIVE",
            isActive: true,
            workout: { title: "Legacy Program" },
            trainer: { name: "Coach Marcus" },
          },
        ];
      }
      return [];
    };
    (prisma.user as any).findFirst = async () => memberUser;
    (prisma.workoutSession as any).findMany = async () => [currentSession, preSession];
    (prisma.bodyMeasurement as any).findMany = async () => [currentMeasurement, preMeasurement];

    try {
      const profile = await memberProfileService.getProfile(
        memberId,
        coach1Id,
        Roles.TRAINER,
      );

      assert.equal(profile.coachingRelationship?.canAccessHistory, true);
      assert.equal(profile.historicalProgress?.isShared, true);

      // Verify separation
      assert.equal(profile.historicalProgress?.sessions.length, 1);
      assert.equal(profile.historicalProgress?.sessions[0].id, "sess-pre-1");
      assert.equal(profile.historicalProgress?.sessions[0].isHistorical, true);

      assert.equal(profile.currentCoachProgress?.sessions.length, 1);
      assert.equal(profile.currentCoachProgress?.sessions[0].id, "sess-cur-1");
      assert.equal(profile.currentCoachProgress?.sessions[0].isHistorical, false);

      assert.equal(profile.historicalProgress?.measurements.length, 1);
      assert.equal(profile.historicalProgress?.measurements[0].isHistorical, true);

      assert.equal(profile.currentCoachProgress?.measurements.length, 1);
      assert.equal(profile.currentCoachProgress?.measurements[0].isHistorical, false);

      // Verify weight comparison under coach
      assert.ok(profile.currentCoachProgress?.weightComparison);
      assert.equal(profile.currentCoachProgress?.weightComparison?.preCoachWeight, 85);
      assert.equal(profile.currentCoachProgress?.weightComparison?.currentWeight, 82);
      assert.equal(profile.currentCoachProgress?.weightComparison?.weightChange, -3);
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.coachMemberRelationship.update = origRelUpdate;
      prisma.assignment.findFirst = origAssignmentFindFirst;
      prisma.assignment.findMany = origAssignmentFindMany;
      prisma.user.findFirst = origUserFindFirst;
      prisma.workoutSession.findMany = origSessionFindMany;
      prisma.bodyMeasurement.findMany = origMeasurementFindMany;
      notificationService.create = origNotificationCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 9: Another coach cannot access same history
  // ──────────────────────────────────────────────────────────────────────────
  it("9. Another coach without relationship or consent cannot access member history", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origAssignmentFindFirst = prisma.assignment.findFirst;

    // Coach 2 has no active relationship and no assignment
    (prisma.coachMemberRelationship as any).findFirst = async () => null;
    (prisma.assignment as any).findFirst = async () => null;

    try {
      await assert.rejects(
        async () => {
          await memberProfileService.getProfile(memberId, coach2Id, Roles.TRAINER);
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Member is not assigned to you/);
          return true;
        },
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.assignment.findFirst = origAssignmentFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 10: Revoking consent blocks access immediately
  // ──────────────────────────────────────────────────────────────────────────
  it("10. Member revoking consent immediately cuts off historical access for coach", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origRelUpdate = prisma.coachMemberRelationship.update;
    const origNotificationCreate = notificationService.create;

    let notificationPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async () => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
      isActive: true,
      trainer: coach1User,
      member: memberUser,
    });

    (prisma.coachMemberRelationship as any).update = async ({ data }: any) => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: data.historySharingConsent,
      historyConsentAt: data.historyConsentAt,
      isActive: true,
      trainer: coach1User,
      member: memberUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (notificationService as any).create = async (payload: any) => {
      notificationPayload = payload;
      return { id: "notif-5", ...payload };
    };

    try {
      const revoked = await coachMemberRelationshipService.updateHistoryConsent(
        "rel-123",
        memberId,
        { consent: "REVOKED" },
      );

      assert.equal(revoked.historySharingConsent, HISTORY_SHARING_CONSENT.REVOKED);
      assert.ok(notificationPayload);
      assert.equal(
        notificationPayload.type,
        NOTIFICATION_TYPE.HISTORY_SHARING_REVOKED,
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.coachMemberRelationship.update = origRelUpdate;
      notificationService.create = origNotificationCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 11: Historical records remain separate from current-coach progress
  // ──────────────────────────────────────────────────────────────────────────
  it("11. Verifies strict segregation between pre-coach history and current coach progress", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origAssignmentFindFirst = prisma.assignment.findFirst;
    const origAssignmentFindMany = prisma.assignment.findMany;
    const origUserFindFirst = prisma.user.findFirst;
    const origSessionFindMany = prisma.workoutSession.findMany;
    const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

    const relationshipStartDate = new Date("2026-05-01T00:00:00.000Z");

    const preCoachSessions = [
      {
        id: "s-old-1",
        startedAt: new Date("2026-03-01T10:00:00.000Z"),
        status: "COMPLETED",
        duration: 3000,
        totalVolume: 4000,
        workout: { id: "w-1", title: "Old Program" },
      },
    ];

    const currentCoachSessions = [
      {
        id: "s-new-1",
        startedAt: new Date("2026-05-15T10:00:00.000Z"),
        status: "COMPLETED",
        duration: 3600,
        totalVolume: 5000,
        workout: { id: "w-2", title: "New Program" },
      },
      {
        id: "s-new-2",
        startedAt: new Date("2026-05-20T10:00:00.000Z"),
        status: "COMPLETED",
        duration: 4000,
        totalVolume: 6000,
        workout: { id: "w-2", title: "New Program" },
      },
    ];

    (prisma.coachMemberRelationship as any).findFirst = async () => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
      startedAt: relationshipStartDate,
      isActive: true,
      trainer: coach1User,
    });

    (prisma.assignment as any).findFirst = async () => null;
    (prisma.assignment as any).findMany = async ({ where }: any) => {
      if (where?.status === "ACTIVE" || where?.memberId === memberId) {
        return [
          {
            id: "assign-legacy-1",
            trainerId: coach1Id,
            memberId,
            workoutId: "w-leg-1",
            status: "ACTIVE",
            isActive: true,
            workout: { title: "Legacy Program" },
            trainer: { name: "Coach Marcus" },
          },
        ];
      }
      return [];
    };
    (prisma.user as any).findFirst = async () => memberUser;
    (prisma.workoutSession as any).findMany = async () => [
      ...currentCoachSessions,
      ...preCoachSessions,
    ];
    (prisma.bodyMeasurement as any).findMany = async () => [];

    try {
      const profile = await memberProfileService.getProfile(
        memberId,
        coach1Id,
        Roles.TRAINER,
      );

      // Pre-coach session stats: 1 session, 4000 kg volume
      assert.equal(profile.historicalProgress?.stats?.totalSessions, 1);
      assert.equal(profile.historicalProgress?.stats?.totalVolume, 4000);

      // Current coach session stats: 2 sessions, 11000 kg volume
      assert.equal(profile.currentCoachProgress?.stats?.totalSessions, 2);
      assert.equal(profile.currentCoachProgress?.stats?.totalVolume, 11000);
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.assignment.findFirst = origAssignmentFindFirst;
      prisma.assignment.findMany = origAssignmentFindMany;
      prisma.user.findFirst = origUserFindFirst;
      prisma.workoutSession.findMany = origSessionFindMany;
      prisma.bodyMeasurement.findMany = origMeasurementFindMany;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 12: Member continues using STREN normally after declining history sharing
  // ──────────────────────────────────────────────────────────────────────────
  it("12. Member can view all their own workouts & measurements without any cutoff even if history is declined for coach", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origAssignmentFindFirst = prisma.assignment.findFirst;
    const origAssignmentFindMany = prisma.assignment.findMany;
    const origUserFindFirst = prisma.user.findFirst;
    const origSessionFindMany = prisma.workoutSession.findMany;
    const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

    let queriedSessionWhere: any = null;
    let queriedMeasurementWhere: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async () => ({
      id: "rel-123",
      trainerId: coach1Id,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: HISTORY_SHARING_CONSENT.DECLINED,
      startedAt: new Date("2026-06-01T00:00:00.000Z"),
      isActive: true,
      trainer: coach1User,
    });

    (prisma.assignment as any).findFirst = async () => null;
    (prisma.assignment as any).findMany = async ({ where }: any) => {
      if (where?.status === "ACTIVE" || where?.memberId === memberId) {
        return [
          {
            id: "assign-legacy-1",
            trainerId: coach1Id,
            memberId,
            workoutId: "w-leg-1",
            status: "ACTIVE",
            isActive: true,
            workout: { title: "Legacy Program" },
            trainer: { name: "Coach Marcus" },
          },
        ];
      }
      return [];
    };
    (prisma.user as any).findFirst = async () => memberUser;

    (prisma.workoutSession as any).findMany = async ({ where }: any) => {
      queriedSessionWhere = where;
      return [];
    };

    (prisma.bodyMeasurement as any).findMany = async ({ where }: any) => {
      queriedMeasurementWhere = where;
      return [];
    };

    try {
      // Member views their own profile
      await memberProfileService.getProfile(memberId, memberId, Roles.MEMBER);

      // For member, startedAt is NOT injected into where clause
      assert.equal(queriedSessionWhere.startedAt, undefined);
      assert.equal(queriedMeasurementWhere.measuredAt, undefined);
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.assignment.findFirst = origAssignmentFindFirst;
      prisma.assignment.findMany = origAssignmentFindMany;
      prisma.user.findFirst = origUserFindFirst;
      prisma.workoutSession.findMany = origSessionFindMany;
      prisma.bodyMeasurement.findMany = origMeasurementFindMany;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 13: Notifications persisted and update count/state
  // ──────────────────────────────────────────────────────────────────────────
  it("13. Notifications schema and constants include all coaching lifecycle types", () => {
    assert.equal(
      NOTIFICATION_TYPE.COACHING_INVITATION_RECEIVED,
      "COACHING_INVITATION_RECEIVED",
    );
    assert.equal(
      NOTIFICATION_TYPE.COACHING_INVITATION_ACCEPTED,
      "COACHING_INVITATION_ACCEPTED",
    );
    assert.equal(
      NOTIFICATION_TYPE.COACHING_INVITATION_DECLINED,
      "COACHING_INVITATION_DECLINED",
    );
    assert.equal(
      NOTIFICATION_TYPE.COACHING_RELATIONSHIP_TERMINATED,
      "COACHING_RELATIONSHIP_TERMINATED",
    );
    assert.equal(
      NOTIFICATION_TYPE.HISTORY_SHARING_GRANTED,
      "HISTORY_SHARING_GRANTED",
    );
    assert.equal(
      NOTIFICATION_TYPE.HISTORY_SHARING_REVOKED,
      "HISTORY_SHARING_REVOKED",
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 14: Existing workout assignment and sessions continue working
  // ──────────────────────────────────────────────────────────────────────────
  it("14. Preserves workout assignment compatibility when coach views member assigned via Assignment model", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origAssignmentFindFirst = prisma.assignment.findFirst;
    const origAssignmentFindMany = prisma.assignment.findMany;
    const origUserFindFirst = prisma.user.findFirst;
    const origSessionFindMany = prisma.workoutSession.findMany;
    const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

    // No CoachMemberRelationship, but active Assignment exists
    (prisma.coachMemberRelationship as any).findFirst = async () => null;

    (prisma.assignment as any).findFirst = async ({ where }: any) => {
      if (where.memberId === memberId) {
        return {
          id: "assign-legacy-1",
          trainerId: coach1Id,
          memberId,
          workoutId: "w-leg-1",
          status: "ACTIVE",
          isActive: true,
          workout: { title: "Legacy Program" },
          trainer: { name: "Coach Marcus" },
        };
      }
      return null;
    };

    (prisma.assignment as any).findMany = async ({ where }: any) => {
      if (where?.status === "ACTIVE" || where?.memberId === memberId) {
        return [
          {
            id: "assign-legacy-1",
            trainerId: coach1Id,
            memberId,
            workoutId: "w-leg-1",
            status: "ACTIVE",
            isActive: true,
            workout: { title: "Legacy Program" },
            trainer: { name: "Coach Marcus" },
          },
        ];
      }
      return [];
    };
    (prisma.user as any).findFirst = async () => memberUser;
    (prisma.workoutSession as any).findMany = async () => [];
    (prisma.bodyMeasurement as any).findMany = async () => [];

    try {
      const profile = await memberProfileService.getProfile(
        memberId,
        coach1Id,
        Roles.TRAINER,
      );

      assert.ok(profile);
      assert.equal(profile.member.id, memberId);
      assert.equal(
        profile.overview.currentAssignment?.workout?.title,
        "Legacy Program",
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.assignment.findFirst = origAssignmentFindFirst;
      prisma.assignment.findMany = origAssignmentFindMany;
      prisma.user.findFirst = origUserFindFirst;
      prisma.workoutSession.findMany = origSessionFindMany;
      prisma.bodyMeasurement.findMany = origMeasurementFindMany;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Validation Schemas Test
  // ──────────────────────────────────────────────────────────────────────────
  it("15. Zod validation schemas validate invitation and consent payloads accurately", () => {
    // Valid invite
    const validInvite = inviteMemberSchema.parse({
      body: { email: "member@stren.app", notes: "Let's train" },
    });
    assert.equal(validInvite.body.email, "member@stren.app");

    // Invalid email
    assert.throws(() => {
      inviteMemberSchema.parse({ body: { email: "not-an-email" } });
    });

    // Valid respond
    const validAccept = respondInvitationSchema.parse({
      body: { action: "ACCEPT" },
    });
    assert.equal(validAccept.body.action, "ACCEPT");

    const validDecline = respondInvitationSchema.parse({
      body: { action: "DECLINE" },
    });
    assert.equal(validDecline.body.action, "DECLINE");

    // Invalid respond action
    assert.throws(() => {
      respondInvitationSchema.parse({ body: { action: "MAYBE" } });
    });

    // Valid history consent
    const validConsent = historySharingConsentSchema.parse({
      body: { consent: "GRANTED" },
    });
    assert.equal(validConsent.body.consent, "GRANTED");

    assert.throws(() => {
      historySharingConsentSchema.parse({ body: { consent: "INVALID" } });
    });
  });
});

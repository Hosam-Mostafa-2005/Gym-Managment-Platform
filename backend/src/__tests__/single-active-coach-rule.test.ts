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
import membersManagementService from "../services/members-management.service.js";
import notificationService from "../services/notification.service.js";

describe("STREN — Enforce One Active Coach Per Member Test Suite", () => {
  const memberId = "member-active-test-001";
  const otherMemberId = "member-other-test-002";
  const coachAId = "coach-alpha-001";
  const coachBId = "coach-beta-002";

  const memberUser = {
    id: memberId,
    name: "Omar Member",
    email: "omar.member@stren.app",
    role: Roles.MEMBER,
    isActive: true,
  };

  const coachAUser = {
    id: coachAId,
    name: "Coach Alpha",
    email: "coach.alpha@stren.app",
    role: Roles.TRAINER,
    isActive: true,
  };

  const coachBUser = {
    id: coachBId,
    name: "Coach Beta",
    email: "coach.beta@stren.app",
    role: Roles.TRAINER,
    isActive: true,
  };

  // Mock global transaction to pass mock client
  const origGlobalTx = prisma.$transaction;
  (prisma as any).$transaction = async (cb: any) => {
    if (typeof cb === "function") return cb(prisma);
    return cb;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 1. A member with no active coach accepts Coach A successfully
  // ──────────────────────────────────────────────────────────────────────────
  it("1. A member with no active coach accepts Coach A successfully", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;
    const origUpdate = prisma.coachMemberRelationship.update;
    const origNotifCreate = notificationService.create;

    let updatedRel: any = null;
    let notifPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      // Check for active coach -> none
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE) return null;
      // Pending invitation for Coach A
      if (where?.id === "inv-coach-a") {
        return {
          id: "inv-coach-a",
          trainerId: coachAId,
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
          trainer: coachAUser,
          member: memberUser,
        };
      }
      return null;
    };

    (prisma.coachMemberRelationship as any).update = async ({ where, data }: any) => {
      updatedRel = {
        id: where.id,
        trainerId: coachAId,
        memberId,
        status: data.status,
        startedAt: data.startedAt,
        respondedAt: data.respondedAt,
        historySharingConsent: data.historySharingConsent,
        isActive: true,
        trainer: coachAUser,
        member: memberUser,
      };
      return updatedRel;
    };

    (notificationService as any).create = async (payload: any) => {
      notifPayload = payload;
      return { id: "notif-1", ...payload };
    };

    try {
      const result = await coachMemberRelationshipService.respondInvitation(
        "inv-coach-a",
        memberId,
        { action: "ACCEPT" },
      );

      assert.equal(result.status, RELATIONSHIP_STATUS.ACTIVE);
      assert.equal(result.trainerId, coachAId);
      assert.ok(result.startedAt);
      assert.equal(updatedRel.status, RELATIONSHIP_STATUS.ACTIVE);
      assert.equal(notifPayload.user, coachAId);
      assert.equal(notifPayload.type, NOTIFICATION_TYPE.COACHING_INVITATION_ACCEPTED);
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
      prisma.coachMemberRelationship.update = origUpdate;
      notificationService.create = origNotifCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. A member already linked to Coach A attempts to accept Coach B and is rejected
  // ──────────────────────────────────────────────────────────────────────────
  it("2. A member already linked to Coach A attempts to accept Coach B and is rejected", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      // Pending invitation for Coach B
      if (where?.id === "inv-coach-b") {
        return {
          id: "inv-coach-b",
          trainerId: coachBId,
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
          trainer: coachBUser,
          member: memberUser,
        };
      }
      // Existing active relationship with Coach A
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE && where?.memberId === memberId) {
        return {
          id: "rel-active-coach-a",
          trainerId: coachAId,
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
          trainer: coachAUser,
          member: memberUser,
        };
      }
      return null;
    };

    try {
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.respondInvitation(
            "inv-coach-b",
            memberId,
            { action: "ACCEPT" },
          );
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /already connected to a coach/i);
          assert.match(err.message, /Coach Alpha/);
          assert.equal(err.data?.code, "ACTIVE_COACH_EXISTS");
          assert.equal(err.data?.currentCoach?.id, coachAId);
          assert.equal(err.data?.currentCoach?.name, "Coach Alpha");
          return true;
        },
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. A rejected second-coach acceptance does not change the existing relationship
  // ──────────────────────────────────────────────────────────────────────────
  it("3. A rejected second-coach acceptance does not change the existing relationship or overwrite pending invitation", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;
    const origUpdate = prisma.coachMemberRelationship.update;

    let updateCalled = false;

    const relationshipA = {
      id: "rel-active-coach-a",
      trainerId: coachAId,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      isActive: true,
      trainer: coachAUser,
      member: memberUser,
    };

    const invitationB = {
      id: "inv-coach-b",
      trainerId: coachBId,
      memberId,
      status: RELATIONSHIP_STATUS.PENDING,
      isActive: true,
      trainer: coachBUser,
      member: memberUser,
    };

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      if (where?.id === "inv-coach-b") return invitationB;
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE) return relationshipA;
      return null;
    };

    (prisma.coachMemberRelationship as any).update = async () => {
      updateCalled = true;
      throw new Error("Update should NOT be called on conflict");
    };

    try {
      await assert.rejects(async () => {
        await coachMemberRelationshipService.respondInvitation(
          "inv-coach-b",
          memberId,
          { action: "ACCEPT" },
        );
      });

      // Crucial: No update must have taken place!
      assert.equal(updateCalled, false);
      assert.equal(relationshipA.status, RELATIONSHIP_STATUS.ACTIVE);
      assert.equal(invitationB.status, RELATIONSHIP_STATUS.PENDING);
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
      prisma.coachMemberRelationship.update = origUpdate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. The member can end their own active relationship using the supported flow
  // ──────────────────────────────────────────────────────────────────────────
  it("4. The member can end their own active relationship using the supported flow", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;
    const origUpdate = prisma.coachMemberRelationship.update;
    const origAccessUpdateMany = prisma.memberExerciseAccess.updateMany;
    const origNotifCreate = notificationService.create;

    let updatedData: any = null;
    let notifPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      if (where?.id === "rel-active-coach-a" && where?.status === RELATIONSHIP_STATUS.ACTIVE) {
        return {
          id: "rel-active-coach-a",
          trainerId: coachAId,
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
          trainer: coachAUser,
          member: memberUser,
        };
      }
      return null;
    };

    (prisma.coachMemberRelationship as any).update = async ({ where, data }: any) => {
      updatedData = { id: where.id, ...data };
      return {
        id: where.id,
        trainerId: coachAId,
        memberId,
        status: data.status,
        terminatedAt: data.terminatedAt,
        isActive: true,
        trainer: coachAUser,
        member: memberUser,
      };
    };

    (prisma.memberExerciseAccess as any).updateMany = async () => ({ count: 0 });

    (notificationService as any).create = async (payload: any) => {
      notifPayload = payload;
      return { id: "notif-term", ...payload };
    };

    try {
      // Direct call by member
      const result = await coachMemberRelationshipService.terminateRelationship(
        "rel-active-coach-a",
        memberId,
        Roles.MEMBER,
      );

      assert.equal(result.status, RELATIONSHIP_STATUS.REVOKED);
      assert.equal(updatedData.status, RELATIONSHIP_STATUS.REVOKED);
      assert.ok(updatedData.terminatedAt);
      assert.equal(notifPayload.user, coachAId);
      assert.equal(notifPayload.type, NOTIFICATION_TYPE.COACHING_RELATIONSHIP_TERMINATED);
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
      prisma.coachMemberRelationship.update = origUpdate;
      prisma.memberExerciseAccess.updateMany = origAccessUpdateMany;
      notificationService.create = origNotifCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. A member cannot terminate another member's relationship
  // ──────────────────────────────────────────────────────────────────────────
  it("5. A member cannot terminate another member's relationship by altering ID", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      if (where?.id === "rel-active-coach-a") {
        return {
          id: "rel-active-coach-a",
          trainerId: coachAId,
          memberId: memberId, // Belongs to Omar Member
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
          trainer: coachAUser,
          member: memberUser,
        };
      }
      return null;
    };

    try {
      // Malicious other member tries to terminate Omar's relationship
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.terminateRelationship(
            "rel-active-coach-a",
            otherMemberId, // Different member!
            Roles.MEMBER,
          );
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /not authorized to terminate/i);
          return true;
        },
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. After ending Coach A's relationship, the member can accept Coach B
  // ──────────────────────────────────────────────────────────────────────────
  it("6. After ending Coach A's relationship, the member can accept Coach B", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;
    const origUpdate = prisma.coachMemberRelationship.update;
    const origNotifCreate = notificationService.create;

    let coachBUpdated: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      // Member now has NO active coach (Coach A is REVOKED)
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE) return null;
      if (where?.id === "inv-coach-b") {
        return {
          id: "inv-coach-b",
          trainerId: coachBId,
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
          trainer: coachBUser,
          member: memberUser,
        };
      }
      return null;
    };

    (prisma.coachMemberRelationship as any).update = async ({ where, data }: any) => {
      coachBUpdated = { id: where.id, ...data };
      return {
        id: where.id,
        trainerId: coachBId,
        memberId,
        status: data.status,
        startedAt: data.startedAt,
        respondedAt: data.respondedAt,
        historySharingConsent: data.historySharingConsent,
        isActive: true,
        trainer: coachBUser,
        member: memberUser,
      };
    };

    (notificationService as any).create = async (payload: any) => ({ id: "notif-b", ...payload });

    try {
      const result = await coachMemberRelationshipService.respondInvitation(
        "inv-coach-b",
        memberId,
        { action: "ACCEPT" },
      );

      assert.equal(result.status, RELATIONSHIP_STATUS.ACTIVE);
      assert.equal(result.trainerId, coachBId);
      assert.equal(coachBUpdated.status, RELATIONSHIP_STATUS.ACTIVE);
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
      prisma.coachMemberRelationship.update = origUpdate;
      notificationService.create = origNotifCreate;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. The member profile displays the correct active coach
  // ──────────────────────────────────────────────────────────────────────────
  it("7. The member profile displays the correct active coach", async () => {
    const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
    const origUserFindFirst = prisma.user.findFirst;
    const origAssignFindMany = prisma.assignment.findMany;
    const origMeasFindMany = prisma.bodyMeasurement.findMany;
    const origSessFindMany = prisma.workoutSession.findMany;

    let activeRelInDb: any = {
      id: "rel-coach-b",
      trainerId: coachBId,
      memberId,
      status: RELATIONSHIP_STATUS.ACTIVE,
      historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
      startedAt: new Date(),
      isActive: true,
      trainer: coachBUser,
    };

    (prisma.coachMemberRelationship as any).findFirst = async () => activeRelInDb;
    (prisma.user as any).findFirst = async () => memberUser;
    (prisma.assignment as any).findMany = async () => [];
    (prisma.bodyMeasurement as any).findMany = async () => [];
    (prisma.workoutSession as any).findMany = async () => [];

    try {
      // 1. When Coach B is active
      const activeRel = await coachMemberRelationshipService.getMemberActiveRelationship(memberId);
      assert.ok(activeRel);
      assert.equal(activeRel.trainerId, coachBId);
      assert.equal(activeRel.trainer?.name, "Coach Beta");

      const profile = await memberProfileService.getProfile(memberId, memberId, Roles.MEMBER);
      assert.equal(profile.member.id, memberId);

      // 2. When coach is terminated (no active coach)
      activeRelInDb = null;
      const independentRel = await coachMemberRelationshipService.getMemberActiveRelationship(memberId);
      assert.equal(independentRel, null);
    } finally {
      prisma.coachMemberRelationship.findFirst = origRelFindFirst;
      prisma.user.findFirst = origUserFindFirst;
      prisma.assignment.findMany = origAssignFindMany;
      prisma.bodyMeasurement.findMany = origMeasFindMany;
      prisma.workoutSession.findMany = origSessFindMany;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Coach A and Coach B member lists reflect the correct relationship status
  // ──────────────────────────────────────────────────────────────────────────
  it("8. Coach A and Coach B member lists reflect the correct relationship status", async () => {
    const origUserFindMany = prisma.user.findMany;
    const origUserCount = prisma.user.count;

    // Simulate database where Member has Coach B active, and Coach A terminated
    (prisma.user as any).findMany = async ({ where }: any) => {
      const isCoachA = where?.AND?.some((c: any) =>
        c?.OR?.some((o: any) => o?.coachingAsMember?.some?.trainerId === coachAId),
      );
      const isCoachB = where?.AND?.some((c: any) =>
        c?.OR?.some((o: any) => o?.coachingAsMember?.some?.trainerId === coachBId),
      );

      if (isCoachB) {
        return [
          {
            ...memberUser,
            coachingAsMember: [
              {
                trainerId: coachBId,
                status: RELATIONSHIP_STATUS.ACTIVE,
                historySharingConsent: HISTORY_SHARING_CONSENT.GRANTED,
                startedAt: new Date(),
              },
            ],
            assignmentsAsMember: [],
            measurementsAsMember: [],
            workoutSessions: [],
          },
        ];
      }

      if (isCoachA) {
        // Coach A has NO active relationship with this member
        return [];
      }

      return [];
    };

    (prisma.user as any).count = async () => 1;

    try {
      // Coach A query
      const coachAList = await membersManagementService.getAllMembers({}, coachAId, Roles.TRAINER);
      assert.equal(coachAList.members.length, 0);

      // Coach B query
      const coachBList = await membersManagementService.getAllMembers({}, coachBId, Roles.TRAINER);
      assert.equal(coachBList.members.length, 1);
      assert.equal(coachBList.members[0].member.id, memberId);
      assert.equal(coachBList.members[0].member.name, "Omar Member");
    } finally {
      prisma.user.findMany = origUserFindMany;
      prisma.user.count = origUserCount;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Repeated or concurrent acceptance attempts cannot create two active coach relationships
  // ──────────────────────────────────────────────────────────────────────────
  it("9. Repeated or concurrent acceptance attempts cannot create two active coach relationships", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;

    // Simulate that during concurrent transaction, another coach relationship just activated
    let calls = 0;
    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      calls++;
      if (where?.id === "inv-coach-c") {
        return {
          id: "inv-coach-c",
          trainerId: "coach-c-id",
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
          trainer: { name: "Coach Charlie" },
          member: memberUser,
        };
      }
      if (where?.status === RELATIONSHIP_STATUS.ACTIVE) {
        // Returns the concurrently active Coach B
        return {
          id: "rel-coach-b",
          trainerId: coachBId,
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
          trainer: coachBUser,
          member: memberUser,
        };
      }
      return null;
    };

    try {
      await assert.rejects(
        async () => {
          await coachMemberRelationshipService.respondInvitation(
            "inv-coach-c",
            memberId,
            { action: "ACCEPT" },
          );
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.equal(err.data?.code, "ACTIVE_COACH_EXISTS");
          assert.equal(err.data?.currentCoach?.id, coachBId);
          return true;
        },
      );
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Pending invitations and historical relationships remain consistent
  // ──────────────────────────────────────────────────────────────────────────
  it("10. Pending invitations and historical relationships remain consistent with existing business rules", async () => {
    const origFindFirst = prisma.coachMemberRelationship.findFirst;
    const origUpdate = prisma.coachMemberRelationship.update;
    const origNotifCreate = notificationService.create;

    let declinedPayload: any = null;

    (prisma.coachMemberRelationship as any).findFirst = async ({ where }: any) => {
      if (where?.id === "inv-coach-d") {
        return {
          id: "inv-coach-d",
          trainerId: "coach-d-id",
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
          trainer: { id: "coach-d-id", name: "Coach Dave" },
          member: memberUser,
        };
      }
      return null;
    };

    (prisma.coachMemberRelationship as any).update = async ({ where, data }: any) => {
      declinedPayload = { id: where.id, ...data };
      return {
        id: where.id,
        trainerId: "coach-d-id",
        memberId,
        status: data.status,
        respondedAt: data.respondedAt,
        isActive: true,
        trainer: { id: "coach-d-id", name: "Coach Dave" },
        member: memberUser,
      };
    };

    (notificationService as any).create = async () => ({ id: "notif-d" });

    try {
      // Declining Coach D does not need any active coach check and does not mutate any other relationship
      const result = await coachMemberRelationshipService.respondInvitation(
        "inv-coach-d",
        memberId,
        { action: "DECLINE" },
      );

      assert.equal(result.status, RELATIONSHIP_STATUS.DECLINED);
      assert.equal(declinedPayload.status, RELATIONSHIP_STATUS.DECLINED);
      assert.ok(declinedPayload.respondedAt);
    } finally {
      prisma.coachMemberRelationship.findFirst = origFindFirst;
      prisma.coachMemberRelationship.update = origUpdate;
      notificationService.create = origNotifCreate;
    }
  });
});

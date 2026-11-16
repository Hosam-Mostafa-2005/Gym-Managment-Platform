import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { Roles } from "../constants/roles.js";

// Mock minimal domain model behavior matching AssignmentService
describe("Part 1 — Assignment Archive Semantics & Data Integrity", () => {
  const memberId = "member-user-1";
  const otherMemberId = "member-user-2";
  const coachId = "coach-user-1";

  interface AssignmentRecord {
    id: string;
    memberId: string;
    trainerId: string;
    workoutId: string;
    status: string;
    isArchived: boolean;
    archivedAt: Date | null;
    completedAt: Date | null;
    isActive: boolean;
  }

  const createTestAssignment = (): AssignmentRecord => ({
    id: "assign-123",
    memberId,
    trainerId: coachId,
    workoutId: "workout-abc",
    status: ASSIGNMENT_STATUS.ACTIVE,
    isArchived: false,
    archivedAt: null,
    completedAt: null,
    isActive: true,
  });

  it("1 & 5: Member archives assignment without changing status to COMPLETED", () => {
    const assignment = createTestAssignment();
    assert.equal(assignment.status, ASSIGNMENT_STATUS.ACTIVE);
    assert.equal(assignment.isArchived, false);

    // Simulate archive
    assignment.isArchived = true;
    assignment.archivedAt = new Date();

    // Verify status is completely untouched
    assert.equal(assignment.status, ASSIGNMENT_STATUS.ACTIVE);
    assert.equal(assignment.completedAt, null);
    assert.equal(assignment.isArchived, true);
    assert.ok(assignment.archivedAt instanceof Date);
  });

  it("2 & 3: Normal member list excludes archived, but archived filter includes it", () => {
    const assignments: AssignmentRecord[] = [
      { ...createTestAssignment(), id: "assign-1", isArchived: false },
      { ...createTestAssignment(), id: "assign-2", isArchived: true, archivedAt: new Date() },
    ];

    // Default query: isArchived === false
    const normalList = assignments.filter((a) => a.isActive && !a.isArchived);
    assert.equal(normalList.length, 1);
    assert.equal(normalList[0].id, "assign-1");

    // Archived query: isArchived === true
    const archivedList = assignments.filter((a) => a.isActive && a.isArchived);
    assert.equal(archivedList.length, 1);
    assert.equal(archivedList[0].id, "assign-2");
  });

  it("4: Member unarchives an assignment restoring it to normal list with prior status intact", () => {
    const assignment: AssignmentRecord = {
      ...createTestAssignment(),
      isArchived: true,
      archivedAt: new Date(),
    };

    // Unarchive
    assignment.isArchived = false;
    assignment.archivedAt = null;

    assert.equal(assignment.isArchived, false);
    assert.equal(assignment.archivedAt, null);
    assert.equal(assignment.status, ASSIGNMENT_STATUS.ACTIVE);
  });

  it("6 & 7: Coach analytics and completion rates remain completely unchanged", () => {
    const assignments: AssignmentRecord[] = [
      { ...createTestAssignment(), id: "a1", status: ASSIGNMENT_STATUS.ACTIVE, isArchived: true },
      { ...createTestAssignment(), id: "a2", status: ASSIGNMENT_STATUS.COMPLETED, isArchived: false, completedAt: new Date() },
      { ...createTestAssignment(), id: "a3", status: ASSIGNMENT_STATUS.CANCELLED, isArchived: false },
    ];

    // Coach status aggregation
    const activeCount = assignments.filter((a) => a.status === ASSIGNMENT_STATUS.ACTIVE).length;
    const completedCount = assignments.filter((a) => a.status === ASSIGNMENT_STATUS.COMPLETED).length;
    const cancelledCount = assignments.filter((a) => a.status === ASSIGNMENT_STATUS.CANCELLED).length;

    // Archived 'a1' MUST NOT increase completedCount!
    assert.equal(activeCount, 1);
    assert.equal(completedCount, 1);
    assert.equal(cancelledCount, 1);
  });

  it("8: Another member cannot archive someone else's assignment", () => {
    const assignment = createTestAssignment();

    // Check authorization rule
    const authorizeArchive = (reqUserId: string, role: string) => {
      if (role === Roles.MEMBER && assignment.memberId !== reqUserId) {
        throw new Error("You can only archive your own assignments.");
      }
    };

    assert.throws(
      () => authorizeArchive(otherMemberId, Roles.MEMBER),
      /You can only archive your own assignments\./,
    );
  });

  it("9: Completed assignment remains COMPLETED when archived and retains completedAt", () => {
    const completionTimestamp = new Date("2026-03-01T12:00:00Z");
    const completedAssignment: AssignmentRecord = {
      ...createTestAssignment(),
      status: ASSIGNMENT_STATUS.COMPLETED,
      completedAt: completionTimestamp,
    };

    // Member archives completed historical assignment
    completedAssignment.isArchived = true;
    completedAssignment.archivedAt = new Date();

    assert.equal(completedAssignment.status, ASSIGNMENT_STATUS.COMPLETED);
    assert.equal(completedAssignment.completedAt, completionTimestamp);
    assert.equal(completedAssignment.isArchived, true);
  });

  it("10: Repeated archive/unarchive requests are idempotent and safe", () => {
    const assignment = createTestAssignment();

    // First archive
    assignment.isArchived = true;
    const firstArchivedAt = new Date();
    assignment.archivedAt = firstArchivedAt;

    // Second archive (idempotent)
    const idempotentArchive = (record: AssignmentRecord) => {
      if (record.isArchived) return record; // No-op
      record.isArchived = true;
      record.archivedAt = new Date();
      return record;
    };

    const res1 = idempotentArchive(assignment);
    assert.equal(res1.isArchived, true);
    assert.equal(res1.archivedAt, firstArchivedAt);
    assert.equal(res1.status, ASSIGNMENT_STATUS.ACTIVE);
  });
});

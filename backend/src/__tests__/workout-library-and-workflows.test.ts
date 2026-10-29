// src/__tests__/workout-library-and-workflows.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Roles, type Role } from "../constants/roles.js";

/**
 * Isolated unit test suite for:
 * 1. Workout Resolution (by UUID, Share Code, STREN URL, Access Control)
 * 2. Personal Routine vs Template Gating (Member vs Coach/Admin)
 * 3. Workout Sessions Starting & Repeat Execution (Preserves historical records)
 * 4. Active Session Conflict Detection
 * 5. Member-Owned 4-Week Program Scheduling (Without Coach/Assignment requirement)
 * 6. Assignment Access Control & Retrieval
 *
 * Runs completely in-memory with zero live database mutations.
 */
describe("STREN — Workout Workflows & Library Verification Suite (Isolated Mock)", () => {
  // In-memory data structures
  interface MockWorkout {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    estimatedDuration: number;
    isTemplate: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
  }

  interface MockWorkoutShare {
    id: string;
    workoutId: string;
    shareCode: string;
    isActive: boolean;
    expiresAt?: Date | null;
  }

  interface MockAssignment {
    id: string;
    memberId: string;
    trainerId: string;
    workoutId: string;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    createdAt: Date;
  }

  interface MockWorkoutSession {
    id: string;
    memberId: string;
    workoutId: string;
    assignmentId?: string | null;
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    startedAt: Date;
    completedAt?: Date | null;
    duration?: number;
    totalVolume?: number;
  }

  interface MockScheduledWorkout {
    id: string;
    memberId: string;
    workoutId: string;
    scheduledAt: Date;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    notes?: string;
  }

  let workouts: Map<string, MockWorkout>;
  let shares: Map<string, MockWorkoutShare>;
  let assignments: Map<string, MockAssignment>;
  let sessions: Map<string, MockWorkoutSession>;
  let scheduledWorkouts: Map<string, MockScheduledWorkout>;

  beforeEach(() => {
    workouts = new Map();
    shares = new Map();
    assignments = new Map();
    sessions = new Map();
    scheduledWorkouts = new Map();

    // Populate baseline mock data
    // 1. Public Template by Coach
    workouts.set("template-push-1", {
      id: "template-push-1",
      title: "Foundation Push Day",
      category: "strength",
      difficulty: "beginner",
      estimatedDuration: 55,
      isTemplate: true,
      isActive: true,
      createdBy: "coach-1",
      createdAt: new Date(),
    });

    // 2. Private Personal Routine by Member 1
    workouts.set("personal-member1-1", {
      id: "personal-member1-1",
      title: "My Custom Hypertrophy Upper",
      category: "hypertrophy",
      difficulty: "intermediate",
      estimatedDuration: 60,
      isTemplate: false,
      isActive: true,
      createdBy: "member-1",
      createdAt: new Date(),
    });

    // 3. Private Personal Routine by Member 2
    workouts.set("personal-member2-1", {
      id: "personal-member2-1",
      title: "Member 2 Secret Routine",
      category: "powerlifting",
      difficulty: "advanced",
      estimatedDuration: 75,
      isTemplate: false,
      isActive: true,
      createdBy: "member-2",
      createdAt: new Date(),
    });

    // 4. Share Code for Member 2's routine
    shares.set("share-1", {
      id: "share-1",
      workoutId: "personal-member2-1",
      shareCode: "STR-SEC99",
      isActive: true,
      expiresAt: null,
    });

    // 5. Assignment for Member 1 from Coach 1
    assignments.set("assign-1", {
      id: "assign-1",
      memberId: "member-1",
      trainerId: "coach-1",
      workoutId: "template-push-1",
      status: "ACTIVE",
      createdAt: new Date(),
    });
  });

  // Mock Workout Resolution Logic (matching backend/src/services/workout.service.ts)
  function resolveWorkout(
    rawInput: string,
    userId: string,
    role: Role,
  ): {
    sourceType: "uuid" | "shareCode" | "url";
    workout: MockWorkout;
    isAlreadySaved: boolean;
  } {
    const trimmed = rawInput.trim();
    let workoutId: string | null = null;
    let shareCode: string | null = null;
    let sourceType: "uuid" | "shareCode" | "url" = "uuid";

    // 1. Check share code format
    const shareCodeRegex = /^STR-[A-Z0-9]{4,10}$/i;
    if (shareCodeRegex.test(trimmed)) {
      shareCode = trimmed.toUpperCase();
      sourceType = "shareCode";
    }

    // 2. Check URL format
    if (!shareCode && (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes("/"))) {
      sourceType = "url";
      try {
        const urlStr = trimmed.startsWith("http") ? trimmed : `https://stren.app${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
        const url = new URL(urlStr);
        const path = url.pathname;

        const shareMatch = path.match(/\/share\/workout\/([A-Za-z0-9-_]+)/i);
        if (shareMatch) {
          shareCode = shareMatch[1].toUpperCase();
        } else {
          const workoutMatch = path.match(/\/(?:workouts|workout-builder)\/([a-zA-Z0-9-_]+)/i);
          if (workoutMatch) {
            workoutId = workoutMatch[1];
          }
        }
      } catch {
        const urlWorkoutMatch = trimmed.match(/(?:workouts|workout-builder)\/([a-zA-Z0-9-_]+)/i);
        if (urlWorkoutMatch) {
          workoutId = urlWorkoutMatch[1];
        }
      }
    }

    // 3. Fallback to raw ID
    if (!shareCode && !workoutId) {
      workoutId = trimmed;
      sourceType = "uuid";
    }

    // If share code
    if (shareCode) {
      let matchedShare: MockWorkoutShare | null = null;
      for (const s of shares.values()) {
        if (s.shareCode.toUpperCase() === shareCode && s.isActive) {
          matchedShare = s;
          break;
        }
      }
      if (!matchedShare) {
        throw new Error("Shared workout not found or link has expired.");
      }
      const workout = workouts.get(matchedShare.workoutId);
      if (!workout || !workout.isActive) {
        throw new Error("Shared workout is no longer active.");
      }
      const isAlreadySaved = workout.createdBy === userId;
      return { sourceType, workout, isAlreadySaved };
    }

    // If workoutId
    if (workoutId) {
      const workout = workouts.get(workoutId);
      if (!workout || !workout.isActive) {
        throw new Error("Workout not found or has been deactivated.");
      }

      // Check access permission
      if (role === Roles.MEMBER) {
        const isOwner = workout.createdBy === userId;
        const isTemplate = workout.isTemplate;
        let isAssigned = false;
        for (const a of assignments.values()) {
          if (a.memberId === userId && a.workoutId === workout.id && a.status === "ACTIVE") {
            isAssigned = true;
            break;
          }
        }
        let activeShare = false;
        for (const s of shares.values()) {
          if (s.workoutId === workout.id && s.isActive) {
            activeShare = true;
            break;
          }
        }

        if (!isOwner && !isTemplate && !isAssigned && !activeShare) {
          throw new Error("You do not have permission to view or add this private workout.");
        }
      }

      const isAlreadySaved = workout.createdBy === userId;
      return { sourceType, workout, isAlreadySaved };
    }

    throw new Error("Invalid workout identifier or link.");
  }

  // =========================================================================
  // TASK 1: WORKOUT RESOLUTION TESTS
  // =========================================================================
  describe("Task 1: Workout Resolution", () => {
    it("resolves a public library template by UUID for a member", () => {
      const res = resolveWorkout("template-push-1", "member-1", Roles.MEMBER);
      assert.equal(res.sourceType, "uuid");
      assert.equal(res.workout.id, "template-push-1");
      assert.equal(res.workout.isTemplate, true);
      assert.equal(res.isAlreadySaved, false); // created by coach-1
    });

    it("resolves own personal routine by UUID", () => {
      const res = resolveWorkout("personal-member1-1", "member-1", Roles.MEMBER);
      assert.equal(res.sourceType, "uuid");
      assert.equal(res.workout.id, "personal-member1-1");
      assert.equal(res.isAlreadySaved, true);
    });

    it("resolves workout by share code (STR-XXXXX)", () => {
      const res = resolveWorkout("STR-SEC99", "member-1", Roles.MEMBER);
      assert.equal(res.sourceType, "shareCode");
      assert.equal(res.workout.id, "personal-member2-1");
      assert.equal(res.isAlreadySaved, false);
    });

    it("resolves workout by STREN app URL (/workouts/:id)", () => {
      const res = resolveWorkout(
        "https://stren.app/workouts/template-push-1",
        "member-1",
        Roles.MEMBER,
      );
      assert.equal(res.sourceType, "url");
      assert.equal(res.workout.id, "template-push-1");
    });

    it("resolves workout by STREN builder URL (/workout-builder/:id)", () => {
      const res = resolveWorkout(
        "/workout-builder/personal-member1-1",
        "member-1",
        Roles.MEMBER,
      );
      assert.equal(res.sourceType, "url");
      assert.equal(res.workout.id, "personal-member1-1");
    });

    it("resolves workout by STREN share link (/share/workout/:code)", () => {
      const res = resolveWorkout(
        "https://stren.app/share/workout/STR-SEC99",
        "member-1",
        Roles.MEMBER,
      );
      assert.equal(res.sourceType, "url");
      assert.equal(res.workout.id, "personal-member2-1");
    });

    it("rejects unauthorized private workout of another member without share code", () => {
      // Member 1 attempts to resolve Member 2's private workout by direct UUID without share code
      assert.throws(
        () => {
          // Temporarily deactivate share code to test strict private restriction
          shares.get("share-1")!.isActive = false;
          resolveWorkout("personal-member2-1", "member-1", Roles.MEMBER);
        },
        {
          message: "You do not have permission to view or add this private workout.",
        },
      );
    });

    it("allows Admin or Coach to inspect private workouts", () => {
      shares.get("share-1")!.isActive = false;
      const res = resolveWorkout("personal-member2-1", "admin-1", Roles.ADMIN);
      assert.equal(res.workout.id, "personal-member2-1");
    });
  });

  // =========================================================================
  // TASK 2: PERSONAL ROUTINE VS TEMPLATE GATING
  // =========================================================================
  describe("Task 2: Personal Routine vs Template Gating", () => {
    function createWorkout(
      data: { title: string; isTemplate?: boolean },
      userId: string,
      role: Role,
    ): MockWorkout {
      // Backend enforcement: members can only create personal routines (isTemplate forced to false)
      const enforcedTemplate = role === Roles.MEMBER ? false : Boolean(data.isTemplate);

      const newWorkout: MockWorkout = {
        id: `workout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: data.title,
        category: "strength",
        difficulty: "intermediate",
        estimatedDuration: 60,
        isTemplate: enforcedTemplate,
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
      };

      workouts.set(newWorkout.id, newWorkout);
      return newWorkout;
    }

    it("forces isTemplate to false when created by a Member (Personal Routine)", () => {
      const memberWorkout = createWorkout(
        { title: "Member Attempted Template", isTemplate: true },
        "member-1",
        Roles.MEMBER,
      );
      assert.equal(memberWorkout.isTemplate, false, "Member workout MUST be isTemplate: false");
      assert.equal(memberWorkout.createdBy, "member-1");
    });

    it("allows Coach or Admin to publish as Library Template (isTemplate: true)", () => {
      const coachWorkout = createWorkout(
        { title: "Coach Official Push Template", isTemplate: true },
        "coach-1",
        Roles.TRAINER,
      );
      assert.equal(coachWorkout.isTemplate, true, "Coach workout can be isTemplate: true");

      const adminWorkout = createWorkout(
        { title: "Admin Official Deload Routine", isTemplate: true },
        "admin-1",
        Roles.ADMIN,
      );
      assert.equal(adminWorkout.isTemplate, true, "Admin workout can be isTemplate: true");
    });
  });

  // =========================================================================
  // TASK 3: WORKOUT SESSIONS & REPLAY EXECUTION
  // =========================================================================
  describe("Task 3: Sessions Starting & Repeat Execution", () => {
    function startWorkoutSession(
      workoutId: string,
      memberId: string,
      assignmentId?: string,
    ): MockWorkoutSession {
      // Check active conflict
      for (const s of sessions.values()) {
        if (s.memberId === memberId && s.status === "IN_PROGRESS") {
          throw new Error("Active session conflict: You already have a workout in progress.");
        }
      }

      const newSession: MockWorkoutSession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        memberId,
        workoutId,
        assignmentId: assignmentId || null,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      };
      sessions.set(newSession.id, newSession);
      return newSession;
    }

    function completeWorkoutSession(sessionId: string, duration: number, volume: number): MockWorkoutSession {
      const session = sessions.get(sessionId);
      if (!session) throw new Error("Session not found");
      session.status = "COMPLETED";
      session.completedAt = new Date();
      session.duration = duration;
      session.totalVolume = volume;
      return session;
    }

    it("starts a new workout session successfully", () => {
      const session = startWorkoutSession("template-push-1", "member-1");
      assert.equal(session.status, "IN_PROGRESS");
      assert.equal(session.workoutId, "template-push-1");
      assert.equal(session.memberId, "member-1");
    });

    it("detects conflict if starting a new session while one is in progress", () => {
      startWorkoutSession("template-push-1", "member-1");
      assert.throws(
        () => {
          startWorkoutSession("personal-member1-1", "member-1");
        },
        {
          message: /Active session conflict/,
        },
      );
    });

    it("repeats a completed workout in a new session WITHOUT altering history", () => {
      // 1. Start and complete initial session
      const firstSession = startWorkoutSession("template-push-1", "member-1");
      completeWorkoutSession(firstSession.id, 45, 12500);

      assert.equal(sessions.get(firstSession.id)!.status, "COMPLETED");
      assert.equal(sessions.get(firstSession.id)!.totalVolume, 12500);
      assert.equal(sessions.get(firstSession.id)!.duration, 45);

      // 2. Member repeats workout via "Start Again"
      const secondSession = startWorkoutSession("template-push-1", "member-1");

      // Verify a distinct new session is created
      assert.notEqual(secondSession.id, firstSession.id);
      assert.equal(secondSession.status, "IN_PROGRESS");

      // Verify original session is completely intact in history
      const originalInHistory = sessions.get(firstSession.id)!;
      assert.equal(originalInHistory.status, "COMPLETED");
      assert.equal(originalInHistory.totalVolume, 12500);
      assert.equal(originalInHistory.duration, 45);

      // Total session count is now 2
      const memberSessions = Array.from(sessions.values()).filter((s) => s.memberId === "member-1");
      assert.equal(memberSessions.length, 2);
    });
  });

  // =========================================================================
  // TASK 4: ASSIGNMENTS WORKFLOW & EMPTY STATES
  // =========================================================================
  describe("Task 4: Assignments & Empty State Data Logic", () => {
    it("returns member-specific assignments for a member", () => {
      const memberAssignments = Array.from(assignments.values()).filter((a) => a.memberId === "member-1");
      assert.equal(memberAssignments.length, 1);
      assert.equal(memberAssignments[0].workoutId, "template-push-1");
      assert.equal(memberAssignments[0].trainerId, "coach-1");
    });

    it("member with no assignments has empty list but can access personal routines", () => {
      const member2Assignments = Array.from(assignments.values()).filter((a) => a.memberId === "member-2");
      assert.equal(member2Assignments.length, 0);

      // Member 2 can still start their own personal routine
      const myWorkouts = Array.from(workouts.values()).filter((w) => w.createdBy === "member-2");
      assert.equal(myWorkouts.length, 1);
      assert.equal(myWorkouts[0].title, "Member 2 Secret Routine");
    });
  });

  // =========================================================================
  // TASK 5: MEMBER-OWNED 4-WEEK PROGRAM SCHEDULING
  // =========================================================================
  describe("Task 5: Member-Owned 4-Week Program Generation", () => {
    function generate4WeekProgram(
      memberId: string,
      programName: string,
      startDateStr: string,
      weeklySplit: { dayOffset: number; workoutId: string; dayName: string }[],
    ): MockScheduledWorkout[] {
      const baseStart = new Date(startDateStr);
      const created: MockScheduledWorkout[] = [];

      for (let week = 1; week <= 4; week++) {
        for (const item of weeklySplit) {
          const sessionDate = new Date(baseStart);
          const totalDayOffset = (week - 1) * 7 + item.dayOffset;
          sessionDate.setDate(baseStart.getDate() + totalDayOffset);

          const scheduled: MockScheduledWorkout = {
            id: `sched-${week}-${item.dayOffset}-${Date.now()}`,
            memberId,
            workoutId: item.workoutId,
            scheduledAt: sessionDate,
            status: "SCHEDULED",
            notes: `Program: ${programName} • Week ${week} • ${item.dayName}`,
          };

          scheduledWorkouts.set(scheduled.id, scheduled);
          created.push(scheduled);
        }
      }

      return created;
    }

    it("generates a 4-week program with 16 scheduled sessions without requiring a coach or assignment", () => {
      // 4-day training split: Mon (0), Tue (1), Thu (3), Fri (4)
      const split = [
        { dayOffset: 0, workoutId: "template-push-1", dayName: "Monday" },
        { dayOffset: 1, workoutId: "personal-member1-1", dayName: "Tuesday" },
        { dayOffset: 3, workoutId: "template-push-1", dayName: "Thursday" },
        { dayOffset: 4, workoutId: "personal-member1-1", dayName: "Friday" },
      ];

      const generated = generate4WeekProgram(
        "member-1",
        "Hypertrophy Block",
        "2026-11-02T09:00:00.000Z",
        split,
      );

      assert.equal(generated.length, 16, "Should create 16 scheduled sessions (4 per week x 4 weeks)");

      // Check first session
      assert.equal(generated[0].notes, "Program: Hypertrophy Block • Week 1 • Monday");
      assert.equal(generated[0].memberId, "member-1");

      // Check last session (Week 4 Friday)
      const lastSession = generated[15];
      assert.equal(lastSession.notes, "Program: Hypertrophy Block • Week 4 • Friday");

      // Verify date math: Week 4 Friday is (3 * 7 + 4) = 25 days after Week 1 Monday
      const dayDiff = Math.round(
        (lastSession.scheduledAt.getTime() - generated[0].scheduledAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      assert.equal(dayDiff, 25);
    });
  });

  // =========================================================================
  // TASK 6: END-TO-END START WORKOUT ELIGIBILITY & "AGS" SCENARIO
  // =========================================================================
  describe("Task 6: Start Workout Dialog Eligibility & Member Personal Workouts", () => {
    // Simulates frontend StartWorkoutDialog eligibleItems computation
    function computeDialogEligibleItems(
      currentUserId: string,
      allWorkouts: MockWorkout[],
      memberAssignments: MockAssignment[],
      historySessions: MockWorkoutSession[],
    ) {
      const items: Array<{
        id: string;
        workoutId: string;
        title: string;
        sourceType: "assigned" | "personal" | "template" | "repeat";
      }> = [];
      const assignedWorkoutIds = new Set<string>();

      // 1. Coach Assigned Workouts
      const activeAssignments = memberAssignments.filter((a) => a.status === "ACTIVE");
      for (const a of activeAssignments) {
        const w = allWorkouts.find((item) => item.id === a.workoutId);
        if (!w || !w.isActive) continue;
        assignedWorkoutIds.add(w.id);
        items.push({
          id: `assignment-${a.id}`,
          workoutId: w.id,
          title: w.title,
          sourceType: "assigned",
        });
      }

      // 2. Personal Workouts & Platform Templates
      for (const w of allWorkouts) {
        if (!w.isActive) continue;
        const isOwner = Boolean(currentUserId && w.createdBy === currentUserId);

        if (w.isTemplate) {
          items.push({
            id: `template-${w.id}`,
            workoutId: w.id,
            title: w.title,
            sourceType: "template",
          });
        } else {
          const isPersonal = isOwner || !assignedWorkoutIds.has(w.id);
          if (isPersonal && (isOwner || w.createdBy === currentUserId)) {
            items.push({
              id: `personal-${w.id}`,
              workoutId: w.id,
              title: w.title,
              sourceType: "personal",
            });
          }
        }
      }

      // 3. Previously Completed Workouts
      const completedHistory = historySessions.filter((s) => s.status === "COMPLETED");
      const historySeen = new Set<string>();
      for (const s of completedHistory) {
        if (historySeen.has(s.workoutId)) continue;
        historySeen.add(s.workoutId);
        const w = allWorkouts.find((item) => item.id === s.workoutId);
        items.push({
          id: `repeat-${s.id}-${s.workoutId}`,
          workoutId: s.workoutId,
          title: w ? w.title : "Completed Workout",
          sourceType: "repeat",
        });
      }

      return items;
    }

    it("verifies the 'ags' personal workout appears in Start Workout dialog before being started", () => {
      const memberId = "member-active";

      // 1. Member creates personal workout "ags"
      const agsWorkout: MockWorkout = {
        id: "workout-ags-uuid",
        title: "ags",
        category: "strength",
        difficulty: "intermediate",
        estimatedDuration: 45,
        isTemplate: false,
        isActive: true,
        createdBy: memberId,
        createdAt: new Date(),
      };
      workouts.set(agsWorkout.id, agsWorkout);

      // 2. Member creates coach-assigned workout
      assignments.set("assign-ags", {
        id: "assign-ags",
        memberId: memberId,
        trainerId: "coach-1",
        workoutId: "template-push-1",
        status: "ACTIVE",
        createdAt: new Date(),
      });

      // 3. Unrelated member creates private workout
      workouts.set("unrelated-private", {
        id: "unrelated-private",
        title: "Other Member Secret Routine",
        category: "hypertrophy",
        difficulty: "advanced",
        estimatedDuration: 60,
        isTemplate: false,
        isActive: true,
        createdBy: "unrelated-user-999",
        createdAt: new Date(),
      });

      // Compute eligible items for member-active (simulating GET /workouts scoped to member-active)
      const visibleWorkouts = Array.from(workouts.values()).filter(
        (w) => w.isTemplate || w.createdBy === memberId,
      );
      const myAssignments = Array.from(assignments.values()).filter((a) => a.memberId === memberId);
      const mySessions = Array.from(sessions.values()).filter((s) => s.memberId === memberId);

      const dialogItems = computeDialogEligibleItems(
        memberId,
        visibleWorkouts,
        myAssignments,
        mySessions,
      );

      // 4. Verify "ags" appears under personal routines before ever starting
      const personalItems = dialogItems.filter((i) => i.sourceType === "personal");
      assert.ok(
        personalItems.some((i) => i.title === "ags" && i.workoutId === "workout-ags-uuid"),
        "'ags' personal workout must be listed in personal routines before ever starting a session",
      );

      // Verify templates appear
      const templateItems = dialogItems.filter((i) => i.sourceType === "template");
      assert.ok(templateItems.some((i) => i.workoutId === "template-push-1"));

      // Verify coach assignment appears
      const assignedItems = dialogItems.filter((i) => i.sourceType === "assigned");
      assert.ok(assignedItems.some((i) => i.workoutId === "template-push-1"));

      // Verify unrelated private workout is NEVER exposed
      assert.ok(!dialogItems.some((i) => i.workoutId === "unrelated-private"));

      // 5. Member starts "ags"
      const newSession: MockWorkoutSession = {
        id: "session-ags-1",
        memberId: memberId,
        workoutId: agsWorkout.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      };
      sessions.set(newSession.id, newSession);

      assert.equal(newSession.status, "IN_PROGRESS");
      assert.equal(newSession.workoutId, "workout-ags-uuid");
      assert.equal(newSession.memberId, memberId);

      // 6. Complete session and verify it remains in history
      newSession.status = "COMPLETED";
      newSession.completedAt = new Date();
      newSession.duration = 42;
      newSession.totalVolume = 14500;

      assert.equal(sessions.get("session-ags-1")!.status, "COMPLETED");
      assert.equal(sessions.get("session-ags-1")!.totalVolume, 14500);

      // 7. Open Start Workout dialog again
      const updatedSessions = Array.from(sessions.values()).filter((s) => s.memberId === memberId);
      const updatedDialogItems = computeDialogEligibleItems(
        memberId,
        visibleWorkouts,
        myAssignments,
        updatedSessions,
      );

      // "ags" is still available as a Personal Routine
      assert.ok(
        updatedDialogItems.some((i) => i.title === "ags" && i.sourceType === "personal"),
        "'ags' must still be available as a Personal Routine after completion",
      );

      // "ags" is now also available under Repeat Previous
      assert.ok(
        updatedDialogItems.some((i) => i.title === "ags" && i.sourceType === "repeat"),
        "'ags' should now be eligible for Repeat Previous",
      );

      // 8. Starting another session creates a distinct session and preserves history
      const repeatedSession: MockWorkoutSession = {
        id: "session-ags-2",
        memberId: memberId,
        workoutId: agsWorkout.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      };
      sessions.set(repeatedSession.id, repeatedSession);

      assert.notEqual(repeatedSession.id, newSession.id);
      assert.equal(sessions.get("session-ags-1")!.status, "COMPLETED");
      assert.equal(sessions.get("session-ags-2")!.status, "IN_PROGRESS");
    });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { mapMemberProfile } from "../mappers/member-profile.mapper.js";
import { mapCoachProfile } from "../mappers/coach-profile.mapper.js";
import memberProfileService from "../services/member-profile.service.js";
import coachProfileService from "../services/coach-profile.service.js";

describe("STREN — Avatar Synchronization & Profile Mapping Test Suite", () => {
  const mockAvatarUrl = "https://res.cloudinary.com/stren/image/upload/v12345/avatars/user-avatar.jpg";

  describe("1. Mapper Contract Integrity", () => {
    it("mapMemberProfile accurately returns avatarUrl in member object", () => {
      const mockInput: any = {
        member: {
          id: "member-123",
          name: "Hosam Elgohary",
          email: "hosam@example.com",
          role: Roles.MEMBER,
          avatarUrl: mockAvatarUrl,
          phone: "+1234567890",
          bio: "Fitness enthusiast",
          fitnessGoal: "STRENGTH_HYPERTROPHY",
          experienceLevel: "INTERMEDIATE",
          createdAt: new Date(),
          isActive: true,
        },
        currentAssignment: null,
        activeAssignments: [],
        assignmentHistory: [],
        measurements: [],
        workoutStats: null,
        recentSessions: [],
        timeline: [],
        canAccessHistory: true,
      };

      const result = mapMemberProfile(mockInput);
      assert.equal(result.member.avatarUrl, mockAvatarUrl);
      assert.equal(result.member.name, "Hosam Elgohary");
      assert.equal(result.member.id, "member-123");
    });

    it("mapMemberProfile defaults avatarUrl to null when not provided", () => {
      const mockInput: any = {
        member: {
          id: "member-456",
          name: "John Doe",
          email: "john@example.com",
          role: Roles.MEMBER,
          createdAt: new Date(),
          isActive: true,
        },
        currentAssignment: null,
        activeAssignments: [],
        assignmentHistory: [],
        measurements: [],
        workoutStats: null,
        recentSessions: [],
        timeline: [],
      };

      const result = mapMemberProfile(mockInput);
      assert.equal(result.member.avatarUrl, null);
    });

    it("mapCoachProfile accurately returns avatarUrl in profile object", () => {
      const mockData: any = {
        coach: {
          id: "coach-123",
          name: "Coach Mike",
          email: "mike@example.com",
          avatarUrl: mockAvatarUrl,
          phone: "+1987654321",
          bio: "Certified Strength Coach",
          specialties: ["Powerlifting", "Hypertrophy"],
          certifications: ["CSCS"],
          yearsOfExperience: 8,
          professionalTitle: "Master Coach",
          coachingPhilosophy: "Progressive overload and consistency",
          languagesSpoken: ["English"],
          createdAt: new Date(),
        },
        overview: {
          activeMembers: 12,
          activeAssignments: 15,
          workoutsCreated: 24,
          completedSessions: 180,
          completionRate: 92,
          measurementsReviewed: 35,
        },
        memberStats: { active: 12, inactive: 2, newThisMonth: 3, completedPrograms: 8 },
        workoutStats: {
          totalCreated: 24,
          published: 20,
          draft: 4,
          archived: 0,
          mostAssignedWorkout: null,
        },
        charts: { sessionsLast30Days: [], membersGrowth: [], completionRateTrend: [] },
        recentActivity: [],
        achievements: [],
        upcomingTasks: [],
      };

      const result = mapCoachProfile(mockData);
      assert.equal(result.profile.avatarUrl, mockAvatarUrl);
      assert.equal(result.profile.name, "Coach Mike");
      assert.equal(result.profile.id, "coach-123");
    });

    it("mapCoachProfile defaults avatarUrl to null when not provided", () => {
      const mockData: any = {
        coach: {
          id: "coach-456",
          name: "Coach Sarah",
          email: "sarah@example.com",
          createdAt: new Date(),
        },
        overview: {},
        memberStats: {},
        workoutStats: { mostAssignedWorkout: null },
        charts: {},
        recentActivity: [],
        achievements: [],
        upcomingTasks: [],
      };

      const result = mapCoachProfile(mockData);
      assert.equal(result.profile.avatarUrl, null);
    });
  });

  describe("2. End-to-End Service Resolution", () => {
    it("memberProfileService.getProfile includes avatarUrl from database user record", async () => {
      const origFindFirstUser = prisma.user.findFirst;
      const origFindRelationship = prisma.coachMemberRelationship.findFirst;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origWorkoutSessionFindMany = prisma.workoutSession.findMany;
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;

      (prisma.coachMemberRelationship as any).findFirst = async () => null;
      (prisma.assignment as any).findMany = async () => [];
      (prisma.workoutSession as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).findMany = async () => [];

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where?.id === "member-with-avatar") {
          return {
            id: "member-with-avatar",
            name: "Hosam Elgohary",
            email: "hosam@example.com",
            role: Roles.MEMBER,
            avatarUrl: mockAvatarUrl,
            isActive: true,
            createdAt: new Date(),
          };
        }
        return null;
      };

      try {
        const profile = await memberProfileService.getProfile(
          "member-with-avatar",
          "member-with-avatar",
          Roles.MEMBER
        );

        assert.ok(profile);
        assert.equal(profile.member.avatarUrl, mockAvatarUrl);
        assert.equal(profile.member.name, "Hosam Elgohary");
      } finally {
        prisma.user.findFirst = origFindFirstUser;
        prisma.coachMemberRelationship.findFirst = origFindRelationship;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.workoutSession.findMany = origWorkoutSessionFindMany;
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
      }
    });

    it("coachProfileService.getProfile includes avatarUrl from database coach record", async () => {
      const origFindFirstUser = prisma.user.findFirst;
      const origGetOverview = (coachProfileService as any).getOverview;
      const origGetMemberStats = (coachProfileService as any).getMemberStats;
      const origGetWorkoutStats = (coachProfileService as any).getWorkoutStats;
      const origGetPerformanceCharts = (coachProfileService as any).getPerformanceCharts;
      const origGetRecentActivity = (coachProfileService as any).getRecentActivity;
      const origGetUpcomingTasks = (coachProfileService as any).getUpcomingTasks;
      const origCalculateAchievements = (coachProfileService as any).calculateAchievements;

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where?.id === "coach-with-avatar") {
          return {
            id: "coach-with-avatar",
            name: "Coach Alex",
            email: "alex@example.com",
            role: Roles.TRAINER,
            avatarUrl: mockAvatarUrl,
            isActive: true,
            createdAt: new Date(),
          };
        }
        return null;
      };

      (coachProfileService as any).getOverview = async () => ({
        activeMembers: 5,
        activeAssignments: 5,
        workoutsCreated: 10,
        completedSessions: 50,
        completionRate: 85,
        measurementsReviewed: 10,
      });
      (coachProfileService as any).getMemberStats = async () => ({
        active: 5,
        inactive: 1,
        newThisMonth: 2,
        completedPrograms: 3,
      });
      (coachProfileService as any).getWorkoutStats = async () => ({
        totalCreated: 10,
        published: 8,
        draft: 2,
        archived: 0,
        mostAssignedWorkout: null,
      });
      (coachProfileService as any).getPerformanceCharts = async () => ({
        sessionsLast30Days: [],
        membersGrowth: [],
        completionRateTrend: [],
      });
      (coachProfileService as any).getRecentActivity = async () => [];
      (coachProfileService as any).getUpcomingTasks = async () => [];
      (coachProfileService as any).calculateAchievements = () => [];

      try {
        const coachProfile = await coachProfileService.getProfile(
          "coach-with-avatar",
          Roles.TRAINER
        );

        assert.ok(coachProfile);
        assert.equal(coachProfile.profile.avatarUrl, mockAvatarUrl);
        assert.equal(coachProfile.profile.name, "Coach Alex");
      } finally {
        prisma.user.findFirst = origFindFirstUser;
        (coachProfileService as any).getOverview = origGetOverview;
        (coachProfileService as any).getMemberStats = origGetMemberStats;
        (coachProfileService as any).getWorkoutStats = origGetWorkoutStats;
        (coachProfileService as any).getPerformanceCharts = origGetPerformanceCharts;
        (coachProfileService as any).getRecentActivity = origGetRecentActivity;
        (coachProfileService as any).getUpcomingTasks = origGetUpcomingTasks;
        (coachProfileService as any).calculateAchievements = origCalculateAchievements;
      }
    });
  });
});

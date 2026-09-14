// src/services/members-management.service.ts
import mongoose from "mongoose";
import type { ParsedQs } from "qs";
import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { MEMBER_SORT } from "../constants/member.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import { mapMemberManagementCard } from "../mappers/members-management.mapper.js";

class MembersManagementService {
  async getAllMembers(query: ParsedQs, userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const pipeline: any[] = [];
    const search = typeof query.search === "string" ? query.search.trim() : "";
    // ==========================================
    // 1. Initial User Match (Only Members)
    // ==========================================
    const userMatch: any = { role: Roles.MEMBER, isActive: true };

    if (search) {
      userMatch.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    pipeline.push({ $match: userMatch });

    // ==========================================
    // 2. Role-Based Scoping
    // ==========================================
    if (role === Roles.TRAINER) {
      // Trainers can ONLY see members currently assigned to them
      pipeline.push({
        $lookup: {
          from: "assignments",
          localField: "_id",
          foreignField: "member",
          as: "_authAssignments",
        },
      });
      pipeline.push({
        $match: {
          _authAssignments: {
            $elemMatch: {
              trainer: new mongoose.Types.ObjectId(userId),
              status: ASSIGNMENT_STATUS.ACTIVE,
              isActive: true,
            },
          },
        },
      });
    }

    // ==========================================
    // 3. Fetch Current / Latest Assignment
    // ==========================================
    // We sort by status so "ACTIVE" comes before "CANCELLED" or "COMPLETED" alphabetically
    pipeline.push({
      $lookup: {
        from: "assignments",
        let: { mId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$member", "$$mId"] }, isActive: true } },
          {
            $addFields: {
              priority: {
                $cond: [{ $eq: ["$status", ASSIGNMENT_STATUS.ACTIVE] }, 1, 0],
              },
            },
          },
          {
            $sort: {
              priority: -1,
              createdAt: -1,
            },
          },
          {
            $project: {
              priority: 0,
              status: 1,
              trainer: 1,
              workout: 1,
            },
          },
          { $project: { status: 1, trainer: 1, workout: 1 } },
        ],
        as: "allAssignments",
      },
    });

    pipeline.push({
      $addFields: {
        currentAssignment: { $arrayElemAt: ["$allAssignments", 0] },
      },
    });

    // ==========================================
    // 4. Apply Dynamic Assignment Filters
    // ==========================================
    const postAssignmentMatch: any = {};

    if (query.status) {
      postAssignmentMatch["currentAssignment.status"] = query.status;
    }

    if (role === Roles.ADMIN && query.trainer) {
      postAssignmentMatch["currentAssignment.trainer"] =
        new mongoose.Types.ObjectId(query.trainer as string);
    }

    if (query.workout) {
      postAssignmentMatch["currentAssignment.workout"] =
        new mongoose.Types.ObjectId(query.workout as string);
    }

    if (Object.keys(postAssignmentMatch).length > 0) {
      pipeline.push({ $match: postAssignmentMatch });
    }

    // ==========================================
    // 5. Populate References (Trainer & Workout)
    // ==========================================
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "currentAssignment.trainer",
        foreignField: "_id",
        as: "trainerDoc",
      },
    });

    pipeline.push({
      $lookup: {
        from: "workouts",
        localField: "currentAssignment.workout",
        foreignField: "_id",
        as: "workoutDoc",
      },
    });

    pipeline.push({
      $addFields: {
        trainer: {
          $arrayElemAt: ["$trainerDoc", 0],
        },
        workout: {
          $arrayElemAt: ["$workoutDoc", 0],
        },
      },
    });

    // ==========================================
    // 6. Aggregate Latest Body Measurement
    // ==========================================
    pipeline.push({
      $lookup: {
        from: "bodymeasurements",
        let: { mId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$member", "$$mId"] }, isActive: true } },
          { $sort: { measuredAt: -1 } },
          { $limit: 1 },
          { $project: { weight: 1 } },
        ],
        as: "latestMeasurement",
      },
    });

    // ==========================================
    // 7. Aggregate Workout Session Stats
    // ==========================================
    pipeline.push({
      $lookup: {
        from: "workoutsessions",
        let: { mId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$member", "$$mId"] }, isActive: true } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                    1,
                    0,
                  ],
                },
              },
              lastWorkout: { $max: "$startedAt" },
            },
          },
        ],
        as: "sessionStats",
      },
    });

    // ==========================================
    // 8. Map Aggregated Fields for Sorting
    // ==========================================
    pipeline.push({
      $addFields: {
        latestWeight: { $arrayElemAt: ["$latestMeasurement.weight", 0] },
        lastWorkoutDate: { $arrayElemAt: ["$sessionStats.lastWorkout", 0] },
        totalSessions: {
          $ifNull: [{ $arrayElemAt: ["$sessionStats.total", 0] }, 0],
        },
        completedSessions: {
          $ifNull: [{ $arrayElemAt: ["$sessionStats.completed", 0] }, 0],
        },
      },
    });

    pipeline.push({
      $addFields: {
        completionRate: {
          $round: [
            {
              $cond: [
                { $gt: ["$totalSessions", 0] },
                {
                  $multiply: [
                    {
                      $divide: ["$completedSessions", "$totalSessions"],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
            0,
          ],
        },
      },
    });

    // ==========================================
    // 9. Sorting
    // ==========================================
    let sortStage: any = { createdAt: -1 }; // Default: Newest

    switch (query.sort) {
      case MEMBER_SORT.OLDEST:
        sortStage = { createdAt: 1 };
        break;

      case MEMBER_SORT.NAME:
        sortStage = { name: 1 };
        break;

      case MEMBER_SORT.LATEST_WORKOUT:
        sortStage = { lastWorkoutDate: -1 };
        break;

      case MEMBER_SORT.LATEST_WEIGHT:
        sortStage = { latestWeight: -1 };
        break;

      case MEMBER_SORT.COMPLETION_RATE:
        sortStage = { completionRate: -1 };
        break;

      default:
        sortStage = { createdAt: -1 };
    }

    pipeline.push({ $sort: sortStage });

    // ==========================================
    // 10. Pagination using $facet
    // ==========================================
    const page = Math.max(parseInt(query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(query.limit as string) || 10, 1),
      50,
    );
    const skip = (page - 1) * limit;

    pipeline.push({
      $project: {
        password: 0,
        __v: 0,
        allAssignments: 0,
        _authAssignments: 0,
        latestMeasurement: 0,
        sessionStats: 0,
        trainerDoc: 0,
        workoutDoc: 0,
      },
    });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    // ==========================================
    // 11. Execute & Format Response
    // ==========================================
    const result = await User.aggregate(pipeline).allowDiskUse(true);

    const data = result[0].data || [];
    const totalResults = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalResults / limit);

    return {
      members: data.map(mapMemberManagementCard),
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    };
  }
}

export default new MembersManagementService();

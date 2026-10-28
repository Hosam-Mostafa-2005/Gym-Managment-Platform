import type { ParsedQs } from "qs";
import prisma from "../config/prisma.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import mapUser from "../mappers/user.mapper.js";
import { Roles, type Role } from "../constants/roles.js";
import coachAccessService from "./coach-access.service.js";
import storageService from "./storage.service.js";
import AppError from "../utils/AppError.js";
import type { ValidatedImageInfo } from "../utils/imageValidator.js";

class UserService {
  async updateAvatar(
    userId: string,
    buffer: Buffer,
    imageInfo: ValidatedImageInfo,
    requestBaseUrl?: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Clean up old managed avatar if exists
    if (user.avatarUrl) {
      storageService.deleteManagedAsset(user.avatarUrl).catch(() => {});
    }

    const uploaded = await storageService.uploadAvatarImage(
      buffer,
      imageInfo,
      userId,
      requestBaseUrl,
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: uploaded.imageUrl,
        avatarKey: uploaded.storageKey,
      },
    });

    return mapUser(updatedUser);
  }

  async deleteAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (user.avatarUrl) {
      await storageService.deleteManagedAsset(user.avatarUrl).catch(() => {});
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null,
        avatarKey: null,
      },
    });

    return mapUser(updatedUser);
  }

  async getAll(query: ParsedQs, userId?: string, role?: Role) {
    const effectiveQuery = { ...query };
    if (!effectiveQuery.limit) {
      effectiveQuery.limit = "500";
    }
    if (typeof effectiveQuery.role === "string") {
      effectiveQuery.role = effectiveQuery.role.toLowerCase();
    }

    // Base scoping condition
    let baseWhere: any = { isActive: true };

    if (role === Roles.TRAINER && userId) {
      // Coaches can ONLY view members they are authorized to manage
      const managedMemberIds = await coachAccessService.getManagedMemberIds(userId);
      baseWhere = {
        isActive: true,
        role: Roles.MEMBER,
        id: { in: managedMemberIds },
      };
    }

    const features = new ApiFeatures(baseWhere, effectiveQuery)
      .filter(["role"])
      .search(["name", "email"])
      .sort()
      .paginate();

    const users = await prisma.user.findMany({
      where: features.prismaWhere,
      orderBy: features.prismaOrderBy,
      skip: features.prismaSkip,
      take: Math.min(features.prismaTake, 1000),
    });

    return users.map(mapUser);
  }
}

export default new UserService();

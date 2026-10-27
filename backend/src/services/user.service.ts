import type { ParsedQs } from "qs";
import prisma from "../config/prisma.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import mapUser from "../mappers/user.mapper.js";
import { Roles, type Role } from "../constants/roles.js";
import coachAccessService from "./coach-access.service.js";

class UserService {
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

import type { ParsedQs } from "qs";
import prisma from "../config/prisma.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import mapUser from "../mappers/user.mapper.js";

class UserService {
  async getAll(query: ParsedQs) {
    const effectiveQuery = { ...query };
    if (!effectiveQuery.limit) {
      effectiveQuery.limit = "500";
    }
    if (typeof effectiveQuery.role === "string") {
      effectiveQuery.role = effectiveQuery.role.toLowerCase();
    }

    const features = new ApiFeatures({ isActive: true }, effectiveQuery)
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

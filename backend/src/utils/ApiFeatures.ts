import type { Query } from "mongoose";

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PROTECTED_FILTER_FIELDS = [
  "page",
  "sort",
  "limit",
  "search",
  "fields",
  "isActive",
  "_id",
  "id",
  "createdBy",
  "trainer",
  "member",
  "user",
  "assignment",
  "$where",
  "$expr",
  "$or",
  "$and",
  "$nor",
];

class ApiFeatures<T> {
  private readonly baseFilter: Record<string, any>;

  constructor(
    public query: Query<T[], T>,
    public queryString: Record<string, any>,
  ) {
    this.baseFilter = { ...this.query.getFilter() };
  }

  filter(allowedFields?: string[]) {
    const queryObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(this.queryString || {})) {
      if (key.startsWith("$")) continue;

      if (allowedFields) {
        if (!allowedFields.includes(key)) continue;
      } else {
        if (PROTECTED_FILTER_FIELDS.includes(key)) continue;
      }

      // Prevent arbitrary operator objects from overriding security predicates
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        continue;
      }

      queryObj[key] = value;
    }

    // Always re-apply server-enforced baseFilter last so client params never override it
    this.query = this.query.find({
      ...queryObj,
      ...this.baseFilter,
    });

    return this;
  }

  search(fields: string[]) {
    const rawKeyword = this.queryString?.search;

    if (typeof rawKeyword !== "string" || !rawKeyword.trim()) return this;

    const safeKeyword = escapeRegex(rawKeyword.trim());

    this.query = this.query.find({
      $or: fields.map((field) => ({
        [field]: {
          $regex: safeKeyword,
          $options: "i",
        },
      })),
    });

    return this;
  }

  sort() {
    if (typeof this.queryString?.sort === "string" && this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginate() {
    const page = Math.max(Number(this.queryString?.page) || 1, 1);
    const limit = Math.max(Number(this.queryString?.limit) || 10, 1);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;

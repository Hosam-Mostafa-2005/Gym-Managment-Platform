export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const PROTECTED_FILTER_FIELDS = [
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

export class ApiFeatures {
  public prismaWhere: Record<string, any> = {};
  public prismaOrderBy: any[] = [{ createdAt: "desc" }];
  public prismaSkip: number = 0;
  public prismaTake: number = 10;
  private readonly baseFilter: Record<string, any>;

  constructor(
    public query: any,
    public queryString: Record<string, any> = {},
  ) {
    if (this.query && typeof this.query.getFilter === "function") {
      this.baseFilter = { ...this.query.getFilter() };
    } else if (this.query && typeof this.query === "object" && !this.query.find) {
      this.baseFilter = { ...this.query };
    } else {
      this.baseFilter = {};
    }
    this.prismaWhere = { ...this.baseFilter };
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
    const merged = {
      ...queryObj,
      ...this.baseFilter,
    };

    if (this.query && typeof this.query.find === "function") {
      this.query = this.query.find(merged);
    }
    this.prismaWhere = merged;

    return this;
  }

  search(fields: string[]) {
    const rawKeyword = this.queryString?.search;

    if (typeof rawKeyword !== "string" || !rawKeyword.trim()) return this;

    const safeKeyword = rawKeyword.trim();

    if (this.query && typeof this.query.find === "function") {
      const safeEscaped = escapeRegex(safeKeyword);
      this.query = this.query.find({
        $or: fields.map((field) => ({
          [field]: {
            $regex: safeEscaped,
            $options: "i",
          },
        })),
      });
    }

    const orClauses = fields.map((field) => ({
      [field]: {
        contains: safeKeyword,
        mode: "insensitive",
      },
    }));

    if (this.prismaWhere.OR) {
      this.prismaWhere.AND = [
        { OR: this.prismaWhere.OR },
        { OR: orClauses },
      ];
      delete this.prismaWhere.OR;
    } else {
      this.prismaWhere.OR = orClauses;
    }

    return this;
  }

  sort() {
    if (typeof this.queryString?.sort === "string" && this.queryString.sort) {
      const parts = this.queryString.sort.split(",").map((s: string) => s.trim());
      this.prismaOrderBy = parts.map((part: string) => {
        if (part.startsWith("-")) {
          return { [part.substring(1)]: "desc" };
        }
        return { [part]: "asc" };
      });

      if (this.query && typeof this.query.sort === "function") {
        this.query = this.query.sort(parts.join(" "));
      }
    } else {
      this.prismaOrderBy = [{ createdAt: "desc" }];
      if (this.query && typeof this.query.sort === "function") {
        this.query = this.query.sort("-createdAt");
      }
    }

    return this;
  }

  paginate() {
    const page = Math.max(Number(this.queryString?.page) || 1, 1);
    const limit = Math.max(Number(this.queryString?.limit) || 10, 1);

    const skip = (page - 1) * limit;

    this.prismaSkip = skip;
    this.prismaTake = limit;

    if (this.query && typeof this.query.skip === "function") {
      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

export default ApiFeatures;

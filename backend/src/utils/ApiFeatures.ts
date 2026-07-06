import type { Query } from "mongoose";

class ApiFeatures<T> {
  constructor(
    public query: Query<T[], T>,
    public queryString: Record<string, any>,
  ) {}

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["page", "sort", "limit", "search"];

    excludedFields.forEach((field) => delete queryObj[field]);

    this.query = this.query.find(queryObj);

    return this;
  }

  search(fields: string[]) {
    const keyword = this.queryString.search;

    if (!keyword) return this;

    this.query = this.query.find({
      $or: fields.map((field) => ({
        [field]: {
          $regex: keyword,
          $options: "i",
        },
      })),
    });

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;

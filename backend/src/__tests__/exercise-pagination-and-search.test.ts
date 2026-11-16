import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ApiFeatures from "../utils/ApiFeatures.js";

describe("Part 3 — Exercise Pagination & Search Verification", () => {
  const baseFilter = { isActive: true };

  it("1. First page sets correct skip (0) and default limit (10)", () => {
    const features = new ApiFeatures(baseFilter, { page: 1, limit: 10 }).paginate();
    assert.equal(features.prismaSkip, 0);
    assert.equal(features.prismaTake, 10);
  });

  it("2. Next page sets correct skip delta (page 2 -> skip 10)", () => {
    const features = new ApiFeatures(baseFilter, { page: 2, limit: 10 }).paginate();
    assert.equal(features.prismaSkip, 10);
    assert.equal(features.prismaTake, 10);

    const page3 = new ApiFeatures(baseFilter, { page: 3, limit: 25 }).paginate();
    assert.equal(page3.prismaSkip, 50);
    assert.equal(page3.prismaTake, 25);
  });

  it("3. Sanitizes and normalizes invalid or negative page and limit parameters", () => {
    const features = new ApiFeatures(baseFilter, { page: -5, limit: -20 }).paginate();
    assert.equal(features.prismaSkip, 0);
    assert.ok(features.prismaTake >= 1, "take should be at least 1");

    const NaNFeatures = new ApiFeatures(baseFilter, { page: "abc", limit: "xyz" }).paginate();
    assert.equal(NaNFeatures.prismaSkip, 0);
    assert.equal(NaNFeatures.prismaTake, 10);
  });

  it("4. Case-insensitive multi-field search across name and muscle groups", () => {
    const features = new ApiFeatures(baseFilter, { search: "Bench" })
      .search(["name", "primaryMuscles", "secondaryMuscles"]);

    assert.ok(features.prismaWhere.OR, "Expected OR clause for search terms");
    assert.equal(features.prismaWhere.OR.length, 3);
    assert.deepEqual(features.prismaWhere.OR[0], {
      name: { contains: "Bench", mode: "insensitive" },
    });
    assert.deepEqual(features.prismaWhere.OR[1], {
      primaryMuscles: { contains: "Bench", mode: "insensitive" },
    });
  });

  it("5. Filters combine with search without stripping base security filter", () => {
    const features = new ApiFeatures(baseFilter, {
      equipment: "BARBELL",
      difficulty: "INTERMEDIATE",
      search: "Press",
    })
      .filter(["equipment", "difficulty"])
      .search(["name"]);

    assert.equal(features.prismaWhere.isActive, true);
    assert.equal(features.prismaWhere.equipment, "BARBELL");
    assert.equal(features.prismaWhere.difficulty, "INTERMEDIATE");
    assert.ok(features.prismaWhere.OR);
    assert.deepEqual(features.prismaWhere.OR[0], {
      name: { contains: "Press", mode: "insensitive" },
    });
  });

  it("6. Empty search keyword behaves gracefully without creating empty OR clauses", () => {
    const features = new ApiFeatures(baseFilter, { search: "   " })
      .search(["name"]);

    assert.equal(features.prismaWhere.OR, undefined);
  });
});

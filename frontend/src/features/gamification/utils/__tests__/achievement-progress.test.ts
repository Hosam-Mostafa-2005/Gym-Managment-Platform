// src/features/gamification/utils/__tests__/achievement-progress.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateAchievementProgress } from "../achievement-progress.js";

describe("Achievement Progress Bar Calculation & Normalization", () => {
  it("returns 0% when achievement is null or undefined", () => {
    assert.deepEqual(calculateAchievementProgress(null), {
      current: 0,
      target: 0,
      percent: 0,
    });
    assert.deepEqual(calculateAchievementProgress(undefined), {
      current: 0,
      target: 0,
      percent: 0,
    });
  });

  it("returns 0% when target is 0 or negative without divide-by-zero or NaN", () => {
    const resZeroTarget = calculateAchievementProgress({
      currentProgress: 5,
      criteriaTarget: 0,
      isEarned: false,
    });
    assert.equal(resZeroTarget.percent, 0);
    assert.equal(isNaN(resZeroTarget.percent), false);

    const resNegTarget = calculateAchievementProgress({
      currentProgress: 5,
      criteriaTarget: -10,
      isEarned: false,
    });
    assert.equal(resNegTarget.percent, 0);
    assert.equal(isNaN(resNegTarget.percent), false);
  });

  it("accurately calculates partial progress percentage rounded to nearest integer", () => {
    // 0 out of 10 -> 0%
    assert.deepEqual(
      calculateAchievementProgress({
        currentProgress: 0,
        criteriaTarget: 10,
        isEarned: false,
      }),
      { current: 0, target: 10, percent: 0 },
    );

    // 3 out of 10 -> 30%
    assert.deepEqual(
      calculateAchievementProgress({
        currentProgress: 3,
        criteriaTarget: 10,
        isEarned: false,
      }),
      { current: 3, target: 10, percent: 30 },
    );

    // 1 out of 3 -> 33%
    assert.deepEqual(
      calculateAchievementProgress({
        currentProgress: 1,
        criteriaTarget: 3,
        isEarned: false,
      }),
      { current: 1, target: 3, percent: 33 },
    );

    // 5 out of 10 -> 50%
    assert.deepEqual(
      calculateAchievementProgress({
        currentProgress: 5,
        criteriaTarget: 10,
        isEarned: false,
      }),
      { current: 5, target: 10, percent: 50 },
    );

    // 9 out of 10 -> 90%
    assert.deepEqual(
      calculateAchievementProgress({
        currentProgress: 9,
        criteriaTarget: 10,
        isEarned: false,
      }),
      { current: 9, target: 10, percent: 90 },
    );
  });

  it("strictly caps unearned progress at 100% when current exceeds target", () => {
    // 12 out of 10 -> capped at 100%
    const res = calculateAchievementProgress({
      currentProgress: 12,
      criteriaTarget: 10,
      isEarned: false,
    });
    assert.equal(res.percent, 100);
    assert.equal(res.current, 12);
    assert.equal(res.target, 10);
  });

  it("strictly returns 100% when isEarned is true regardless of progress numbers", () => {
    const resEarned = calculateAchievementProgress({
      currentProgress: 0,
      criteriaTarget: 10,
      isEarned: true,
    });
    assert.equal(resEarned.percent, 100);

    const resEarnedWithTarget = calculateAchievementProgress({
      currentProgress: 10,
      criteriaTarget: 10,
      isEarned: true,
    });
    assert.equal(resEarnedWithTarget.percent, 100);
  });

  it("supports both backend criteriaTarget and targetProgress aliases seamlessly", () => {
    // Backend returns targetProgress
    const resBackendAlias = calculateAchievementProgress({
      currentProgress: 7,
      targetProgress: 10,
      isEarned: false,
    });
    assert.equal(resBackendAlias.target, 10);
    assert.equal(resBackendAlias.percent, 70);

    // Backend nested criteria.target
    const resNestedTarget = calculateAchievementProgress({
      currentProgress: 4,
      criteria: { target: 8 },
      isEarned: false,
    });
    assert.equal(resNestedTarget.target, 8);
    assert.equal(resNestedTarget.percent, 50);
  });

  it("never returns negative percentage for negative progress values", () => {
    const resNegCurrent = calculateAchievementProgress({
      currentProgress: -5,
      criteriaTarget: 10,
      isEarned: false,
    });
    assert.equal(resNegCurrent.percent, 0);
    assert.equal(resNegCurrent.current, 0);
  });
});

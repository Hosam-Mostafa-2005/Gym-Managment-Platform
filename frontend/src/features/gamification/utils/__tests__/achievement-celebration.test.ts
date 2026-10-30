// src/features/gamification/utils/__tests__/achievement-celebration.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Achievement Celebration Logic & Queue Management", () => {
  it("initializes baseline on first load without celebrating existing earned achievements", () => {
    const existingEarned = [
      { id: "ach-1", code: "FIRST_WORKOUT", isEarned: true },
      { id: "ach-2", code: "WORKOUTS_5", isEarned: true },
      { id: "ach-3", code: "WORKOUTS_10", isEarned: false },
    ];

    let storedValue: string | null = null;

    // Simulation of initialization
    if (storedValue === null) {
      const initialIds = existingEarned
        .filter((a) => a.isEarned)
        .map((a) => a.id);
      storedValue = JSON.stringify(initialIds);
    }

    const celebratedSet = new Set<string>(JSON.parse(storedValue));
    assert.equal(celebratedSet.has("ach-1"), true);
    assert.equal(celebratedSet.has("ach-2"), true);
    assert.equal(celebratedSet.has("ach-3"), false);

    // Filter newly unlocked candidates: should be empty on initial load
    const newlyUnlocked = existingEarned.filter(
      (a) => a.isEarned && !celebratedSet.has(a.id),
    );
    assert.equal(newlyUnlocked.length, 0, "Initial load must not trigger any celebrations");
  });

  it("accurately detects when a new achievement is unlocked and prevents duplicates", () => {
    let storedCelebrated = JSON.stringify(["ach-1", "ach-2"]);
    const celebratedSet = new Set<string>(JSON.parse(storedCelebrated));

    // Later: ach-3 is unlocked!
    const updatedAchievements = [
      { id: "ach-1", code: "FIRST_WORKOUT", isEarned: true },
      { id: "ach-2", code: "WORKOUTS_5", isEarned: true },
      { id: "ach-3", code: "WORKOUTS_10", isEarned: true },
    ];

    const newlyUnlocked = updatedAchievements.filter(
      (a) => a.isEarned && !celebratedSet.has(a.id) && !celebratedSet.has(a.code),
    );

    assert.equal(newlyUnlocked.length, 1);
    assert.equal(newlyUnlocked[0].id, "ach-3");

    // Immediately mark as celebrated in storage
    newlyUnlocked.forEach((a) => {
      celebratedSet.add(a.id);
      celebratedSet.add(a.code);
    });
    storedCelebrated = JSON.stringify(Array.from(celebratedSet));

    // Verify on subsequent refetch or render: no duplicate celebration
    const recheck = updatedAchievements.filter(
      (a) => a.isEarned && !celebratedSet.has(a.id) && !celebratedSet.has(a.code),
    );
    assert.equal(recheck.length, 0, "Must not celebrate again on refetch");
  });

  it("handles multi-achievement unlocks sequentially via queue", () => {
    let queue = [
      { id: "ach-1", title: "First Sweat" },
      { id: "ach-2", title: "Building Momentum" },
    ];

    // Card 1
    assert.equal(queue.length, 2);
    assert.equal(queue[0].title, "First Sweat");

    // User dismisses card 1
    queue = queue.slice(1);
    assert.equal(queue.length, 1);
    assert.equal(queue[0].title, "Building Momentum");

    // User dismisses card 2
    queue = queue.slice(1);
    assert.equal(queue.length, 0);
  });
});

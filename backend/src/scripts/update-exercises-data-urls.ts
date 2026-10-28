import fs from "fs";
import path from "path";

const MANIFEST_PATH = path.resolve(
  process.cwd(),
  "../Docs/assets/exercise-illustrations-refresh/exercise-image-manifest.json"
);
const EXERCISES_TS_PATH = path.resolve(
  process.cwd(),
  "src/scripts/data/exercises.ts"
);
const BICEPS_TS_PATH = path.resolve(
  process.cwd(),
  "src/scripts/seed-biceps-exercises.ts"
);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
const urlMap = new Map<string, string>();
for (const ex of manifest.exercises) {
  if (ex.deliveryUrl) {
    urlMap.set(ex.exerciseName, ex.deliveryUrl);
  }
}

// 1. Update exercises.ts
let exercisesTs = fs.readFileSync(EXERCISES_TS_PATH, "utf-8");

for (const [name, url] of urlMap.entries()) {
  // Check if name is present in exercises.ts
  const namePattern = new RegExp(`name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`);
  if (!namePattern.test(exercisesTs)) continue;

  // Check if imageUrl is already in this block
  // If not, add it right after the name
  const replaceTarget = new RegExp(`(name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'],\\s*\\n)`);
  if (replaceTarget.test(exercisesTs)) {
    // If imageUrl is already there, replace it, else insert it
    const existingImageUrl = new RegExp(`(name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'],\\s*\\n)(\\s*imageUrl:\\s*["'][^"']+["'],?\\s*\\n)?`);
    exercisesTs = exercisesTs.replace(existingImageUrl, `$1    imageUrl: "${url}",\n`);
  }
}

fs.writeFileSync(EXERCISES_TS_PATH, exercisesTs, "utf-8");
console.log("✅ Updated backend/src/scripts/data/exercises.ts with verified Cloudinary URLs");

// 2. Update seed-biceps-exercises.ts
let bicepsTs = fs.readFileSync(BICEPS_TS_PATH, "utf-8");

for (const [name, url] of urlMap.entries()) {
  const namePattern = new RegExp(`name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`);
  if (!namePattern.test(bicepsTs)) continue;

  const existingImageUrl = new RegExp(`(name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'],\\s*\\n)(\\s*imageUrl:\\s*["'][^"']+["'],?\\s*\\n)?`);
  bicepsTs = bicepsTs.replace(existingImageUrl, `$1    imageUrl: "${url}",\n`);
}

fs.writeFileSync(BICEPS_TS_PATH, bicepsTs, "utf-8");
console.log("✅ Updated backend/src/scripts/seed-biceps-exercises.ts with verified Cloudinary URLs");

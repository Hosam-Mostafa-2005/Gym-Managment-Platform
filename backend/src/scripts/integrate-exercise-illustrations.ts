import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";

const allCloudinaryResources = JSON.parse(
  fs.readFileSync(
    "C:/Users/eman8/.gemini/antigravity/brain/39668a39-71e5-4a9d-8c86-52b91aa15143/scratch/cloudinary-all-resources.json",
    "utf-8"
  )
);

// Map of the 59 uploaded today
const uploadedToday = allCloudinaryResources.filter((r: any) => {
  const t = new Date(r.created_at).getTime();
  const start = new Date("2026-10-28T18:50:00Z").getTime();
  const end = new Date("2026-10-28T19:05:00Z").getTime();
  return t >= start && t <= end;
});

const BICEPS_MAPPING: Record<string, string> = {
  "Cable Curl": "Cable_Curl_Exercise_Illustration",
  "Cable Biceps Curl": "Cable_Machine_Biceps_Curl_Illustration",
  "Bayesian Cable Curl": "Black-and-White_Cable_Curl_Illustration",
  "EZ-Bar Curl": "Muscular_Man_Curling_an_EZ_Barbell",
  "Machine Biceps Curl": "Seated_Preacher_Curl_Machine_Illustration",
  "Spider Curl": "Prone_Incline_Dumbbell_Curls",
  "Reverse Curl": "Faceless_Bodybuilder_Holding_Barbell",
  "Cross-body Hammer Curl": "Faceless_Cross-Body_Curl_Illustration",
  "Dumbbell Biceps Curl": "Faceless_Muscular_Dumbbell_Curl_Illustration",
  "Alternating Dumbbell Curl": "Faceless_Muscular_Man_Performing_Dumbbell_Curl",
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("====================================================");
  console.log("🚀 STARTING EXERCISE ILLUSTRATIONS DATABASE INTEGRATION");
  console.log("====================================================\n");

  const dbExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  const testRegex = /[0-9a-f]{8}$/i;
  const EXCLUDED_CUSTOM = ["HOSAMELDEEN MOSTAFA", "Up to Low"];

  let updatedCount = 0;
  let alreadyUpToDateCount = 0;
  let excludedCount = 0;
  let testCount = 0;
  let errorCount = 0;

  for (const ex of dbExercises) {
    if (testRegex.test(ex.name)) {
      testCount++;
      continue;
    }

    if (EXCLUDED_CUSTOM.includes(ex.name)) {
      excludedCount++;
      console.log(`🔒 [EXCLUDED CUSTOM] ${ex.name} (${ex.id}) - Preserved unchanged.`);
      continue;
    }

    let matchedCloudinaryAsset: any = null;
    let matchMethod = "";

    // 1. Check if in BICEPS_MAPPING
    if (BICEPS_MAPPING[ex.name]) {
      const pubId = BICEPS_MAPPING[ex.name];
      matchedCloudinaryAsset = uploadedToday.find((r: any) => r.public_id === pubId);
      matchMethod = "BICEPS_SPECIFIC";
    }

    // 2. Otherwise match by exercise slug: exercise-${slug}-v2
    if (!matchedCloudinaryAsset) {
      const slug = toSlug(ex.name);
      matchedCloudinaryAsset = uploadedToday.find(
        (r: any) => r.public_id === `exercise-${slug}-v2`
      );
      if (matchedCloudinaryAsset) matchMethod = "STANDARD_SLUG";
    }

    // 3. Fallback alias: Hammer Curl -> exercise-hammer-curls-v2 or exercise-hammer-curl-v2
    if (!matchedCloudinaryAsset && ex.name === "Hammer Curl") {
      matchedCloudinaryAsset = uploadedToday.find(
        (r: any) =>
          r.public_id === "exercise-hammer-curl-v2" ||
          r.public_id === "exercise-hammer-curls-v2"
      );
      if (matchedCloudinaryAsset) matchMethod = "ALIAS_MATCH";
    }

    if (!matchedCloudinaryAsset) {
      errorCount++;
      console.error(`❌ [NO ASSET FOUND] ${ex.name} (${ex.id})`);
      continue;
    }

    const targetUrl = matchedCloudinaryAsset.secure_url;

    if (ex.imageUrl === targetUrl) {
      alreadyUpToDateCount++;
      console.log(`✅ [ALREADY UP TO DATE] ${ex.name} -> ${targetUrl}`);
      continue;
    }

    // Update only imageUrl by stable UUID
    await prisma.exercise.update({
      where: { id: ex.id },
      data: { imageUrl: targetUrl },
    });

    updatedCount++;
    console.log(
      `✨ [UPDATED] ${ex.name} (${matchMethod})
       ID: ${ex.id}
       Old: ${ex.imageUrl || "(none)"}
       New: ${targetUrl}`
    );
  }

  console.log("\n====================================================");
  console.log("🎉 DATABASE INTEGRATION COMPLETE");
  console.log("====================================================");
  console.log(`Updated records: ${updatedCount}`);
  console.log(`Already up-to-date: ${alreadyUpToDateCount}`);
  console.log(`Excluded custom exercises: ${excludedCount}`);
  console.log(`Test fixtures bypassed: ${testCount}`);
  console.log(`Errors / Unmatched: ${errorCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error during integration:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

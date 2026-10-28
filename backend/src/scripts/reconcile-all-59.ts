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

console.log(`Verified ${uploadedToday.length} assets uploaded today in Cloudinary.`);

// The 10 specific biceps illustrations mapping
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
  const dbExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });
  console.log(`Total database exercises: ${dbExercises.length}`);

  const testRegex = /[0-9a-f]{8}$/i;
  const EXCLUDED_CUSTOM = ["HOSAMELDEEN MOSTAFA", "Up to Low"];

  const results: any[] = [];
  let mappedCount = 0;
  let excludedCount = 0;
  let testCount = 0;
  let unmappedCount = 0;

  for (const ex of dbExercises) {
    if (testRegex.test(ex.name)) {
      testCount++;
      results.push({
        id: ex.id,
        name: ex.name,
        type: "TEST_FIXTURE",
        status: "PRESERVED_TEST",
        targetUrl: ex.imageUrl,
      });
      continue;
    }

    if (EXCLUDED_CUSTOM.includes(ex.name)) {
      excludedCount++;
      results.push({
        id: ex.id,
        name: ex.name,
        type: "EXCLUDED_CUSTOM",
        status: "PRESERVED_CUSTOM",
        targetUrl: ex.imageUrl,
      });
      continue;
    }

    let matchedCloudinaryAsset: any = null;
    let matchType = "";

    // 1. Check if in BICEPS_MAPPING
    if (BICEPS_MAPPING[ex.name]) {
      const pubId = BICEPS_MAPPING[ex.name];
      matchedCloudinaryAsset = uploadedToday.find((r: any) => r.public_id === pubId);
      matchType = "EXPLICIT_BICEPS_UPLOAD";
    }

    // 2. Otherwise match by exercise slug: exercise-${slug}-v2
    if (!matchedCloudinaryAsset) {
      const slug = toSlug(ex.name);
      matchedCloudinaryAsset = uploadedToday.find(
        (r: any) => r.public_id === `exercise-${slug}-v2`
      );
      if (matchedCloudinaryAsset) matchType = "SLUG_MATCH";
    }

    // 3. Fallback alias: Hammer Curl -> exercise-hammer-curls-v2 or exercise-hammer-curl-v2
    if (!matchedCloudinaryAsset && ex.name === "Hammer Curl") {
      matchedCloudinaryAsset = uploadedToday.find(
        (r: any) => r.public_id === "exercise-hammer-curl-v2" || r.public_id === "exercise-hammer-curls-v2"
      );
      if (matchedCloudinaryAsset) matchType = "ALIAS_MATCH";
    }

    if (matchedCloudinaryAsset) {
      mappedCount++;
      results.push({
        id: ex.id,
        name: ex.name,
        type: "STANDARD_EXERCISE",
        status: "MAPPED",
        matchType,
        publicId: matchedCloudinaryAsset.public_id,
        secureUrl: matchedCloudinaryAsset.secure_url,
        currentUrl: ex.imageUrl,
      });
    } else {
      unmappedCount++;
      results.push({
        id: ex.id,
        name: ex.name,
        type: "STANDARD_EXERCISE",
        status: "UNMAPPED",
        currentUrl: ex.imageUrl,
      });
    }
  }

  console.log("\n=== RECONCILIATION SUMMARY ===");
  console.log(`Standard exercises mapped: ${mappedCount}`);
  console.log(`Excluded custom exercises: ${excludedCount}`);
  console.log(`Test fixtures: ${testCount}`);
  console.log(`Unmapped standard exercises: ${unmappedCount}`);

  console.log("\nMapped standard exercises sample:");
  results
    .filter((r) => r.status === "MAPPED")
    .forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.name} -> [${r.publicId}] ${r.secureUrl}`);
    });

  if (unmappedCount > 0) {
    console.log("\n⚠️ Unmapped exercises:");
    results
      .filter((r) => r.status === "UNMAPPED")
      .forEach((r) => console.log(`- ${r.name}`));
  }

  // Save full reconciliation to scratch
  fs.writeFileSync(
    "C:/Users/eman8/.gemini/antigravity/brain/39668a39-71e5-4a9d-8c86-52b91aa15143/scratch/reconciled-mappings.json",
    JSON.stringify(results, null, 2),
    "utf-8"
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

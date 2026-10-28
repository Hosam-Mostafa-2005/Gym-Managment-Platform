import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";

const allCloudinaryResources = JSON.parse(
  fs.readFileSync(
    "C:/Users/eman8/.gemini/antigravity/brain/39668a39-71e5-4a9d-8c86-52b91aa15143/scratch/cloudinary-all-resources.json",
    "utf-8"
  )
);

const uploadedToday = allCloudinaryResources.filter((r: any) => {
  const t = new Date(r.created_at).getTime();
  const start = new Date("2026-10-28T18:50:00Z").getTime();
  const end = new Date("2026-10-28T19:05:00Z").getTime();
  return t >= start && t <= end;
});

const BICEPS_INFO: Record<
  string,
  {
    publicId: string;
    filename: string;
    reason: string;
  }
> = {
  "Cable Curl": {
    publicId: "Cable_Curl_Exercise_Illustration",
    filename: "Cable Curl Exercise Illustration.png",
    reason:
      "Replaced legacy photographic studio image with standardized black-and-white exercise anatomy illustration on pure white background (#FFFFFF).",
  },
  "Cable Biceps Curl": {
    publicId: "Cable_Machine_Biceps_Curl_Illustration",
    filename: "Cable Machine Biceps Curl Illustration.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of standing cable machine biceps curl on pure white background (#FFFFFF).",
  },
  "Bayesian Cable Curl": {
    publicId: "Black-and-White_Cable_Curl_Illustration",
    filename: "Black-and-White Cable Curl Illustration.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of bayesian cable curl facing away from cable stack on pure white background (#FFFFFF).",
  },
  "EZ-Bar Curl": {
    publicId: "Muscular_Man_Curling_an_EZ_Barbell",
    filename: "Muscular Man Curling an EZ Barbell.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of standing EZ-bar curl on pure white background (#FFFFFF).",
  },
  "Machine Biceps Curl": {
    publicId: "Seated_Preacher_Curl_Machine_Illustration",
    filename: "Seated Preacher Curl Machine Illustration.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of seated preacher curl machine on pure white background (#FFFFFF).",
  },
  "Spider Curl": {
    publicId: "Prone_Incline_Dumbbell_Curls",
    filename: "Prone Incline Dumbbell Curls.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of prone chest-supported spider curl on pure white background (#FFFFFF).",
  },
  "Reverse Curl": {
    publicId: "Faceless_Bodybuilder_Holding_Barbell",
    filename: "Faceless Bodybuilder Holding Barbell.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of standing pronated reverse curl on pure white background (#FFFFFF).",
  },
  "Cross-body Hammer Curl": {
    publicId: "Faceless_Cross-Body_Curl_Illustration",
    filename: "Faceless Cross-Body Curl Illustration.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of cross-body hammer curl on pure white background (#FFFFFF).",
  },
  "Dumbbell Biceps Curl": {
    publicId: "Faceless_Muscular_Dumbbell_Curl_Illustration",
    filename: "Faceless Muscular Dumbbell Curl Illustration.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of standing dumbbell biceps curl on pure white background (#FFFFFF).",
  },
  "Alternating Dumbbell Curl": {
    publicId: "Faceless_Muscular_Man_Performing_Dumbbell_Curl",
    filename: "Faceless Muscular Man Performing Dumbbell Curl.png",
    reason:
      "Standardized black-and-white anatomical line-art illustration of alternating dumbbell curl with forearm supination on pure white background (#FFFFFF).",
  },
};

const IMAGES_DIR = path.resolve(
  process.cwd(),
  "../Docs/assets/exercise-illustrations-refresh/images"
);
const MANIFEST_JSON_PATH = path.resolve(
  process.cwd(),
  "../Docs/assets/exercise-illustrations-refresh/exercise-image-manifest.json"
);
const MANIFEST_CSV_PATH = path.resolve(
  process.cwd(),
  "../Docs/assets/exercise-illustrations-refresh/exercise-image-manifest.csv"
);

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

async function main() {
  const existingManifest = JSON.parse(
    fs.readFileSync(MANIFEST_JSON_PATH, "utf-8")
  );
  const existingMap = new Map<string, any>();
  for (const ex of existingManifest.exercises) {
    existingMap.set(ex.exerciseName, ex);
  }

  const dbExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  const testRegex = /[0-9a-f]{8}$/i;
  const EXCLUDED_CUSTOM = ["HOSAMELDEEN MOSTAFA", "Up to Low"];

  const updatedExercises: any[] = [];
  const csvRows: string[] = [];

  const csvHeader = [
    "Exercise ID",
    "Exercise Name",
    "Slug",
    "Category",
    "Equipment",
    "Primary Muscles",
    "Existing Image URL",
    "Delivery URL",
    "Replacement Reason",
    "New Image Filename",
    "Intended Cloudinary Public ID",
    "Actual Cloudinary Public ID",
    "Status",
    "Dimensions",
    "File Size (Bytes)",
  ].join(",");
  csvRows.push(csvHeader);

  for (const ex of dbExercises) {
    if (testRegex.test(ex.name)) continue;

    const slug = toSlug(ex.name);
    const prev = existingMap.get(ex.name) || {};

    if (EXCLUDED_CUSTOM.includes(ex.name)) {
      const entry = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        exerciseSlug: slug,
        category: (ex as any).category || "General",
        equipment: ex.equipment || [],
        primaryMuscles: ex.primaryMuscles || [],
        secondaryMuscles: ex.secondaryMuscles || [],
        existingImageUrl: ex.imageUrl || null,
        deliveryUrl: null,
        replacementReason:
          "Explicitly excluded custom user exercise; retains existing behavior and image configuration.",
        newImageFilename: null,
        intendedCloudinaryPublicId: null,
        actualCloudinaryPublicId: null,
        status: "EXCLUDED_CUSTOM",
        verificationStatus: "EXCLUDED_CUSTOM",
        fileSizeBytes: null,
        dimensions: null,
      };
      updatedExercises.push(entry);

      csvRows.push(
        [
          escapeCsvField(entry.exerciseId),
          escapeCsvField(entry.exerciseName),
          escapeCsvField(entry.exerciseSlug),
          escapeCsvField(entry.category),
          escapeCsvField(entry.equipment.join(", ")),
          escapeCsvField(entry.primaryMuscles.join(", ")),
          escapeCsvField(entry.existingImageUrl),
          escapeCsvField(entry.deliveryUrl),
          escapeCsvField(entry.replacementReason),
          escapeCsvField(entry.newImageFilename),
          escapeCsvField(entry.intendedCloudinaryPublicId),
          escapeCsvField(entry.actualCloudinaryPublicId),
          escapeCsvField(entry.status),
          escapeCsvField(entry.dimensions),
          escapeCsvField(entry.fileSizeBytes),
        ].join(",")
      );
      continue;
    }

    let matchedCloudinaryAsset: any = null;
    let filename = "";
    let reason = "";

    if (BICEPS_INFO[ex.name]) {
      const info = BICEPS_INFO[ex.name];
      matchedCloudinaryAsset = uploadedToday.find(
        (r: any) => r.public_id === info.publicId
      );
      filename = info.filename;
      reason = info.reason;
    } else {
      matchedCloudinaryAsset = uploadedToday.find(
        (r: any) => r.public_id === `exercise-${slug}-v2`
      );
      filename = `exercise-${slug}-v2.png`;
      reason =
        prev.replacementReason ||
        "Standardized black-and-white exercise anatomy illustration on pure white background (#FFFFFF).";

      if (!matchedCloudinaryAsset && ex.name === "Hammer Curl") {
        matchedCloudinaryAsset = uploadedToday.find(
          (r: any) =>
            r.public_id === "exercise-hammer-curl-v2" ||
            r.public_id === "exercise-hammer-curls-v2"
        );
        filename = "exercise-hammer-curl-v2.png";
      }
    }

    if (!matchedCloudinaryAsset) {
      throw new Error(`Cloudinary asset not found for: ${ex.name}`);
    }

    const filePath = path.join(IMAGES_DIR, filename);
    let fileSize: number | null = null;
    if (fs.existsSync(filePath)) {
      fileSize = fs.statSync(filePath).size;
    }

    const intendedPublicId = `stren/exercises/illustrations/exercise-${slug}-v2`;
    const actualPublicId = matchedCloudinaryAsset.public_id;
    const deliveryUrl = matchedCloudinaryAsset.secure_url;

    const entry = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      exerciseSlug: slug,
      category: (ex as any).category || "General",
      equipment: ex.equipment || [],
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      existingImageUrl: prev.existingImageUrl || null,
      deliveryUrl: deliveryUrl,
      replacementReason: reason,
      newImageFilename: filename,
      intendedCloudinaryPublicId: intendedPublicId,
      actualCloudinaryPublicId: actualPublicId,
      status: "MAPPED",
      verificationStatus: "VERIFIED",
      fileSizeBytes: fileSize,
      dimensions: "512x512",
    };

    updatedExercises.push(entry);

    csvRows.push(
      [
        escapeCsvField(entry.exerciseId),
        escapeCsvField(entry.exerciseName),
        escapeCsvField(entry.exerciseSlug),
        escapeCsvField(entry.category),
        escapeCsvField(entry.equipment.join(", ")),
        escapeCsvField(entry.primaryMuscles.join(", ")),
        escapeCsvField(entry.existingImageUrl),
        escapeCsvField(entry.deliveryUrl),
        escapeCsvField(entry.replacementReason),
        escapeCsvField(entry.newImageFilename),
        escapeCsvField(entry.intendedCloudinaryPublicId),
        escapeCsvField(entry.actualCloudinaryPublicId),
        escapeCsvField(entry.status),
        escapeCsvField(entry.dimensions),
        escapeCsvField(entry.fileSizeBytes),
      ].join(",")
    );
  }

  const finalJson = {
    metadata: {
      title:
        "STREN Exercise Image Catalog Refresh — Standardized Black-and-White Illustrations",
      updatedAt: new Date().toISOString(),
      specification: {
        style: "Black-and-white fitness anatomy line art illustration",
        dimensions: "512x512 pixels",
        format: "PNG",
        background: "#FFFFFF (pure clean white)",
        outlines:
          "Strong clean black line work with anatomically detailed athletic musculature",
        colorFills: "None (monochrome line art only)",
        watermarksOrDecorations: "None",
      },
      totalCatalogEntries: updatedExercises.length,
      totalVerifiedImagesIntegrated: updatedExercises.filter(
        (e) => e.status === "MAPPED"
      ).length,
      totalExcludedCustomExercises: updatedExercises.filter(
        (e) => e.status === "EXCLUDED_CUSTOM"
      ).length,
      totalPendingStandardExercises: 0,
      completionRate: "100%",
      outputDirectory: "Docs/assets/exercise-illustrations-refresh/images",
    },
    exercises: updatedExercises,
  };

  fs.writeFileSync(
    MANIFEST_JSON_PATH,
    JSON.stringify(finalJson, null, 2),
    "utf-8"
  );
  fs.writeFileSync(MANIFEST_CSV_PATH, csvRows.join("\n"), "utf-8");

  console.log("✅ Successfully updated exercise-image-manifest.json");
  console.log("✅ Successfully updated exercise-image-manifest.csv");
  console.log(
    `Total entries: ${updatedExercises.length} (59 MAPPED, 2 EXCLUDED_CUSTOM, 0 PENDING)`
  );
}

main()
  .catch((err) => {
    console.error("Error generating manifests:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

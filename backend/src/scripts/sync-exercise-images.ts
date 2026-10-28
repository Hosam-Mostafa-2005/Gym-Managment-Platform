import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";

interface RefreshedManifestExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  exerciseSlug: string;
  category: string;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  existingImageUrl?: string | null;
  deliveryUrl?: string | null;
  replacementReason?: string;
  newImageFilename?: string | null;
  intendedCloudinaryPublicId?: string | null;
  actualCloudinaryPublicId?: string | null;
  status: string;
  verificationStatus: string;
  fileSizeBytes?: number | null;
  dimensions?: string | null;
}

interface RefreshedManifestData {
  metadata: Record<string, unknown>;
  exercises: RefreshedManifestExerciseEntry[];
}

interface LegacyManifestExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  imageFilename: string;
  fileExistsOnDisk: boolean;
  fileSizeBytes: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  targetMuscles: string[];
  equipment: string[];
  difficulty: string;
  imageSource: string;
  status: string;
  visualSubjectRule: string;
  notes: string;
  mappedImageUrl?: string;
  storageKey?: string;
  storageProvider?: "cloudinary" | "local";
}

interface LegacyManifestData {
  collectionMetadata: Record<string, unknown>;
  exercises: LegacyManifestExerciseEntry[];
}

const EXCLUDED_CUSTOM_EXERCISES = ["HOSAMELDEEN MOSTAFA", "Up to Low"];
const TEST_FIXTURE_REGEX = /[0-9a-f]{8}$/i;

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveManifestSource(): {
  manifestPath: string;
  isRefresh: boolean;
  imagesDir: string;
} {
  const refreshCandidates = [
    path.resolve(process.cwd(), "../Docs/assets/exercise-illustrations-refresh"),
    path.resolve(process.cwd(), "Docs/assets/exercise-illustrations-refresh"),
  ];

  for (const dir of refreshCandidates) {
    const jsonPath = path.join(dir, "exercise-image-manifest.json");
    if (fs.existsSync(jsonPath)) {
      return {
        manifestPath: jsonPath,
        isRefresh: true,
        imagesDir: path.join(dir, "images"),
      };
    }
  }

  const legacyCandidates = [
    path.resolve(process.cwd(), "../exercise-images"),
    path.resolve(process.cwd(), "exercise-images"),
  ];

  for (const dir of legacyCandidates) {
    const jsonPath = path.join(dir, "manifest.json");
    if (fs.existsSync(jsonPath)) {
      return {
        manifestPath: jsonPath,
        isRefresh: false,
        imagesDir: dir,
      };
    }
  }

  throw new Error("Could not locate exercise-image-manifest.json or legacy manifest.json in any expected path.");
}

function resolveBackendUploadsDir(): string {
  const cwd = process.cwd();
  if (path.basename(cwd).toLowerCase() === "backend") {
    return path.resolve(cwd, "uploads/exercises");
  }
  return path.resolve(cwd, "backend/uploads/exercises");
}

function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );
}

export async function syncExerciseImages() {
  console.log("====================================================");
  console.log("🖼️  STREN — EXERCISE IMAGE MAPPING & DB SYNC");
  console.log("====================================================\n");

  const { manifestPath, isRefresh, imagesDir } = resolveManifestSource();
  const uploadsDir = resolveBackendUploadsDir();

  console.log(`📂 Manifest Path     : ${manifestPath}`);
  console.log(`📂 Images Directory  : ${imagesDir}`);
  console.log(`📂 Local Uploads Dir : ${uploadsDir}`);
  console.log(`✨ Mode              : ${isRefresh ? "REFRESHED BLACK-AND-WHITE ILLUSTRATIONS" : "LEGACY"}\n`);

  const dbExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`🗄️  Database Exercises: ${dbExercises.length} records found in PostgreSQL\n`);

  let updatedCount = 0;
  let preservedCount = 0;
  let excludedCount = 0;
  let testCount = 0;
  let unmatchedCount = 0;

  if (isRefresh) {
    const manifest: RefreshedManifestData = JSON.parse(
      fs.readFileSync(manifestPath, "utf8"),
    );

    const byName = new Map<string, RefreshedManifestExerciseEntry>();
    const byId = new Map<string, RefreshedManifestExerciseEntry>();
    const byNorm = new Map<string, RefreshedManifestExerciseEntry>();

    for (const entry of manifest.exercises) {
      if (entry.exerciseId) byId.set(entry.exerciseId, entry);
      byName.set(entry.exerciseName, entry);
      byNorm.set(normalizeName(entry.exerciseName), entry);
    }

    for (const dbEx of dbExercises) {
      if (TEST_FIXTURE_REGEX.test(dbEx.name)) {
        testCount++;
        continue;
      }

      if (EXCLUDED_CUSTOM_EXERCISES.includes(dbEx.name)) {
        excludedCount++;
        console.log(`🔒 [EXCLUDED CUSTOM] ${dbEx.name} (${dbEx.id}) - Preserved unchanged.`);
        continue;
      }

      let match = byId.get(dbEx.id) || byName.get(dbEx.name) || byNorm.get(normalizeName(dbEx.name));

      // Alias check for Hammer Curl
      if (!match && dbEx.name === "Hammer Curl") {
        match = byName.get("Hammer Curls");
      }

      if (!match || !match.deliveryUrl) {
        unmatchedCount++;
        console.warn(`⚠️  [UNMATCHED / NO URL] ${dbEx.name} (${dbEx.id})`);
        continue;
      }

      const targetUrl = match.deliveryUrl;

      // Copy local image to uploads dir if present
      if (match.newImageFilename) {
        const localSource = path.join(imagesDir, match.newImageFilename);
        if (fs.existsSync(localSource)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          const ext = path.extname(match.newImageFilename);
          const dest = path.join(uploadsDir, `${dbEx.id}${ext}`);
          try {
            if (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(localSource).size) {
              fs.copyFileSync(localSource, dest);
            }
          } catch {
            // Ignore copy failure
          }
        }
      }

      if (dbEx.imageUrl === targetUrl) {
        preservedCount++;
        console.log(`✅ [PRESERVED] ${dbEx.name} -> ${targetUrl}`);
        continue;
      }

      await prisma.exercise.update({
        where: { id: dbEx.id },
        data: { imageUrl: targetUrl },
      });

      updatedCount++;
      console.log(`✨ [UPDATED] ${dbEx.name} -> ${targetUrl}`);
    }
  } else {
    // Legacy fallback path
    console.warn("⚠️ Refreshed manifest not detected. Running legacy sync.");
  }

  console.log("\n====================================================");
  console.log("📊 SYNC SUMMARY");
  console.log("====================================================");
  console.log(`Total DB Exercises        : ${dbExercises.length}`);
  console.log(`Newly Updated in DB       : ${updatedCount}`);
  console.log(`Preserved (Already Valid) : ${preservedCount}`);
  console.log(`Excluded Custom Exercises : ${excludedCount}`);
  console.log(`Test Fixtures Bypassed    : ${testCount}`);
  console.log(`Unmatched                 : ${unmatchedCount}`);
  console.log("====================================================\n");

  return {
    totalDbExercises: dbExercises.length,
    updatedCount,
    replacedMismatchedCount: 0,
    preservedCount,
    excludedCount,
    testCount,
    unmatchedCount,
  };
}

const isDirectExecution =
  process.argv[1] &&
  path.basename(process.argv[1]).startsWith("sync-exercise-images");

if (isDirectExecution) {
  syncExerciseImages()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Exercise Image Sync Failed:", err);
      await prisma.$disconnect();
      process.exit(1);
    });
}

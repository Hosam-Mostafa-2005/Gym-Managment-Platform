import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";

interface ManifestExerciseEntry {
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

interface ManifestData {
  collectionMetadata: Record<string, unknown>;
  exercises: ManifestExerciseEntry[];
}

// Known demonstrably wrong test upload URLs identified during Phase 1 audit
// (653a1cd9-64ed-4b64-b2c2-e00e1fe641fa.png is a Shopify watch promotional banner assigned to Deadlift111)
const KNOWN_MISMATCHED_IMAGE_PATTERNS = [
  "653a1cd9-64ed-4b64-b2c2-e00e1fe641fa.png",
];

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveExerciseImagesDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../exercise-images"),
    path.resolve(process.cwd(), "exercise-images"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "manifest.json"))) {
      return candidate;
    }
  }
  throw new Error(
    `Could not locate exercise-images/manifest.json in any expected path: ${candidates.join(", ")}`,
  );
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

async function uploadOrVerifyCloudinaryAsset(
  sourceFilePath: string,
  exerciseId: string,
): Promise<{ secureUrl: string; publicId: string }> {
  const folder = env.CLOUDINARY_FOLDER.replace(/^\/+|\/+$/g, "");
  const publicId = `${folder}/${exerciseId}`;

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Check if asset already exists in Cloudinary to keep runs fast & idempotent
  try {
    const existing = await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });
    if (existing && typeof existing.secure_url === "string") {
      return {
        secureUrl: existing.secure_url,
        publicId: existing.public_id,
      };
    }
  } catch {
    // Asset does not exist yet; proceed to upload
  }

  const uploaded = await cloudinary.uploader.upload(sourceFilePath, {
    public_id: exerciseId,
    folder,
    resource_type: "image",
    overwrite: true,
  });

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
}

function syncLocalUploadAsset(
  sourceFilePath: string,
  uploadsDir: string,
  exerciseId: string,
  ext: string,
): { imageUrl: string; storageKey: string; fileCopied: boolean } {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${exerciseId}.${ext}`;
  const destPath = path.join(uploadsDir, filename);

  const sourceStat = fs.statSync(sourceFilePath);
  let shouldCopy = true;

  if (fs.existsSync(destPath)) {
    const destStat = fs.statSync(destPath);
    if (destStat.size === sourceStat.size) {
      shouldCopy = false;
    }
  }

  if (shouldCopy) {
    fs.copyFileSync(sourceFilePath, destPath);
  }

  const baseUrl = env.PUBLIC_API_URL.replace(/\/+$/, "");
  return {
    imageUrl: `${baseUrl}/uploads/exercises/${filename}`,
    storageKey: `exercises/${filename}`,
    fileCopied: shouldCopy,
  };
}

export async function syncExerciseImages() {
  console.log("====================================================");
  console.log("🖼️  STREN — EXERCISE IMAGE MAPPING & DB SYNC");
  console.log("====================================================\n");

  const imagesDir = resolveExerciseImagesDir();
  const uploadsDir = resolveBackendUploadsDir();
  const manifestPath = path.join(imagesDir, "manifest.json");
  const manifest: ManifestData = JSON.parse(
    fs.readFileSync(manifestPath, "utf8"),
  );

  const useCloudinary = isCloudinaryConfigured();
  const activeProvider: "cloudinary" | "local" = useCloudinary
    ? "cloudinary"
    : "local";

  console.log(`📂 Source Library Dir : ${imagesDir}`);
  console.log(`📂 Local Uploads Dir  : ${uploadsDir}`);
  console.log(`☁️  Storage Provider   : ${activeProvider.toUpperCase()}`);
  console.log(
    `📋 Manifest Entries   : ${manifest.exercises.length} exercises\n`,
  );

  const dbExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  console.log(
    `🗄️  Database Exercises : ${dbExercises.length} records found in PostgreSQL\n`,
  );

  const byId = new Map<string, ManifestExerciseEntry>();
  const byExactName = new Map<string, ManifestExerciseEntry>();
  const byNormalizedName = new Map<string, ManifestExerciseEntry>();

  for (const entry of manifest.exercises) {
    byId.set(entry.exerciseId, entry);
    byExactName.set(entry.exerciseName, entry);
    byNormalizedName.set(normalizeName(entry.exerciseName), entry);
  }

  let matchedByIdCount = 0;
  let matchedByExactNameCount = 0;
  let matchedByNormalizedNameCount = 0;
  let updatedCount = 0;
  let preservedCount = 0;
  let replacedMismatchedCount = 0;
  let unmatchedCount = 0;
  const unmatchedExercises: { id: string; name: string; reason: string }[] = [];

  for (const dbEx of dbExercises) {
    // 1. Match by stable exercise ID first, then exact name, then verified normalized name
    let match = byId.get(dbEx.id);
    let matchMethod: "ID" | "EXACT_NAME" | "NORMALIZED_NAME" | null = null;

    if (match) {
      matchMethod = "ID";
      matchedByIdCount++;
    } else {
      const exactNameMatch = byExactName.get(dbEx.name);
      if (exactNameMatch) {
        match = exactNameMatch;
        matchMethod = "EXACT_NAME";
        matchedByExactNameCount++;
      } else {
        const normMatch = byNormalizedName.get(normalizeName(dbEx.name));
        if (normMatch) {
          // Verify equipment or primary muscle overlap before accepting normalized match
          const hasMuscleOverlap = dbEx.primaryMuscles.some((m) =>
            normMatch.primaryMuscles
              .map((pm) => pm.toLowerCase())
              .includes(m.toLowerCase()),
          );
          if (hasMuscleOverlap) {
            match = normMatch;
            matchMethod = "NORMALIZED_NAME";
            matchedByNormalizedNameCount++;
          }
        }
      }
    }

    if (!match) {
      unmatchedCount++;
      unmatchedExercises.push({
        id: dbEx.id,
        name: dbEx.name,
        reason: "No verified match in manifest.json",
      });
      console.warn(`⚠️  [UNMATCHED] ${dbEx.name} (${dbEx.id})`);
      continue;
    }

    const sourceFilePath = path.join(imagesDir, match.imageFilename);
    if (!fs.existsSync(sourceFilePath)) {
      unmatchedCount++;
      unmatchedExercises.push({
        id: dbEx.id,
        name: dbEx.name,
        reason: `Source file missing on disk: ${match.imageFilename}`,
      });
      console.warn(
        `⚠️  [FILE MISSING] ${dbEx.name} -> ${match.imageFilename}`,
      );
      continue;
    }

    const ext = path
      .extname(match.imageFilename)
      .toLowerCase()
      .replace(/^\./, "");

    // Always ensure local uploads directory has the synced asset by stable ID
    const localSync = syncLocalUploadAsset(
      sourceFilePath,
      uploadsDir,
      dbEx.id,
      ext,
    );

    let targetImageUrl = localSync.imageUrl;
    let storageKey = localSync.storageKey;

    if (useCloudinary) {
      const cloudSync = await uploadOrVerifyCloudinaryAsset(
        sourceFilePath,
        dbEx.id,
      );
      targetImageUrl = cloudSync.secureUrl;
      storageKey = cloudSync.publicId;
    }

    const currentUrl = dbEx.imageUrl?.trim() || null;
    const isKnownMismatched =
      currentUrl !== null &&
      KNOWN_MISMATCHED_IMAGE_PATTERNS.some((pattern) =>
        currentUrl.includes(pattern),
      );

    // If currentUrl already equals targetImageUrl, preserve without redundant DB write
    if (currentUrl === targetImageUrl && !isKnownMismatched) {
      preservedCount++;
      match.mappedImageUrl = targetImageUrl;
      match.storageKey = storageKey;
      match.storageProvider = activeProvider;
      console.log(
        `✅ [PRESERVED] ${dbEx.name} (${matchMethod}) -> ${targetImageUrl}`,
      );
      continue;
    }

    // Update ONLY Exercise.imageUrl by stable ID
    await prisma.exercise.update({
      where: { id: dbEx.id },
      data: {
        imageUrl: targetImageUrl,
      },
    });

    if (isKnownMismatched) {
      replacedMismatchedCount++;
      console.log(
        `🔄 [REPLACED MISMATCHED] ${dbEx.name} (${matchMethod}): ${currentUrl} -> ${targetImageUrl}`,
      );
    } else {
      updatedCount++;
      console.log(
        `✨ [UPDATED] ${dbEx.name} (${matchMethod}) -> ${targetImageUrl}`,
      );
    }

    match.mappedImageUrl = targetImageUrl;
    match.storageKey = storageKey;
    match.storageProvider = activeProvider;
  }

  // Clean up known mismatched test file if no longer referenced in DB
  for (const pattern of KNOWN_MISMATCHED_IMAGE_PATTERNS) {
    const stillReferenced = await prisma.exercise.count({
      where: {
        imageUrl: { contains: pattern },
      },
    });
    if (stillReferenced === 0) {
      const orphanPath = path.join(uploadsDir, pattern);
      if (fs.existsSync(orphanPath)) {
        fs.unlinkSync(orphanPath);
        console.log(`\n🧹 Removed unreferenced mismatched test file: ${pattern}`);
      }
    }
  }

  // Update manifest.json with mapped URLs and updated file sizes
  manifest.collectionMetadata = {
    ...manifest.collectionMetadata,
    lastDatabaseSyncAt: new Date().toISOString(),
    activeStorageProvider: activeProvider,
    totalDatabaseExercises: dbExercises.length,
    totalExercisesWithMappedImages:
      updatedCount + preservedCount + replacedMismatchedCount,
    unmatchedExercisesCount: unmatchedCount,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log("\n====================================================");
  console.log("📊 SYNC SUMMARY");
  console.log("====================================================");
  console.log(`Total DB Exercises        : ${dbExercises.length}`);
  console.log(`Matched by Stable ID      : ${matchedByIdCount}`);
  console.log(`Matched by Exact Name     : ${matchedByExactNameCount}`);
  console.log(`Matched by Norm. Name     : ${matchedByNormalizedNameCount}`);
  console.log(`Newly Updated in DB       : ${updatedCount}`);
  console.log(`Replaced Mismatched URLs  : ${replacedMismatchedCount}`);
  console.log(`Preserved (Already Valid) : ${preservedCount}`);
  console.log(`Unmatched / Null          : ${unmatchedCount}`);
  console.log("====================================================\n");

  return {
    totalDbExercises: dbExercises.length,
    matchedByIdCount,
    matchedByExactNameCount,
    matchedByNormalizedNameCount,
    updatedCount,
    replacedMismatchedCount,
    preservedCount,
    unmatchedCount,
    unmatchedExercises,
  };
}

// Execute when run directly as a script
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

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import type { ValidatedImageInfo } from "../utils/imageValidator.js";

export type StorageProviderType = "cloudinary" | "supabase" | "local";

export interface UploadResult {
  imageUrl: string;
  storageKey: string;
  provider: StorageProviderType;
}

const isRealCredential = (val: string | undefined): boolean => {
  if (!val) return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("your-") || trimmed === "changeme") return false;
  return true;
};

class StorageService {
  private uploadsRootDir = path.resolve(process.cwd(), "uploads");
  private exercisesDir = path.resolve(this.uploadsRootDir, "exercises");

  getActiveProvider(): StorageProviderType {
    const explicit = env.STORAGE_PROVIDER.toLowerCase().trim();

    const hasCloudinary =
      isRealCredential(env.CLOUDINARY_CLOUD_NAME) &&
      isRealCredential(env.CLOUDINARY_API_KEY) &&
      isRealCredential(env.CLOUDINARY_API_SECRET);

    const hasSupabase =
      isRealCredential(env.SUPABASE_URL) &&
      isRealCredential(env.SUPABASE_SERVICE_ROLE_KEY);

    if (explicit === "cloudinary") {
      if (hasCloudinary) return "cloudinary";
      if (env.NODE_ENV === "production") {
        throw new AppError(
          "Cloudinary storage is selected but CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET is missing.",
          500,
        );
      }
    }

    if (explicit === "supabase") {
      if (hasSupabase) return "supabase";
      if (env.NODE_ENV === "production") {
        throw new AppError(
          "Supabase storage is selected but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
          500,
        );
      }
    }

    if (explicit === "local") {
      return "local";
    }

    if (hasCloudinary) return "cloudinary";
    if (hasSupabase) return "supabase";

    if (env.NODE_ENV === "production") {
      throw new AppError(
        "No persistent cloud image storage provider is configured for production. Configure Cloudinary or Supabase Storage environment variables.",
        500,
      );
    }

    return "local";
  }

  private configureCloudinary() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadExerciseImage(
    buffer: Buffer,
    imageInfo: ValidatedImageInfo,
    requestBaseUrl?: string,
  ): Promise<UploadResult> {
    const provider = this.getActiveProvider();
    const uniqueId = crypto.randomUUID();

    if (provider === "cloudinary") {
      this.configureCloudinary();
      const folder = env.CLOUDINARY_FOLDER || "stren/exercises";

      return new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: uniqueId,
            resource_type: "image",
            overwrite: false,
            format: imageInfo.extension,
          },
          (error, result) => {
            if (error || !result?.secure_url) {
              return reject(
                new AppError(
                  `Failed to upload image to Cloudinary: ${error?.message || "Unknown error"}`,
                  502,
                ),
              );
            }

            resolve({
              imageUrl: result.secure_url,
              storageKey: result.public_id,
              provider: "cloudinary",
            });
          },
        );

        uploadStream.end(buffer);
      });
    }

    if (provider === "supabase") {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "exercises";
      const storageKey = `exercises/${uniqueId}.${imageInfo.extension}`;
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const uploadEndpoint = `${baseUrl}/storage/v1/object/${bucket}/${storageKey}`;

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": imageInfo.mimeType,
          "x-upsert": "false",
        },
        body: new Uint8Array(buffer),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "Upload error");
        throw new AppError(
          `Failed to upload image to Supabase Storage: ${errText}`,
          502,
        );
      }

      const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${storageKey}`;
      return {
        imageUrl: publicUrl,
        storageKey,
        provider: "supabase",
      };
    }

    // Persistent Local Disk Storage (for development/test or explicit local config)
    await fs.mkdir(this.exercisesDir, { recursive: true });
    const fileName = `${uniqueId}.${imageInfo.extension}`;
    const filePath = path.join(this.exercisesDir, fileName);

    await fs.writeFile(filePath, buffer);

    const effectiveBaseUrl = (requestBaseUrl || env.PUBLIC_API_URL).replace(
      /\/+$/,
      "",
    );
    const imageUrl = `${effectiveBaseUrl}/uploads/exercises/${fileName}`;

    return {
      imageUrl,
      storageKey: `exercises/${fileName}`,
      provider: "local",
    };
  }

  /**
   * Determines whether a URL belongs to our managed storage and extracts its provider & key.
   */
  parseManagedAsset(
    imageUrl: string | null | undefined,
  ): { provider: StorageProviderType; key: string } | null {
    if (!imageUrl || typeof imageUrl !== "string") return null;

    // 1. Check local uploads pattern: .../uploads/exercises/<uuid>.<ext>
    const localMatch = imageUrl.match(
      /\/uploads\/(exercises\/[0-9a-fA-F-]{36}\.(?:jpg|jpeg|png|webp))$/i,
    );
    if (localMatch && localMatch[1]) {
      return { provider: "local", key: localMatch[1] };
    }

    // 2. Check Cloudinary pattern: https://res.cloudinary.com/<cloud_name>/image/upload/(v12345/)?<folder>/<id>.<ext>
    if (imageUrl.includes("res.cloudinary.com")) {
      const folder = (env.CLOUDINARY_FOLDER || "stren/exercises").replace(
        /^\/+|\/+$/g,
        "",
      );
      const regex = new RegExp(
        `/image/upload/(?:v\\d+/)?(${folder}/[0-9a-fA-F-]{36})(?:\\.[a-z0-9]+)?$`,
        "i",
      );
      const match = imageUrl.match(regex);
      if (match && match[1]) {
        return { provider: "cloudinary", key: match[1] };
      }
    }

    // 3. Check Supabase pattern: .../storage/v1/object/public/<bucket>/(exercises/<uuid>.<ext>)
    const bucket = env.SUPABASE_STORAGE_BUCKET || "exercises";
    const supabaseRegex = new RegExp(
      `/storage/v1/object/public/${bucket}/(exercises/[0-9a-fA-F-]{36}\\.(?:jpg|jpeg|png|webp))$`,
      "i",
    );
    const supaMatch = imageUrl.match(supabaseRegex);
    if (supaMatch && supaMatch[1]) {
      return { provider: "supabase", key: supaMatch[1] };
    }

    return null;
  }

  /**
   * Deletes a managed asset directly from its storage backend.
   */
  async deleteManagedAsset(imageUrl: string | null | undefined): Promise<boolean> {
    const parsed = this.parseManagedAsset(imageUrl);
    if (!parsed) return false;

    try {
      if (parsed.provider === "local") {
        // Prevent any path traversal
        const normalizedRel = path.normalize(parsed.key);
        if (normalizedRel.startsWith("..") || path.isAbsolute(normalizedRel)) {
          return false;
        }
        const fullPath = path.resolve(this.uploadsRootDir, normalizedRel);
        if (!fullPath.startsWith(this.exercisesDir)) {
          return false;
        }
        await fs.unlink(fullPath).catch(() => {});
        return true;
      }

      if (parsed.provider === "cloudinary") {
        if (
          isRealCredential(env.CLOUDINARY_CLOUD_NAME) &&
          isRealCredential(env.CLOUDINARY_API_KEY) &&
          isRealCredential(env.CLOUDINARY_API_SECRET)
        ) {
          this.configureCloudinary();
          await cloudinary.uploader.destroy(parsed.key, {
            resource_type: "image",
          });
          return true;
        }
      }

      if (parsed.provider === "supabase") {
        if (
          isRealCredential(env.SUPABASE_URL) &&
          isRealCredential(env.SUPABASE_SERVICE_ROLE_KEY)
        ) {
          const bucket = env.SUPABASE_STORAGE_BUCKET || "exercises";
          const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
          await fetch(`${baseUrl}/storage/v1/object/${bucket}/${parsed.key}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            },
          }).catch(() => {});
          return true;
        }
      }
    } catch {
      // Never fail primary database operations if background storage cleanup encounters a transient error
      return false;
    }

    return false;
  }

  /**
   * Deletes a managed asset ONLY if no other exercise in the database references the same imageUrl.
   */
  async deleteIfUnused(
    imageUrl: string | null | undefined,
    excludeExerciseId?: string,
  ): Promise<boolean> {
    if (!imageUrl) return false;
    const parsed = this.parseManagedAsset(imageUrl);
    if (!parsed) return false;

    try {
      const referenceCount = await prisma.exercise.count({
        where: {
          imageUrl,
          ...(excludeExerciseId ? { id: { not: excludeExerciseId } } : {}),
        },
      });

      if (referenceCount > 0) {
        return false;
      }

      return await this.deleteManagedAsset(imageUrl);
    } catch {
      return false;
    }
  }
}

export default new StorageService();

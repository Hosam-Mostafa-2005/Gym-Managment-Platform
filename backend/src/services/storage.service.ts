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
  private avatarsDir = path.resolve(this.uploadsRootDir, "avatars");

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

  async uploadAvatarImage(
    buffer: Buffer,
    imageInfo: ValidatedImageInfo,
    userId: string,
    requestBaseUrl?: string,
  ): Promise<UploadResult> {
    const provider = this.getActiveProvider();
    const uniqueId = `${userId}-${crypto.randomUUID()}`;

    if (provider === "cloudinary") {
      this.configureCloudinary();
      const folder = "stren/avatars";

      return new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: uniqueId,
            resource_type: "image",
            overwrite: true,
            format: imageInfo.extension,
          },
          (error, result) => {
            if (error || !result?.secure_url) {
              return reject(
                new AppError(
                  `Failed to upload avatar to Cloudinary: ${error?.message || "Unknown error"}`,
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
      const bucket = "avatars";
      const storageKey = `avatars/${uniqueId}.${imageInfo.extension}`;
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const uploadEndpoint = `${baseUrl}/storage/v1/object/${bucket}/${storageKey}`;

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": imageInfo.mimeType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "Upload error");
        throw new AppError(
          `Failed to upload avatar to Supabase Storage: ${errText}`,
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

    // Persistent Local Disk Storage
    await fs.mkdir(this.avatarsDir, { recursive: true });
    const fileName = `${uniqueId}.${imageInfo.extension}`;
    const filePath = path.join(this.avatarsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const effectiveBaseUrl = (requestBaseUrl || env.PUBLIC_API_URL).replace(
      /\/+$/,
      "",
    );
    const imageUrl = `${effectiveBaseUrl}/uploads/avatars/${fileName}`;

    return {
      imageUrl,
      storageKey: `avatars/${fileName}`,
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

    // 1. Check local uploads pattern: .../uploads/(exercises|avatars)/...
    const localMatch = imageUrl.match(
      /\/uploads\/((?:exercises|avatars)\/[0-9a-zA-Z-_\.]+)$/i,
    );
    if (localMatch && localMatch[1]) {
      return { provider: "local", key: localMatch[1] };
    }

    // 2. Check Cloudinary pattern:
    // .../image/upload/(v12345/)?(stren/(?:exercises|avatars)/<id>)(?:.<ext>)?
    if (imageUrl.includes("res.cloudinary.com")) {
      const match = imageUrl.match(
        /\/image\/upload\/(?:v\d+\/)?((?:stren\/(?:exercises|avatars)|[0-9a-zA-Z-_]+)\/[0-9a-zA-Z-_]+)(?:\.[a-z0-9]+)?$/i,
      );
      if (match && match[1]) {
        return { provider: "cloudinary", key: match[1] };
      }
    }

    // 3. Check Supabase pattern
    const bucket = env.SUPABASE_STORAGE_BUCKET || "exercises";
    const supabaseRegex = new RegExp(
      `/storage/v1/object/public/(?:${bucket}|avatars)/((?:exercises|avatars)/[0-9a-zA-Z-_\\.]+)$`,
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
        const normalizedRel = path.normalize(parsed.key);
        if (normalizedRel.startsWith("..") || path.isAbsolute(normalizedRel)) {
          return false;
        }
        const fullPath = path.resolve(this.uploadsRootDir, normalizedRel);
        if (
          !fullPath.startsWith(this.exercisesDir) &&
          !fullPath.startsWith(this.avatarsDir)
        ) {
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
          const bucket = parsed.key.startsWith("avatars/")
            ? "avatars"
            : env.SUPABASE_STORAGE_BUCKET || "exercises";
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
      return false;
    }

    return false;
  }

  /**
   * Deletes a managed asset ONLY if no exercise and no user in the database references the same imageUrl.
   */
  async deleteIfUnused(
    imageUrl: string | null | undefined,
    excludeExerciseId?: string,
  ): Promise<boolean> {
    if (!imageUrl) return false;
    const parsed = this.parseManagedAsset(imageUrl);
    if (!parsed) return false;

    try {
      const [exerciseCount, userAvatarCount] = await Promise.all([
        prisma.exercise.count({
          where: {
            imageUrl,
            ...(excludeExerciseId ? { id: { not: excludeExerciseId } } : {}),
          },
        }),
        prisma.user.count({
          where: {
            avatarUrl: imageUrl,
          },
        }),
      ]);

      if (exerciseCount > 0 || userAvatarCount > 0) {
        return false;
      }

      return await this.deleteManagedAsset(imageUrl);
    } catch {
      return false;
    }
  }
}

export default new StorageService();

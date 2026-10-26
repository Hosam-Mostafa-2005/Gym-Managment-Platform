import AppError from "./AppError.js";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export interface ValidatedImageInfo {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  size: number;
}

/**
 * Inspects the binary magic bytes of a buffer to determine the actual image format.
 */
export function detectImageSignature(
  buffer: Buffer,
): { mimeType: "image/jpeg" | "image/png" | "image/webp"; extension: "jpg" | "png" | "webp" } | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // JPEG: FF D8 FF
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: "png" };
  }

  // WEBP: "RIFF" at 0..3 and "WEBP" at 8..11
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

/**
 * Validates image buffer size, declared MIME type, and actual binary magic bytes.
 */
export function validateImageBuffer(
  buffer: Buffer | undefined,
  declaredMimeType: string | undefined,
): ValidatedImageInfo {
  if (!buffer || buffer.length === 0) {
    throw new AppError("No image file provided.", 400);
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Image file size exceeds the 5 MB limit.", 400);
  }

  const normalizedMime = (declaredMimeType || "").toLowerCase().trim();
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      normalizedMime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw new AppError(
      "Unsupported file type. Only JPG, JPEG, PNG, and WEBP images are allowed.",
      400,
    );
  }

  const detected = detectImageSignature(buffer);
  if (!detected) {
    throw new AppError(
      "Invalid or corrupted image file content. Only valid JPG, PNG, and WEBP images are allowed.",
      400,
    );
  }

  const expectedCanonicalMime =
    normalizedMime === "image/jpg" ? "image/jpeg" : normalizedMime;

  if (detected.mimeType !== expectedCanonicalMime) {
    throw new AppError(
      "File content does not match declared image MIME type.",
      400,
    );
  }

  return {
    mimeType: detected.mimeType,
    extension: detected.extension,
    size: buffer.length,
  };
}

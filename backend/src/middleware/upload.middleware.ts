import type { RequestHandler } from "express";
import multer from "multer";
import AppError from "../utils/AppError.js";
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  validateImageBuffer,
} from "../utils/imageValidator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const normalized = (file.mimetype || "").toLowerCase().trim();
    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        normalized as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      )
    ) {
      return cb(
        new AppError(
          "Unsupported file type. Only JPG, JPEG, PNG, and WEBP images are allowed.",
          400,
        ),
      );
    }
    cb(null, true);
  },
});

export const uploadExerciseImageMiddleware: RequestHandler = (
  req,
  res,
  next,
) => {
  const singleUpload = upload.single("image");

  singleUpload(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("Image file size exceeds the 5 MB limit.", 400),
          );
        }
        return next(new AppError(err.message || "File upload error.", 400));
      }
      if (err instanceof AppError) {
        return next(err);
      }
      return next(new AppError("Invalid file upload request.", 400));
    }

    if (!req.file) {
      return next(new AppError("No image file provided.", 400));
    }

    try {
      const validated = validateImageBuffer(
        req.file.buffer,
        req.file.mimetype,
      );
      req.validatedImageInfo = validated;
      next();
    } catch (validationError) {
      next(validationError);
    }
  });
};

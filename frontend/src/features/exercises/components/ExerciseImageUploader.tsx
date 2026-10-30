import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  deleteStagedExerciseImage,
  uploadExerciseImage,
} from "../api/exercises.api";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export interface ExerciseImageUploaderProps {
  value?: string | null;
  onChange: (imageUrl: string) => void;
  exerciseId?: string;
  onUploadingChange?: (isUploading: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export const ExerciseImageUploader: React.FC<ExerciseImageUploaderProps> = ({
  value,
  onChange,
  exerciseId,
  onUploadingChange,
  error: externalError,
  disabled = false,
}) => {
  const { t } = useTranslation(["exercises"]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stagedUploadedUrlRef = useRef<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const updateUploadingState = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    setImageLoadError(false);
  }, [value]);

  const validateFile = (file: File): string | null => {
    const normalizedType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(normalizedType)) {
      return t(
        "create.uploader.errors.unsupportedFormat",
        "Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.",
      );
    }
    if (file.size <= 0) {
      return t(
        "create.uploader.errors.fileEmpty",
        "The selected file is empty.",
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return t("create.uploader.errors.fileTooLarge", {
        size: sizeMb,
        defaultValue: `Image size (${sizeMb} MB) exceeds the 5 MB maximum limit.`,
      });
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;

    setValidationError(null);
    setImageLoadError(false);

    const validation = validateFile(file);
    if (validation) {
      setValidationError(validation);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);
    setSelectedFileName(file.name);
    setUploadProgress(0);
    updateUploadingState(true);

    abortControllerRef.current = new AbortController();

    try {
      const res = await uploadExerciseImage(file, {
        exerciseId,
        onProgress: (progress) => setUploadProgress(progress),
        signal: abortControllerRef.current?.signal,
      });

      if (res?.imageUrl) {
        stagedUploadedUrlRef.current = res.imageUrl;
        onChange(res.imageUrl);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError" || (err as Error)?.name === "CanceledError") {
        return;
      }
      const errMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to upload image. Please try again.";

      setValidationError(errMessage);
      setLocalPreviewUrl(null);
      setSelectedFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      updateUploadingState(false);
      abortControllerRef.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const triggerFilePicker = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUploading) return;

    const currentUrl = stagedUploadedUrlRef.current || value;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setSelectedFileName(null);
    setValidationError(null);
    setImageLoadError(false);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (currentUrl && !exerciseId) {
      try {
        await deleteStagedExerciseImage(currentUrl);
        stagedUploadedUrlRef.current = null;
      } catch {
        // Staged cleanup failure is non-fatal
      }
    }
  };

  const displayPreviewUrl = localPreviewUrl || (value ? value.trim() : "");
  const activeError = validationError || externalError;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-[#5BE584]" />
          {t("create.uploader.label", "Exercise Image")}{" "}
          <span className="text-[10px] text-[#6B7280] font-normal">
            {t("create.uploader.optional", "(Optional)")}
          </span>
        </label>
        {displayPreviewUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="text-[11px] text-[#9CA3AF] hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />{" "}
            {t("create.uploader.removeImage", "Remove Image")}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!displayPreviewUrl ? (
        <div
          role="button"
          tabIndex={0}
          onClick={triggerFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              triggerFilePicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-7 text-center transition-all duration-200 cursor-pointer select-none ${
            isDragging
              ? "border-[#5BE584] bg-[#5BE584]/10 shadow-[0_0_25px_rgba(91,229,132,0.12)]"
              : activeError
                ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
                : "border-[#1E2329] bg-[#101418]/90 hover:border-[#5BE584]/50 hover:bg-[#13181E]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              isDragging
                ? "border-[#5BE584]/40 bg-[#5BE584]/20 text-[#5BE584]"
                : "border-[#1E2329] bg-[#0D1014] text-[#9CA3AF] group-hover:border-[#5BE584]/30 group-hover:text-[#5BE584]"
            }`}
          >
            <UploadCloud className="h-5 w-5" />
          </div>

          <p className="text-xs font-medium text-[#F3F4F6]">
            <span className="text-[#5BE584] font-semibold group-hover:underline">
              {t("create.uploader.clickToUpload", "Click to upload")}
            </span>{" "}
            {t("create.uploader.orDragAndDrop", "or drag and drop")}
          </p>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            {t("create.uploader.hint", "JPG, JPEG, PNG, or WEBP (max 5 MB)")}
          </p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-xl border bg-[#0D1014] p-2.5 transition-colors ${
            isDragging ? "border-[#5BE584] bg-[#5BE584]/5" : "border-[#1E2329]"
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5BE584] shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] truncate">
                {isUploading
                  ? `${t("create.uploader.uploading", "Uploading")}${selectedFileName ? ` ${selectedFileName}` : ""} (${uploadProgress}%)`
                  : selectedFileName ||
                    t(
                      "create.uploader.previewTitle",
                      "Exercise Image Preview",
                    )}
              </span>
            </div>

            {!isUploading && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-md border border-[#1E2329] bg-[#101418] px-2.5 py-1 text-[11px] font-medium text-[#F3F4F6] hover:border-[#5BE584]/40 hover:text-[#5BE584] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t("create.uploader.replace", "Replace")}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-md border border-[#1E2329] bg-[#101418] px-2.5 py-1 text-[11px] font-medium text-[#9CA3AF] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {t("create.uploader.remove", "Remove")}
                </button>
              </div>
            )}
          </div>

          {imageLoadError && !localPreviewUrl ? (
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-red-500/30 bg-red-500/5 text-center p-4">
              <AlertCircle className="h-5 w-5 text-red-400 mb-1" />
              <p className="text-xs font-medium text-red-300">
                {t(
                  "create.uploader.unableToLoad",
                  "Unable to load stored image preview",
                )}
              </p>
              <button
                type="button"
                onClick={triggerFilePicker}
                className="mt-2 rounded-md bg-[#1E2329] px-3 py-1 text-[11px] font-medium text-[#F3F4F6] hover:bg-[#2A3039]"
              >
                {t("create.uploader.uploadNew", "Upload New Image")}
              </button>
            </div>
          ) : (
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-[#2A313A] bg-white">
              <img
                src={displayPreviewUrl}
                alt={t(
                  "create.uploader.previewTitle",
                  "Exercise Image Preview",
                )}
                className={`h-full w-full object-contain p-2 transition-all duration-300 ${
                  isUploading ? "opacity-50 scale-[0.99]" : "hover:scale-[1.02]"
                }`}
                onError={() => setImageLoadError(true)}
              />

              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D1014]/70 backdrop-blur-[2px] p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#5BE584] mb-2" />
                  <div className="w-48 max-w-full overflow-hidden rounded-full bg-[#1E2329] h-1.5">
                    <div
                      className="bg-[#5BE584] h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="mt-1.5 text-[11px] font-semibold text-[#F3F4F6]">
                    {t("create.uploader.uploading", "Uploading")}... {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeError && (
        <p className="text-[11px] font-medium text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
};

export default ExerciseImageUploader;

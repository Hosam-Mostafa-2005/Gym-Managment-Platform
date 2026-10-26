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

  // Revoke local object URL when unmounting or changing preview
  // Abort an in-flight upload only when the component unmounts
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Revoke the previous local preview URL when it changes or unmounts
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
      return "Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.";
    }
    if (file.size <= 0) {
      return "The selected file is empty.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return `Image size (${sizeMb} MB) exceeds the 5 MB maximum limit.`;
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;

    setValidationError(null);
    setImageLoadError(false);

    const fileError = validateFile(file);
    if (fileError) {
      setValidationError(fileError);
      return;
    }

    // If a staged image was already uploaded during this session and is being replaced before saving, clean it up
    const previousStagedUrl = stagedUploadedUrlRef.current;

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setSelectedFileName(file.name);
    setUploadProgress(0);
    updateUploadingState(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await uploadExerciseImage(file, {
        exerciseId,
        onProgress: (percent) => setUploadProgress(percent),
        signal: abortController.signal,
      });

      if (previousStagedUrl && previousStagedUrl !== response.imageUrl) {
        void deleteStagedExerciseImage(previousStagedUrl);
      }

      stagedUploadedUrlRef.current = response.imageUrl;
      setUploadProgress(100);
      onChange(response.imageUrl);
    } catch (err: unknown) {
      // Revert local preview on upload failure
      URL.revokeObjectURL(objectUrl);
      setLocalPreviewUrl(null);
      setSelectedFileName(null);

      const axiosMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : err instanceof Error
            ? err.message
            : "Failed to upload exercise image. Please try again.";

      setValidationError(axiosMessage);
    } finally {
      updateUploadingState(false);
      abortControllerRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      void handleFileSelect(droppedFiles[0]);
    }
  };

  const handleRemoveImage = () => {
    if (isUploading) {
      abortControllerRef.current?.abort();
      updateUploadingState(false);
    }

    if (stagedUploadedUrlRef.current) {
      const stagedToDelete = stagedUploadedUrlRef.current;
      stagedUploadedUrlRef.current = null;
      void deleteStagedExerciseImage(stagedToDelete);
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }

    setSelectedFileName(null);
    setValidationError(null);
    setImageLoadError(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange("");
  };

  const triggerFilePicker = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayPreviewUrl = localPreviewUrl || (value ? value.trim() : "");
  const activeError = validationError || externalError;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-[#5BE584]" />
          Exercise Image{" "}
          <span className="text-[10px] text-[#6B7280] font-normal">
            (Optional)
          </span>
        </label>
        {displayPreviewUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="text-[11px] text-[#9CA3AF] hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Remove Image
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
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            JPG, JPEG, PNG, or WEBP (max 5 MB)
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
                  ? `Uploading${selectedFileName ? ` ${selectedFileName}` : ""} (${uploadProgress}%)`
                  : selectedFileName || "Exercise Image Preview"}
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
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-md border border-[#1E2329] bg-[#101418] px-2.5 py-1 text-[11px] font-medium text-[#9CA3AF] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            )}
          </div>

          {imageLoadError && !localPreviewUrl ? (
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-red-500/30 bg-red-500/5 text-center p-4">
              <AlertCircle className="h-5 w-5 text-red-400 mb-1" />
              <p className="text-xs font-medium text-red-300">
                Unable to load stored image preview
              </p>
              <button
                type="button"
                onClick={triggerFilePicker}
                className="mt-2 rounded-md bg-[#1E2329] px-3 py-1 text-[11px] font-medium text-[#F3F4F6] hover:bg-[#2A3039]"
              >
                Upload New Image
              </button>
            </div>
          ) : (
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-[#2A313A] bg-white">
              <img
                src={displayPreviewUrl}
                alt="Exercise Preview"
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
                    Uploading... {uploadProgress}%
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

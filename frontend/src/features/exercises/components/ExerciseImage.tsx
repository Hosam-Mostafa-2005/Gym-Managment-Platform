import React, { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

export type ExerciseImageSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "banner"
  | "custom";

export interface ExerciseImageProps {
  src?: string | null;
  alt: string;
  size?: ExerciseImageSize;
  fit?: "auto" | "contain" | "cover";
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
  priority?: boolean;
  interactive?: boolean;
}

const SIZE_CLASSES: Record<Exclude<ExerciseImageSize, "custom">, string> = {
  xs: "h-9 w-9 rounded-lg",
  sm: "h-12 w-14 rounded-xl",
  md: "h-16 w-20 rounded-xl",
  lg: "h-24 w-32 rounded-xl",
  xl: "h-28 w-36 sm:h-32 sm:w-44 rounded-2xl",
  banner: "h-52 sm:h-64 w-full rounded-2xl",
};

const ICON_SIZES: Record<Exclude<ExerciseImageSize, "custom">, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
  banner: "h-10 w-10",
};

function isIllustrationUrl(url: string): boolean {
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".svg") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.includes("/illustrations/") ||
    cleanUrl.includes("exercise-")
  );
}

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  src,
  alt,
  size = "md",
  fit = "auto",
  className = "",
  imgClassName = "",
  fallbackLabel,
  priority = false,
  interactive = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const trimmedSrc = src?.trim() || "";

  useEffect(() => {
    setHasError(false);
  }, [trimmedSrc]);

  const sizeClass = size === "custom" ? "" : SIZE_CLASSES[size];
  const iconSizeClass = size === "custom" ? "h-6 w-6" : ICON_SIZES[size];

  if (!trimmedSrc || hasError) {
    return (
      <div
        className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden border border-[#1E2329] bg-[#13181E] text-[#6B7280] select-none ${sizeClass} ${className}`}
        title={alt}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5BE584]/10 border border-[#5BE584]/20 text-[#5BE584]">
          <Dumbbell className={iconSizeClass} />
        </div>
        {fallbackLabel && (
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  const isIllustration =
    fit === "contain" ||
    fit === "auto" ||
    isIllustrationUrl(trimmedSrc);

  const resolvedFitClass = isIllustration
    ? "object-contain object-center p-1.5"
    : "object-cover object-center";

  const hoverScaleClass = interactive
    ? isIllustration
      ? "transition-transform duration-300 group-hover:scale-[1.04]"
      : "transition-transform duration-300 group-hover:scale-105"
    : "";

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-[#2A313A]/80 bg-white shadow-sm select-none flex items-center justify-center ${sizeClass} ${className}`}
    >
      <img
        src={trimmedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setHasError(true)}
        className={`h-full w-full ${resolvedFitClass} ${hoverScaleClass} ${imgClassName}`}
      />
    </div>
  );
};

export default ExerciseImage;

// src/features/profile/components/shared/ProfileAvatar.tsx
import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";

interface ProfileAvatarProps {
  name: string;
  image?: string | null;
  isActive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onEdit?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  image,
  isActive = true,
  size = "md",
  editable = false,
  onEdit,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [image]);

  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-16 w-16 text-lg",
    xl: "h-20 w-20 text-xl",
  };

  const getInitials = (str: string) => {
    return str
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const showImage = Boolean(image) && !imgError;

  return (
    <div className="relative shrink-0 group">
      <div
        onClick={editable ? onEdit : undefined}
        className={`relative overflow-hidden rounded-xl border border-[#23422e] bg-[#16291d] flex items-center justify-center text-[#5BE584] shadow-lg transition-transform ${
          editable ? "cursor-pointer hover:scale-105 hover:border-[#5BE584]" : ""
        } ${sizeClasses[size]}`}
        title={editable ? "Click to change profile picture" : undefined}
      >
        {showImage ? (
          <img
            src={image!}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-bold tracking-wider">
            {getInitials(name || "User")}
          </span>
        )}

        {editable && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            <Camera className="h-4 w-4" />
          </div>
        )}
      </div>

      {editable ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#5BE584] text-[#090B0F] flex items-center justify-center shadow-md hover:bg-[#49D472] transition-colors"
          title="Change profile picture"
        >
          <Camera className="h-3 w-3" />
        </button>
      ) : (
        <div
          className={`absolute bottom-0.5 right-0.5 rounded-full ring-2 ring-[#0d1014] ${
            isActive ? "bg-emerald-400" : "bg-gray-500"
          } ${size === "sm" ? "h-2 w-2" : "h-3 w-3"}`}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;

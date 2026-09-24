// src/features/profile/components/shared/ProfileAvatar.tsx
import React from "react";

interface ProfileAvatarProps {
  name: string;
  image?: string | null;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  image,
  isActive = true,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-16 w-16 text-lg",
  };

  const getInitials = (str: string) => {
    return str
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-[#23422e] bg-[#16291d] flex items-center justify-center text-[#5BE584] shadow-lg ${sizeClasses[size]}`}
    >
      {image ? (
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-bold tracking-wider">
          {getInitials(name || "User")}
        </span>
      )}
      <div
        className={`absolute bottom-0.5 right-0.5 rounded-full ring-2 ring-[#0d1014] ${isActive ? "bg-emerald-400" : "bg-gray-500"} ${size === "sm" ? "h-2 w-2" : "h-3 w-3"}`}
      />
    </div>
  );
};

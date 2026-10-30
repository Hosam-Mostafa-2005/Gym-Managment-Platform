import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

interface AvatarUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userName?: string;
}

export const AvatarUploadDialog: React.FC<AvatarUploadDialogProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName = "User",
}) => {
  const { t } = useTranslation(["profile"]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("avatarDialog.errors.sizeExceeded"));
      return;
    }

    // Validate format
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError(t("avatarDialog.errors.unsupportedFormat"));
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await api.post<{
        status: string;
        data: { user: any };
      }>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser && user) {
        setUser({ ...user, avatarUrl: updatedUser.avatarUrl });
      }

      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.invalidateQueries({ queryKey: ["member-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["coach-profile"] });

      toast.success(t("avatarDialog.toasts.updateSuccess"));
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t("avatarDialog.errors.uploadFailed"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await api.delete<{
        status: string;
        data: { user: any };
      }>("/users/me/avatar");

      const updatedUser = response.data?.data?.user;
      if (user) {
        setUser({ ...user, avatarUrl: null });
      }

      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.invalidateQueries({ queryKey: ["member-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["coach-profile"] });

      toast.success(t("avatarDialog.toasts.removeSuccess"));
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t("avatarDialog.errors.deleteFailed"),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const displayImage = previewUrl || currentAvatarUrl;

  useEffect(() => {
    setPreviewError(false);
  }, [displayImage]);

  const getInitials = (str: string) => {
    return str
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const showPreview = Boolean(displayImage) && !previewError;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#1E2329] bg-[#0D1014] text-[#F3F4F6] sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#5BE584]">
            <Camera className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold text-white">
              {t("avatarDialog.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#9CA3AF]">
            {t("avatarDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Center Preview Avatar */}
        <div className="flex flex-col items-center justify-center my-4 space-y-3">
          <div className="relative h-28 w-28 rounded-2xl border-2 border-[#2A3039] bg-[#141920] overflow-hidden shadow-2xl flex items-center justify-center text-[#5BE584]">
            {showPreview ? (
              <img
                src={displayImage!}
                alt={userName}
                className="h-full w-full object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <span className="font-extrabold text-2xl tracking-wider">
                {getInitials(userName)}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#6B7280]">
            {selectedFile
              ? t("avatarDialog.selected", { fileName: selectedFile.name })
              : currentAvatarUrl
                ? t("avatarDialog.currentPicture")
                : t("avatarDialog.noPicture")}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-[#2A3039] bg-[#141920] hover:bg-[#1E2329] text-white text-xs font-semibold"
          >
            <Upload className="h-4 w-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {displayImage
              ? t("avatarDialog.chooseDifferent")
              : t("avatarDialog.selectPhoto")}
          </Button>

          {selectedFile && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] text-xs font-bold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                  {t("avatarDialog.uploading")}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                  {t("avatarDialog.savePicture")}
                </>
              )}
            </Button>
          )}

          {currentAvatarUrl && !selectedFile && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                  {t("avatarDialog.removing")}
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                  {t("avatarDialog.removePicture")}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploadDialog;

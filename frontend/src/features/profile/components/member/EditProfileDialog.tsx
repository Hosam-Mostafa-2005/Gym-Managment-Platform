// src/features/profile/components/member/EditProfileDialog.tsx
import React, { useState, useEffect } from "react";
import { User, Phone, FileText, Target, Dumbbell, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUpdateMemberProfile } from "../../hooks/use-update-member-profile";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: {
    name: string;
    phone?: string | null;
    bio?: string | null;
    fitnessGoal?: string | null;
    experienceLevel?: string | null;
  };
}

const FITNESS_GOAL_IDS = [
  "STRENGTH_HYPERTROPHY",
  "FAT_LOSS_LEANING",
  "ATHLETIC_PERFORMANCE",
  "HEALTH_LONGEVITY",
];

const EXPERIENCE_LEVEL_IDS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  memberId,
  initialData,
}) => {
  const { t } = useTranslation(["profile"]);
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [fitnessGoal, setFitnessGoal] = useState(initialData.fitnessGoal || "");
  const [experienceLevel, setExperienceLevel] = useState(
    initialData.experienceLevel || "",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate, isPending } = useUpdateMemberProfile(memberId);

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name || "");
      setPhone(initialData.phone || "");
      setBio(initialData.bio || "");
      setFitnessGoal(initialData.fitnessGoal || "");
      setExperienceLevel(initialData.experienceLevel || "");
      setErrorMessage(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(t("member.editDialog.nameRequired"));
      return;
    }

    setErrorMessage(null);
    mutate(
      {
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
        fitnessGoal: fitnessGoal.trim() ? fitnessGoal.trim() : null,
        experienceLevel: experienceLevel.trim() ? experienceLevel.trim() : null,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(
            err.response?.data?.message ||
              err.message ||
              t("member.editDialog.updateFailed"),
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[#1E2329] bg-[#0D1014] p-6 shadow-2xl relative text-[#F3F4F6] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2329]">
          <div>
            <h2 className="text-lg font-bold text-white">
              {t("member.editDialog.title")}
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              {t("member.editDialog.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("member.editDialog.cancel")}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#1E2329] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              {t("member.editDialog.fullName")} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                placeholder={t("member.editDialog.fullNamePlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              {t("member.editDialog.phone")}
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                placeholder={t("member.editDialog.phonePlaceholder")}
              />
            </div>
          </div>

          {/* Primary Fitness Goal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#5BE584]" />
              {t("member.editDialog.fitnessGoal")}
            </label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="w-full rounded-xl border border-[#1E2329] bg-[#101418] px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
            >
              <option value="">{t("member.editDialog.selectGoal")}</option>
              {FITNESS_GOAL_IDS.map((id) => (
                <option key={id} value={id}>
                  {t(`member.goals.${id}` as any)}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#5BE584]" />
              {t("member.editDialog.experienceLevel")}
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full rounded-xl border border-[#1E2329] bg-[#101418] px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
            >
              <option value="">{t("member.editDialog.selectExperience")}</option>
              {EXPERIENCE_LEVEL_IDS.map((id) => (
                <option key={id} value={id}>
                  {t(`member.experience.${id}` as any)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#5BE584]" />
              {t("member.editDialog.bio")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#1E2329] bg-[#101418] p-3 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors resize-none"
              placeholder={t("member.editDialog.bioPlaceholder")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end rtl:justify-start gap-3 pt-4 border-t border-[#1E2329]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
            >
              {t("member.editDialog.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? t("member.editDialog.saving") : t("member.editDialog.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileDialog;

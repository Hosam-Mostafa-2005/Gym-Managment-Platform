// src/features/profile/components/coach/EditCoachProfileDialog.tsx
import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  FileText,
  Briefcase,
  Award,
  Globe,
  BookOpen,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { useUpdateCoachProfile } from "../../hooks/use-update-coach-profile";
import type { CoachProfileDetails } from "../../types/profile.types";

interface EditCoachProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: CoachProfileDetails;
}

const COMMON_SPECIALTIES = [
  "Strength Training",
  "Hypertrophy",
  "Powerlifting",
  "Weight Loss",
  "Athletic Conditioning",
  "Mobility & Rehab",
  "Olympic Weightlifting",
  "Kettlebell Protocols",
];

const COMMON_CERTIFICATIONS = [
  "CSCS (NSCA)",
  "NASM-CPT",
  "ISSA-CPT",
  "USAW Level 1",
  "CrossFit Level 2",
  "ACSM-EP",
  "Precision Nutrition L1",
];

const COMMON_LANGUAGES = [
  "English",
  "Arabic",
  "Spanish",
  "French",
  "German",
  "Russian",
];

export const EditCoachProfileDialog: React.FC<EditCoachProfileDialogProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [professionalTitle, setProfessionalTitle] = useState(
    initialData.professionalTitle || "",
  );
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(
    initialData.yearsOfExperience || 0,
  );
  const [phone, setPhone] = useState(initialData.phone || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [coachingPhilosophy, setCoachingPhilosophy] = useState(
    initialData.coachingPhilosophy || "",
  );

  const [specialties, setSpecialties] = useState<string[]>(
    initialData.specialties || [],
  );
  const [certifications, setCertifications] = useState<string[]>(
    initialData.certifications || [],
  );
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(
    initialData.languagesSpoken || [],
  );

  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newLang, setNewLang] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate, isPending } = useUpdateCoachProfile();

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name || "");
      setProfessionalTitle(initialData.professionalTitle || "");
      setYearsOfExperience(initialData.yearsOfExperience || 0);
      setPhone(initialData.phone || "");
      setBio(initialData.bio || "");
      setCoachingPhilosophy(initialData.coachingPhilosophy || "");
      setSpecialties(initialData.specialties || []);
      setCertifications(initialData.certifications || []);
      setLanguagesSpoken(initialData.languagesSpoken || []);
      setErrorMessage(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddSpecialty = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (item: string) => {
    setSpecialties(specialties.filter((s) => s !== item));
  };

  const handleAddCert = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCert("");
    }
  };

  const handleRemoveCert = (item: string) => {
    setCertifications(certifications.filter((c) => c !== item));
  };

  const handleAddLang = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !languagesSpoken.includes(trimmed)) {
      setLanguagesSpoken([...languagesSpoken, trimmed]);
      setNewLang("");
    }
  };

  const handleRemoveLang = (item: string) => {
    setLanguagesSpoken(languagesSpoken.filter((l) => l !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Full name cannot be empty.");
      return;
    }

    setErrorMessage(null);
    mutate(
      {
        name: name.trim(),
        professionalTitle: professionalTitle.trim() ? professionalTitle.trim() : null,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        phone: phone.trim() ? phone.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
        coachingPhilosophy: coachingPhilosophy.trim()
          ? coachingPhilosophy.trim()
          : null,
        specialties,
        certifications,
        languagesSpoken,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(
            err.response?.data?.message ||
              err.message ||
              "Failed to update coach profile.",
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#1E2329] bg-[#0D1014] shadow-2xl relative text-[#F3F4F6] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#1E2329] sticky top-0 bg-[#0D1014] z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#5BE584]" />
              Edit Coach Profile
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Update your professional credentials, coaching bio, and specialty areas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#1E2329] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          <form id="edit-coach-form" onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Basic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                    placeholder="Coach full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
                  Professional Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                    placeholder="e.g. Senior Strength & Conditioning Specialist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                    placeholder="e.g. +1 (555) 012-3456"
                  />
                </div>
              </div>
            </div>

            {/* 2. Professional Bio */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5BE584]" />
                  Coach Biography
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] p-3 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors resize-none"
                placeholder="Highlight your coaching experience, client success stories, and training method..."
              />
            </div>

            {/* 3. Coaching Philosophy */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#5BE584]" />
                  Coaching Philosophy
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>
              <textarea
                value={coachingPhilosophy}
                onChange={(e) => setCoachingPhilosophy(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] p-3 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors resize-none"
                placeholder="e.g. Evidence-based periodization with long-term joint health and biomechanics at the core."
              />
            </div>

            {/* 4. Core Specialties */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Core Specialties</span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {specialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16291D] border border-[#23422E] text-xs font-medium text-[#5BE584]"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(spec)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSpecialty(newSpecialty);
                    }
                  }}
                  placeholder="Add custom specialty (press Enter)..."
                  className="flex-1 rounded-xl border border-[#1E2329] bg-[#101418] px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddSpecialty(newSpecialty)}
                  className="px-3 py-2 rounded-xl border border-[#1E2329] bg-[#161B22] text-xs text-gray-300 hover:text-white hover:border-[#5BE584] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_SPECIALTIES.filter((s) => !specialties.includes(s)).map(
                  (spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleAddSpecialty(spec)}
                      className="text-[11px] px-2 py-0.5 rounded border border-[#1E2329] bg-[#101418] text-gray-400 hover:text-[#5BE584] hover:border-[#5BE584]/40 transition-colors"
                    >
                      + {spec}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* 5. Certifications */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#5BE584]" />
                  Certifications & Credentials
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16291D] border border-[#23422E] text-xs font-medium text-[#5BE584]"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCert(newCert);
                    }
                  }}
                  placeholder="Add certification (e.g. CSCS, NASM-CPT)..."
                  className="flex-1 rounded-xl border border-[#1E2329] bg-[#101418] px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddCert(newCert)}
                  className="px-3 py-2 rounded-xl border border-[#1E2329] bg-[#161B22] text-xs text-gray-300 hover:text-white hover:border-[#5BE584] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_CERTIFICATIONS.filter((c) => !certifications.includes(c)).map(
                  (cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleAddCert(cert)}
                      className="text-[11px] px-2 py-0.5 rounded border border-[#1E2329] bg-[#101418] text-gray-400 hover:text-[#5BE584] hover:border-[#5BE584]/40 transition-colors"
                    >
                      + {cert}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* 6. Languages Spoken */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#5BE584]" />
                  Languages Spoken
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {languagesSpoken.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16291D] border border-[#23422E] text-xs font-medium text-[#5BE584]"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleRemoveLang(lang)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLang(newLang);
                    }
                  }}
                  placeholder="Add language..."
                  className="flex-1 rounded-xl border border-[#1E2329] bg-[#101418] px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddLang(newLang)}
                  className="px-3 py-2 rounded-xl border border-[#1E2329] bg-[#161B22] text-xs text-gray-300 hover:text-white hover:border-[#5BE584] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_LANGUAGES.filter((l) => !languagesSpoken.includes(l)).map(
                  (lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleAddLang(lang)}
                      className="text-[11px] px-2 py-0.5 rounded border border-[#1E2329] bg-[#101418] text-gray-400 hover:text-[#5BE584] hover:border-[#5BE584]/40 transition-colors"
                    >
                      + {lang}
                    </button>
                  ),
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#1E2329] bg-[#0D1014] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-[#1E2329] hover:bg-[#161B22] text-xs font-semibold text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-coach-form"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#5BE584] hover:bg-[#4ade80] text-[#090B0F] font-bold text-xs transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCoachProfileDialog;

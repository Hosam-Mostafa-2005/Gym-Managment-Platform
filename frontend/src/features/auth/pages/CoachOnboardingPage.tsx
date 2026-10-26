// src/features/auth/pages/CoachOnboardingPage.tsx
import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Globe,
  Loader2,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useOnboarding } from "../hooks/useOnboarding";

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
  "French",
  "Spanish",
  "German",
  "Russian",
];

export const CoachOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const { mutate: submitOnboarding, isPending } = useOnboarding();

  const [step, setStep] = useState(1);

  // Section A State
  const [name, setName] = useState(user?.name || "");
  const [professionalTitle, setProfessionalTitle] = useState(
    user?.professionalTitle || "Strength & Conditioning Coach",
  );
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(
    user?.yearsOfExperience || 3,
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [specialties, setSpecialties] = useState<string[]>(
    user?.specialties || ["Strength Training", "Hypertrophy"],
  );

  // Section B State
  const [certifications, setCertifications] = useState<string[]>(
    user?.certifications || [],
  );
  const [customCert, setCustomCert] = useState("");

  // Section C State
  const [coachingPhilosophy, setCoachingPhilosophy] = useState(
    user?.coachingPhilosophy || "",
  );
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(
    user?.languagesSpoken?.length ? user.languagesSpoken : ["English"],
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languagesSpoken.includes(lang)) {
      setLanguagesSpoken(languagesSpoken.filter((l) => l !== lang));
    } else {
      setLanguagesSpoken([...languagesSpoken, lang]);
    }
  };

  const addCertification = (cert: string) => {
    const trimmed = cert.trim();
    if (!trimmed || certifications.includes(trimmed)) return;
    setCertifications([...certifications, trimmed]);
    setCustomCert("");
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const handleNextOrFinish = (e?: React.FormEvent, isFinishing = false, isSkipping = false) => {
    if (e) e.preventDefault();

    if (!isSkipping && step === 1 && (!name.trim() || name.trim().length < 2)) {
      setErrorMessage("Please provide your professional name (at least 2 characters).");
      return;
    }

    setErrorMessage(null);

    if (step < 3 && !isFinishing && !isSkipping) {
      setStep((prev) => prev + 1);
      return;
    }

    // Submit payload
    submitOnboarding({
      name: name.trim() || user?.name || "Coach",
      phone: isSkipping ? user?.phone || null : phone.trim() || null,
      bio: isSkipping ? user?.bio || null : bio.trim() || null,
      professionalTitle: isSkipping ? null : professionalTitle.trim() || null,
      yearsOfExperience: isSkipping ? 0 : Number(yearsOfExperience) || 0,
      specialties: isSkipping ? [] : specialties,
      certifications: isSkipping ? [] : certifications,
      coachingPhilosophy: isSkipping ? null : coachingPhilosophy.trim() || null,
      languagesSpoken: isSkipping ? ["English"] : languagesSpoken,
      step: 3,
      skipOptional: isSkipping,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#090B0F] text-[#F3F4F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#5BE584]/30">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.05)_0%,_rgba(9,11,15,0)_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Coach Workspace Initialization</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Complete Your Professional Profile
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF] max-w-md mx-auto">
            Set up your coaching credentials, core training methodologies, and athlete roster visibility.
          </p>

          {/* Stepper */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[
              { num: 1, label: "Core Profile" },
              { num: 2, label: "Credentials" },
              { num: 3, label: "Philosophy" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    step === s.num
                      ? "bg-[#16291D] border border-[#23422E] text-[#5BE584]"
                      : step > s.num
                        ? "bg-[#101418] border border-[#1E2329] text-gray-300"
                        : "bg-transparent text-gray-600"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                      step > s.num
                        ? "bg-[#5BE584] text-black font-bold"
                        : step === s.num
                          ? "bg-[#5BE584]/20 text-[#5BE584]"
                          : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
                {s.num < 3 && <span className="text-gray-700 text-xs">/</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#101418]/90 backdrop-blur-md border border-[#1E2329] rounded-2xl shadow-2xl p-6 sm:p-10">
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Step 1: Core Professional Bio & Specialties */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-[#1E2329] pb-3 mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Section A — Basic Professional Information
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Your public profile details displayed to your assigned athletes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#5BE584]" />
                    <span>Professional Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Coach Marcus"
                    className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#5BE584]" />
                    <span>Professional Title</span>
                  </label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="Head Strength & Conditioning Coach"
                    className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#5BE584]" />
                    <span>Years of Coaching Experience</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#5BE584]" />
                    <span>Contact Phone (Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Core Specialties */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Areas of Specialization (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SPECIALTIES.map((spec) => {
                    const isSelected = specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-[#16291D] border-[#5BE584] text-[#5BE584]"
                            : "bg-[#0D1014] border-[#1E2329] text-gray-400 hover:text-white hover:border-[#2A313C]"
                        }`}
                      >
                        {isSelected ? `✓ ${spec}` : `+ ${spec}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Outline your athletic experience, coaching record, and training background..."
                  className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] p-3 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 2: Credentials and Certifications */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-[#1E2329] pb-3 mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Section B — Qualifications & Certifications
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add recognized credentials or education. Note: All qualifications are self-reported.
                </p>
              </div>

              {/* Quick Select Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Common Coaching Credentials (click to add)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CERTIFICATIONS.map((cert) => {
                    const isAdded = certifications.includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() =>
                          isAdded
                            ? removeCertification(cert)
                            : addCertification(cert)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isAdded
                            ? "bg-[#16291D] border-[#5BE584] text-[#5BE584]"
                            : "bg-[#0D1014] border-[#1E2329] text-gray-400 hover:text-white"
                        }`}
                      >
                        {isAdded ? `✓ ${cert}` : `+ ${cert}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Credential Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Add Custom Credential or Degree
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCert}
                    onChange={(e) => setCustomCert(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCertification(customCert);
                      }
                    }}
                    placeholder="e.g. B.S. in Exercise Science, FMS Level 1"
                    className="flex-1 rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => addCertification(customCert)}
                    className="px-4 py-2.5 rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584] hover:bg-[#1E3627] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Current Active Certifications */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Selected Qualifications ({certifications.length})
                </label>
                {certifications.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#1E2329] text-center text-xs text-gray-500">
                    No certifications added yet. You can skip this section or add credentials later.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((c) => (
                      <div
                        key={c}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] text-xs font-medium"
                      >
                        <Award className="w-3 h-3" />
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(c)}
                          className="hover:text-red-400 p-0.5 ml-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Coaching Philosophy & Languages */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-[#1E2329] pb-3 mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Section C — Coaching Philosophy & Details
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Share your training philosophy and communication preferences.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#5BE584]" />
                  <span>Coaching Philosophy & Approach (Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={coachingPhilosophy}
                  onChange={(e) => setCoachingPhilosophy(e.target.value)}
                  placeholder="Describe your training methodology, client accountability style, and program progression principles..."
                  className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] p-3 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#5BE584]" />
                  <span>Languages Spoken</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.map((lang) => {
                    const isSelected = languagesSpoken.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-[#16291D] border-[#5BE584] text-[#5BE584]"
                            : "bg-[#0D1014] border-[#1E2329] text-gray-400 hover:text-white"
                        }`}
                      >
                        {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-[#1E2329]">
            <div className="flex items-center gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev - 1)}
                  disabled={isPending}
                  className="px-3.5 py-2.5 rounded-xl border border-[#1E2329] hover:bg-[#161B22] text-xs font-medium text-gray-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => handleNextOrFinish(undefined, true, true)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
              >
                Skip for now
              </button>
            </div>

            <div className="flex items-center gap-2">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => handleNextOrFinish(undefined, false, false)}
                  disabled={isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5BE584] hover:bg-[#4ade80] text-[#090B0F] font-bold text-xs shadow-lg shadow-[#5BE584]/10 transition-all disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNextOrFinish(undefined, true, false)}
                  disabled={isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5BE584] hover:bg-[#4ade80] text-[#090B0F] font-bold text-xs shadow-lg shadow-[#5BE584]/10 transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Finish & Open Workspace</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-gray-500">
          All professional credentials and specialties can be edited anytime from your Coach Profile.
        </p>
      </div>
    </div>
  );
};

export default CoachOnboardingPage;

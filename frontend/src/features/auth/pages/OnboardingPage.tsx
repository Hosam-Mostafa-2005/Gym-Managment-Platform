// src/features/auth/pages/OnboardingPage.tsx
import React, { useState } from "react";
import {
  User,
  Phone,
  FileText,
  Dumbbell,
  Target,
  Sparkles,
  ArrowRight,
  Loader2,
  Check,
  Shield,
  Briefcase,
  Award,
  Globe,
  BookOpen,
  Plus,
  X,
  Compass,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useOnboarding } from "../hooks/useOnboarding";

interface OnboardingPageProps {
  initialRole?: "member" | "trainer";
}

const FITNESS_GOALS = [
  {
    id: "STRENGTH_HYPERTROPHY",
    label: "Strength & Muscle Building",
    desc: "Maximize progressive overload and hypertrophy.",
    icon: Dumbbell,
  },
  {
    id: "FAT_LOSS_LEANING",
    label: "Fat Loss & Conditioning",
    desc: "Optimize body composition, energy, and leanness.",
    icon: Target,
  },
  {
    id: "ATHLETIC_PERFORMANCE",
    label: "Athletic Performance",
    desc: "Build functional power, speed, and agility.",
    icon: Sparkles,
  },
  {
    id: "HEALTH_LONGEVITY",
    label: "General Fitness & Health",
    desc: "Consistent workout habits and long-term vitality.",
    icon: Shield,
  },
];

const EXPERIENCE_LEVELS = [
  { id: "BEGINNER", label: "Beginner", desc: "< 1 year of training" },
  { id: "INTERMEDIATE", label: "Intermediate", desc: "1–3 years consistent" },
  { id: "ADVANCED", label: "Advanced", desc: "3+ years lifting" },
];

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

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ initialRole }) => {
  const { user } = useAuth();
  const { mutate: submitOnboarding, isPending } = useOnboarding();

  // Selected role: strictly "member" or "trainer" (no admin option)
  const [selectedRole, setSelectedRole] = useState<"member" | "trainer">(() => {
    if (initialRole) return initialRole;
    const current = user?.role?.toLowerCase();
    if (current === "trainer" || current === "coach") return "trainer";
    return "member";
  });

  // General fields
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");

  // Member-specific fields
  const [fitnessGoal, setFitnessGoal] = useState<string>(
    user?.fitnessGoal || "STRENGTH_HYPERTROPHY",
  );
  const [experienceLevel, setExperienceLevel] = useState<string>(
    user?.experienceLevel || "INTERMEDIATE",
  );

  // Coach-specific fields
  const [professionalTitle, setProfessionalTitle] = useState(
    user?.professionalTitle || "Strength & Conditioning Coach",
  );
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(
    user?.yearsOfExperience || 3,
  );
  const [specialties, setSpecialties] = useState<string[]>(
    user?.specialties || ["Strength Training", "Hypertrophy"],
  );
  const [certifications, setCertifications] = useState<string[]>(
    user?.certifications || [],
  );
  const [customCert, setCustomCert] = useState("");
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

  const addCustomCert = () => {
    if (customCert.trim() && !certifications.includes(customCert.trim())) {
      setCertifications([...certifications, customCert.trim()]);
      setCustomCert("");
    }
  };

  const removeCert = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const toggleLanguage = (lang: string) => {
    if (languagesSpoken.includes(lang)) {
      setLanguagesSpoken(languagesSpoken.filter((l) => l !== lang));
    } else {
      setLanguagesSpoken([...languagesSpoken, lang]);
    }
  };

  const handleSkip = () => {
    submitOnboarding({
      role: selectedRole,
      name: name.trim() || user?.name || (selectedRole === "trainer" ? "Coach" : "Athlete"),
      step: 1,
      skipOptional: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedRole === "member") {
      submitOnboarding({
        role: "member",
        name: name.trim() || user?.name || "Athlete",
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        fitnessGoal: fitnessGoal || null,
        experienceLevel: experienceLevel || null,
        step: 1,
        skipOptional: false,
      });
    } else {
      submitOnboarding({
        role: "trainer",
        name: name.trim() || user?.name || "Coach",
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        professionalTitle: professionalTitle.trim() || null,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        specialties,
        certifications,
        coachingPhilosophy: coachingPhilosophy.trim() || null,
        languagesSpoken,
        step: 2,
        skipOptional: false,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090B0F] text-[#F3F4F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#5BE584]/30">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.04)_0%,_rgba(9,11,15,0)_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to STREN</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF] max-w-lg mx-auto">
            Tell us how you plan to use STREN. All profile details are optional and can be updated anytime later in Settings.
          </p>
        </div>

        {/* Role Confirmation Selector */}
        <div className="mb-8">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3 text-center sm:text-left">
            I am joining STREN as:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole("member")}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                selectedRole === "member"
                  ? "bg-[#101418] border-[#5BE584] shadow-lg shadow-[#5BE584]/10 ring-1 ring-[#5BE584]"
                  : "bg-[#101418]/60 border-[#1E2329] hover:border-[#2E353F]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${selectedRole === "member" ? "bg-[#5BE584]/10 text-[#5BE584]" : "bg-[#1E2329] text-[#9CA3AF]"}`}>
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-white">Athlete / Member</span>
                </div>
                {selectedRole === "member" && (
                  <div className="w-5 h-5 rounded-full bg-[#5BE584] flex items-center justify-center text-[#090B0F]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Log workouts, follow coaching assignments, track nutrition, and monitor personal records.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("trainer")}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                selectedRole === "trainer"
                  ? "bg-[#101418] border-[#5BE584] shadow-lg shadow-[#5BE584]/10 ring-1 ring-[#5BE584]"
                  : "bg-[#101418]/60 border-[#1E2329] hover:border-[#2E353F]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${selectedRole === "trainer" ? "bg-[#5BE584]/10 text-[#5BE584]" : "bg-[#1E2329] text-[#9CA3AF]"}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-white">Coach / Trainer</span>
                </div>
                {selectedRole === "trainer" && (
                  <div className="w-5 h-5 rounded-full bg-[#5BE584] flex items-center justify-center text-[#090B0F]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Manage athletes, assign workout and nutrition programs, track adherence, and schedule sessions.
              </p>
            </button>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="bg-[#101418] border border-[#1E2329] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Basic Identity Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2">
                <User className="w-4 h-4 text-[#5BE584]" />
                Personal Information (Optional)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === "trainer" ? "Coach Name" : "Your Name"}
                    className="w-full bg-[#0E1217] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0E1217] border border-[#1E2329] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Bio / Background
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-500" />
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={
                      selectedRole === "trainer"
                        ? "Brief coaching bio or experience summary..."
                        : "Tell us a little about your fitness journey..."
                    }
                    className="w-full bg-[#0E1217] border border-[#1E2329] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Role-Specific Sections */}
            {selectedRole === "member" ? (
              <div className="space-y-6 pt-4 border-t border-[#1E2329]">
                {/* Fitness Goals */}
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#5BE584]" />
                    Primary Fitness Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FITNESS_GOALS.map((g) => {
                      const Icon = g.icon;
                      const active = fitnessGoal === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setFitnessGoal(g.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                            active
                              ? "bg-[#16291D] border-[#5BE584]/60 text-white"
                              : "bg-[#0E1217] border-[#1E2329] text-[#9CA3AF] hover:border-[#2E353F]"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${active ? "bg-[#5BE584] text-[#090B0F]" : "bg-[#1E2329] text-[#9CA3AF]"}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{g.label}</div>
                            <div className="text-[11px] text-[#9CA3AF] line-clamp-1">{g.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#5BE584]" />
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {EXPERIENCE_LEVELS.map((lvl) => {
                      const active = experienceLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setExperienceLevel(lvl.id)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            active
                              ? "bg-[#16291D] border-[#5BE584]/60 text-[#5BE584]"
                              : "bg-[#0E1217] border-[#1E2329] text-[#9CA3AF] hover:border-[#2E353F]"
                          }`}
                        >
                          <div className="text-xs font-semibold">{lvl.label}</div>
                          <div className="text-[10px] text-[#9CA3AF]">{lvl.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-4 border-t border-[#1E2329]">
                {/* Professional Title & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#5BE584]" />
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. Strength & Conditioning Specialist"
                      className="w-full bg-[#0E1217] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#5BE584]" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={yearsOfExperience}
                      inputMode="numeric"
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      className="w-full bg-[#0E1217] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584]"
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-2">
                    Coaching Specialties
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SPECIALTIES.map((spec) => {
                      const active = specialties.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpecialty(spec)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            active
                              ? "bg-[#16291D] border-[#5BE584] text-[#5BE584] font-medium"
                              : "bg-[#0E1217] border-[#1E2329] text-[#9CA3AF] hover:border-[#2E353F]"
                          }`}
                        >
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    Certifications & Credentials
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={customCert}
                      onChange={(e) => setCustomCert(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomCert();
                        }
                      }}
                      placeholder="Add certification (e.g. CSCS, NASM-CPT)"
                      className="flex-1 bg-[#0E1217] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584]"
                    />
                    <button
                      type="button"
                      onClick={addCustomCert}
                      className="px-3 py-2 bg-[#1E2329] hover:bg-[#2E353F] text-xs font-medium text-white rounded-xl flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {certifications.map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16291D] border border-[#5BE584]/40 text-[#5BE584] text-xs"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => removeCert(cert)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coaching Philosophy */}
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#5BE584]" />
                    Coaching Philosophy (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={coachingPhilosophy}
                    onChange={(e) => setCoachingPhilosophy(e.target.value)}
                    placeholder="Describe your training methodology, client expectations, or core coaching beliefs..."
                    className="w-full bg-[#0E1217] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584] resize-none"
                  />
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#5BE584]" />
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_LANGUAGES.map((lang) => {
                      const active = languagesSpoken.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            active
                              ? "bg-[#16291D] border-[#5BE584] text-[#5BE584]"
                              : "bg-[#0E1217] border-[#1E2329] text-[#9CA3AF] hover:border-[#2E353F]"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Note about Settings */}
            <div className="p-3 bg-[#16291D]/40 border border-[#23422E]/50 rounded-xl text-xs text-[#9CA3AF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5BE584] shrink-0" />
              <span>
                You can skip this step at any time. All details can be configured later in your profile settings.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1E2329]">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#1E2329] bg-[#0E1217] hover:bg-[#1E2329] text-xs font-medium text-[#9CA3AF] hover:text-white transition-all disabled:opacity-50"
              >
                Skip for now
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5BE584] hover:bg-[#49D472] text-xs font-bold text-[#090B0F] flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-[#5BE584]/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <span>Complete & Enter STREN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

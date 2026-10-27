// src/features/auth/pages/MemberOnboardingPage.tsx
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
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useOnboarding } from "../hooks/useOnboarding";

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

export const MemberOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const { mutate: submitOnboarding, isPending } = useOnboarding();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [fitnessGoal, setFitnessGoal] = useState<string>(
    user?.fitnessGoal || "STRENGTH_HYPERTROPHY",
  );
  const [experienceLevel, setExperienceLevel] = useState<string>(
    user?.experienceLevel || "INTERMEDIATE",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent, isSkipping = false) => {
    e.preventDefault();
    if (!isSkipping && (!name.trim() || name.trim().length < 2)) {
      setErrorMessage("Please enter a valid display name (at least 2 characters).");
      return;
    }

    setErrorMessage(null);
    submitOnboarding({
      name: name.trim() || user?.name || "Athlete",
      phone: isSkipping ? user?.phone || null : phone.trim() || null,
      bio: isSkipping ? user?.bio || null : bio.trim() || null,
      fitnessGoal: isSkipping ? null : fitnessGoal,
      experienceLevel: isSkipping ? null : experienceLevel,
      step: 1,
      skipOptional: isSkipping,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#090B0F] text-[#F3F4F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#5BE584]/30">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.04)_0%,_rgba(9,11,15,0)_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to STREN</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Let's Set Up Your Athlete Profile
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF] max-w-md mx-auto">
            Personalize your training baseline so coaches and workout routines match your fitness level.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#101418]/90 backdrop-blur-md border border-[#1E2329] rounded-2xl shadow-2xl p-6 sm:p-10">
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* 1. Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5BE584]" />
                  <span>Display Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#5BE584]" />
                  <span>Phone Number (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 2. Fitness Goal */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#5BE584]" />
                  Primary Fitness Goal
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FITNESS_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = fitnessGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setFitnessGoal(goal.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-[#16291D] border-[#5BE584] ring-1 ring-[#5BE584]"
                          : "bg-[#0D1014] border-[#1E2329] hover:border-[#2A313C]"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-[#5BE584] text-black"
                            : "bg-[#161B22] text-gray-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white">
                          {goal.label}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                          {goal.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Training Experience Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#5BE584]" />
                  Training Experience
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const isSelected = experienceLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-[#16291D] border-[#5BE584] text-[#5BE584]"
                          : "bg-[#0D1014] border-[#1E2329] text-gray-400 hover:text-gray-200 hover:border-[#2A313C]"
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">
                        {lvl.label}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {lvl.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Short Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5BE584]" />
                  Athlete Bio
                </span>
                <span className="text-[11px] font-normal text-gray-500 lowercase">
                  optional
                </span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your athletic background, weekly availability, or any injury notes..."
                className="w-full rounded-xl bg-[#0D1014] border border-[#1E2329] p-3 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1E2329]">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isPending}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#1E2329] hover:bg-[#161B22] text-xs font-medium text-gray-400 hover:text-white transition-colors text-center"
              >
                Skip for now
              </button>

              <button
                type="submit"
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
                    <span>Complete Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-gray-500">
          You can update all profile information anytime from your Profile settings.
        </p>
      </div>
    </div>
  );
};

export default MemberOnboardingPage;

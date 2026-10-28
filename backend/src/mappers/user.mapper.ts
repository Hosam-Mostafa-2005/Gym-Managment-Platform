// src/mappers/user.mapper.ts
export const mapUser = (user: any) => {
  return {
    id: user.id ?? user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    isEmailVerified: Boolean(user.isEmailVerified),
    hasPassword: Boolean(user.password),
    googleLinked: Boolean(user.googleId),
    phone: user.phone ?? null,

    // Trainer / Member Profile
    bio: user.bio ?? null,
    specialties: user.specialties ?? [],
    certifications: user.certifications ?? [],
    yearsOfExperience: user.yearsOfExperience ?? 0,

    // Onboarding Metadata & Profile Extensions
    onboardingCompleted: Boolean(user.onboardingCompleted),
    onboardingStep: user.onboardingStep ?? 0,
    fitnessGoal: user.fitnessGoal ?? null,
    experienceLevel: user.experienceLevel ?? null,
    professionalTitle: user.professionalTitle ?? null,
    coachingPhilosophy: user.coachingPhilosophy ?? null,
    languagesSpoken: user.languagesSpoken ?? [],
  };
};

export default mapUser;

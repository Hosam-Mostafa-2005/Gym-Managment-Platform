// src/features/gamification/hooks/useAchievementCelebration.ts
import { useAchievementCelebrationContext } from "../context/AchievementCelebrationContext";

/**
 * Hook to access the global achievement celebration system.
 * Allows components to inspect current celebration state or trigger celebrations manually.
 */
export const useAchievementCelebration = () => {
  return useAchievementCelebrationContext();
};

export default useAchievementCelebration;

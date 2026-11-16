// src/features/gamification/context/AchievementCelebrationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useMyGamification } from "../hooks/useGamification";
import type { AchievementWithStatus } from "../types/gamification.types";
import AchievementUnlockModal from "../components/AchievementUnlockModal";

export interface AchievementCelebrationContextType {
  celebrateAchievement: (
    achievement: AchievementWithStatus,
    options?: { force?: boolean },
  ) => void;
  celebrateAchievements: (
    achievements: AchievementWithStatus[],
    options?: { force?: boolean },
  ) => void;
  dismissCurrent: () => void;
  dismissAll: () => void;
  queue: AchievementWithStatus[];
  currentAchievement: AchievementWithStatus | null;
  isCelebrating: boolean;
}

const AchievementCelebrationContext =
  createContext<AchievementCelebrationContextType | null>(null);

const STORAGE_PREFIX = "stren_celebrated_achievements_";

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

export const AchievementCelebrationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: user } = useCurrentUser();
  const userId = user?.id || (user as any)?._id;
  const isMember = user?.role?.toUpperCase() === "MEMBER";

  // Poll or react to gamification updates for current user (members only)
  const { data: gamificationData } = useMyGamification({
    enabled: Boolean(userId && isMember),
  });

  const [queue, setQueue] = useState<AchievementWithStatus[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Ref to track whether the baseline has been initialized for this session/user
  const initializedUserRef = useRef<string | null>(null);

  // Read celebrated IDs from localStorage safely
  const getCelebratedSet = useCallback((uid: string): Set<string> => {
    try {
      const raw = localStorage.getItem(getStorageKey(uid));
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }, []);

  // Save celebrated IDs to localStorage safely
  const saveCelebratedSet = useCallback(
    (uid: string, set: Set<string>) => {
      try {
        localStorage.setItem(
          getStorageKey(uid),
          JSON.stringify(Array.from(set)),
        );
      } catch {
        // Safe fallback for quota or disabled storage
      }
    },
    [],
  );

  // Enqueue new achievements safely preventing duplicate cards in queue
  const enqueueAchievements = useCallback(
    (newAchievements: AchievementWithStatus[]) => {
      if (!newAchievements || newAchievements.length === 0) return;

      setQueue((prevQueue) => {
        const existingKeys = new Set(
          prevQueue.map((item) => item.id || item.code),
        );
        const uniqueToAdd = newAchievements.filter(
          (item) =>
            !existingKeys.has(item.id) &&
            (!item.code || !existingKeys.has(item.code)),
        );

        if (uniqueToAdd.length === 0) return prevQueue;
        return [...prevQueue, ...uniqueToAdd];
      });

      setIsOpen(true);
    },
    [],
  );

  // Programmatic celebration of a single achievement
  const celebrateAchievement = useCallback(
    (
      achievement: AchievementWithStatus,
      options?: { force?: boolean },
    ) => {
      if (!achievement) return;

      if (!options?.force && userId) {
        const celebratedSet = getCelebratedSet(userId);
        if (
          celebratedSet.has(achievement.id) ||
          (achievement.code && celebratedSet.has(achievement.code))
        ) {
          return;
        }

        celebratedSet.add(achievement.id);
        if (achievement.code) celebratedSet.add(achievement.code);
        saveCelebratedSet(userId, celebratedSet);
      }

      enqueueAchievements([achievement]);
    },
    [userId, getCelebratedSet, saveCelebratedSet, enqueueAchievements],
  );

  // Programmatic celebration of multiple achievements
  const celebrateAchievements = useCallback(
    (
      achievements: AchievementWithStatus[],
      options?: { force?: boolean },
    ) => {
      if (!achievements || achievements.length === 0) return;

      if (!options?.force && userId) {
        const celebratedSet = getCelebratedSet(userId);
        const filtered = achievements.filter((ach) => {
          const already =
            celebratedSet.has(ach.id) ||
            (ach.code && celebratedSet.has(ach.code));
          return !already;
        });

        filtered.forEach((ach) => {
          celebratedSet.add(ach.id);
          if (ach.code) celebratedSet.add(ach.code);
        });
        saveCelebratedSet(userId, celebratedSet);

        enqueueAchievements(filtered);
      } else {
        enqueueAchievements(achievements);
      }
    },
    [userId, getCelebratedSet, saveCelebratedSet, enqueueAchievements],
  );

  // Dismiss current achievement in queue
  const dismissCurrent = useCallback(() => {
    setQueue((prev) => {
      if (prev.length <= 1) {
        setIsOpen(false);
        return [];
      }
      return prev.slice(1);
    });
  }, []);

  // Dismiss all queued achievements
  const dismissAll = useCallback(() => {
    setQueue([]);
    setIsOpen(false);
  }, []);

  // Automated detection of newly unlocked achievements from gamification query
  useEffect(() => {
    if (!userId || !gamificationData) return;

    const achievements = gamificationData.achievements || [];
    const earnedAchievements = achievements.filter((a) => a.isEarned);

    const storageKey = getStorageKey(userId);
    const storedRaw = localStorage.getItem(storageKey);

    // Baseline initialization: if user has no stored record yet, seed with current earned achievements
    if (storedRaw === null) {
      const initialEarnedIds = earnedAchievements.map(
        (a) => a.id || a.code,
      );
      localStorage.setItem(storageKey, JSON.stringify(initialEarnedIds));
      initializedUserRef.current = userId;

      // If backend explicitly returned newlyUnlocked on this very request, celebrate them
      if (
        gamificationData.newlyUnlocked &&
        gamificationData.newlyUnlocked.length > 0
      ) {
        const celebratedSet = new Set(initialEarnedIds);
        gamificationData.newlyUnlocked.forEach((a) => {
          if (a.id) celebratedSet.add(a.id);
          if (a.code) celebratedSet.add(a.code);
        });
        saveCelebratedSet(userId, celebratedSet);
        enqueueAchievements(gamificationData.newlyUnlocked);
      }
      return;
    }

    // If already initialized, detect newly unlocked achievements
    const celebratedSet = getCelebratedSet(userId);

    const candidates = [
      ...(gamificationData.newlyUnlocked || []),
      ...earnedAchievements,
    ];

    const newlyUnlockedMap = new Map<string, AchievementWithStatus>();
    for (const a of candidates) {
      const hasId = a.id && celebratedSet.has(a.id);
      const hasCode = a.code && celebratedSet.has(a.code);
      if (!hasId && !hasCode) {
        const key = a.id || a.code;
        if (key && !newlyUnlockedMap.has(key)) {
          newlyUnlockedMap.set(key, a);
        }
      }
    }

    const newlyUnlocked = Array.from(newlyUnlockedMap.values());

    if (newlyUnlocked.length > 0) {
      // Immediately mark as celebrated in localStorage to avoid re-triggering on refetch or re-render
      newlyUnlocked.forEach((a) => {
        if (a.id) celebratedSet.add(a.id);
        if (a.code) celebratedSet.add(a.code);
      });
      saveCelebratedSet(userId, celebratedSet);

      // Enqueue celebration
      enqueueAchievements(newlyUnlocked);
    }
  }, [userId, gamificationData, getCelebratedSet, saveCelebratedSet, enqueueAchievements]);

  const currentAchievement = queue[0] || null;

  const value = useMemo(
    () => ({
      celebrateAchievement,
      celebrateAchievements,
      dismissCurrent,
      dismissAll,
      queue,
      currentAchievement,
      isCelebrating: isOpen && Boolean(currentAchievement),
    }),
    [
      celebrateAchievement,
      celebrateAchievements,
      dismissCurrent,
      dismissAll,
      queue,
      currentAchievement,
      isOpen,
    ],
  );

  return (
    <AchievementCelebrationContext.Provider value={value}>
      {children}

      {/* Render Celebration Modal */}
      <AchievementUnlockModal
        isOpen={isOpen && Boolean(currentAchievement)}
        achievement={currentAchievement}
        onDismiss={dismissCurrent}
        queueIndex={1}
        queueTotal={queue.length}
      />
    </AchievementCelebrationContext.Provider>
  );
};

export const useAchievementCelebrationContext = () => {
  const context = useContext(AchievementCelebrationContext);
  if (!context) {
    throw new Error(
      "useAchievementCelebrationContext must be used within an AchievementCelebrationProvider",
    );
  }
  return context;
};

// src/features/notifications/components/NotificationPreferencesModal.tsx

import React, { useState, useEffect } from "react";
import {
  X,
  Settings2,
  Dumbbell,
  Utensils,
  Users,
  Trophy,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/use-notification-preferences";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<
  NotificationPreferencesModalProps
> = ({ isOpen, onClose }) => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const { mutate: updatePreferences, isPending } =
    useUpdateNotificationPreferences();

  const [formState, setFormState] = useState({
    workoutNotifications: true,
    nutritionNotifications: true,
    coachingNotifications: true,
    achievementNotifications: true,
  });

  useEffect(() => {
    if (preferences) {
      setFormState({
        workoutNotifications: preferences.workoutNotifications,
        nutritionNotifications: preferences.nutritionNotifications,
        coachingNotifications: preferences.coachingNotifications,
        achievementNotifications: preferences.achievementNotifications,
      });
    }
  }, [preferences]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof typeof formState) => {
    setFormState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePreferences(formState, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const PREF_ITEMS = [
    {
      key: "workoutNotifications" as const,
      label: "Workouts & Training",
      description: "Session reminders, assignment alerts, and completed logs",
      icon: Dumbbell,
      enabled: formState.workoutNotifications,
      color: "text-[#5BE584]",
      bgColor: "bg-[#5BE584]/15 border-[#5BE584]/30",
    },
    {
      key: "nutritionNotifications" as const,
      label: "Nutrition & Meals",
      description: "Daily calorie reminders and nutrition plan adjustments",
      icon: Utensils,
      enabled: formState.nutritionNotifications,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15 border-emerald-500/30",
    },
    {
      key: "coachingNotifications" as const,
      label: "Coaching & Appointments",
      description: "Coach invites, check-ins, schedule changes, and messages",
      icon: Users,
      enabled: formState.coachingNotifications,
      color: "text-blue-400",
      bgColor: "bg-blue-500/15 border-blue-500/30",
    },
    {
      key: "achievementNotifications" as const,
      label: "Achievements & Streaks",
      description: "Milestones, badge unlocks, level-ups, and coach cheers",
      icon: Trophy,
      enabled: formState.achievementNotifications,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/15 border-yellow-500/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-[#2A313A] bg-[#101418] p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-800 text-gray-300">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-gray-400">
                Choose which channels and alerts you want to receive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1E2329] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-10 text-center text-xs text-gray-400 animate-pulse">
            Loading preferences...
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {PREF_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl border border-[#1E2329] bg-[#090B0F] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.bgColor} ${item.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-200">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.enabled ? "bg-[#5BE584]" : "bg-gray-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        item.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}

            {/* Mandatory System item */}
            <div className="flex items-center justify-between rounded-xl border border-[#1E2329] bg-[#090B0F]/60 p-3.5 opacity-80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-gray-300">
                      System & Security
                    </h4>
                    <span className="rounded bg-gray-800 px-1.5 py-0.2 text-[9px] font-bold text-gray-400">
                      Mandatory
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Account security, legal, and essential platform updates
                  </p>
                </div>
              </div>

              {/* Disabled switch (always on) */}
              <div className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-[#5BE584]/60 cursor-not-allowed">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg translate-x-5" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#1E2329] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-[#1E2329] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-[#1E2329]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#49D472] disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

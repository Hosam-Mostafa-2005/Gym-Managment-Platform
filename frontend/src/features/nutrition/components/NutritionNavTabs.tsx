// src/features/nutrition/components/NutritionNavTabs.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Utensils, CalendarDays, History, Sparkles } from "lucide-react";

interface NutritionNavTabsProps {
  onboardingCompleted?: boolean;
}

export const NutritionNavTabs: React.FC<NutritionNavTabsProps> = ({
  onboardingCompleted = true,
}) => {
  const tabs = [
    {
      name: "Daily Tracking",
      path: "/nutrition",
      icon: Utensils,
      exact: true,
    },
    {
      name: "Meal Plan",
      path: "/nutrition/plan",
      icon: CalendarDays,
    },
    {
      name: "30-Day History",
      path: "/nutrition/history",
      icon: History,
    },
    {
      name: onboardingCompleted ? "Recalculate Targets" : "Get Started",
      path: "/nutrition/onboarding",
      icon: Sparkles,
      highlight: !onboardingCompleted,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.exact}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#5BE584]/15 text-[#5BE584] border border-[#5BE584]/30 shadow-sm"
                  : tab.highlight
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

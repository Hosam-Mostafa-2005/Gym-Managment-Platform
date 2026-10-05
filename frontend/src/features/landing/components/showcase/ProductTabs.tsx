// src/features/landing/components/showcase/ProductTabs.tsx
import React from "react";

interface ProductTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => (
  <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-[#1E2329] bg-[#0D1117] p-1 shadow-sm">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`rounded-md px-4 py-2 text-xs font-semibold transition-all ${
          activeTab === tab.id
            ? "bg-[#1E2329] text-white shadow-sm"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

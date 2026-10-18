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
  <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-[14px] border border-[#2A3039] bg-[#13171D] p-1.5">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onTabChange(tab.id)}
        className={`cursor-pointer rounded-[10px] px-3.5 py-2 text-xs font-semibold transition-colors ${
          activeTab === tab.id
            ? "bg-[#5BE584] text-[#090B0F]"
            : "text-[#94A3B8] hover:bg-[#1B2028] hover:text-[#F8FAFC]"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

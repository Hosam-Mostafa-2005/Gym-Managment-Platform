// src/features/landing/components/problem/FragmentedWorkflow.tsx
import React from "react";
import { Database, FileText, TrendingDown } from "lucide-react";

export const FragmentedWorkflow = () => {
  const silos = [
    {
      icon: Database,
      label: "Scattered Data",
      detail: "Member rosters, workout logs, and body metrics trapped in separate spreadsheets.",
    },
    {
      icon: FileText,
      label: "Static Programming",
      detail: "PDF routines with no live set logging, volume calculation, or adherence visibility.",
    },
    {
      icon: TrendingDown,
      label: "Disconnected Coaching",
      detail: "No structured link between assigned training blocks and completed athlete sessions.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full mt-6">
      {silos.map((silo, idx) => (
        <div
          key={idx}
          className="flex flex-col items-start gap-3 rounded-[20px] border border-[#2A3039] bg-[#13171D] p-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <silo.icon className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold text-[#F8FAFC]">
            {silo.label}
          </span>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {silo.detail}
          </p>
        </div>
      ))}
    </div>
  );
};

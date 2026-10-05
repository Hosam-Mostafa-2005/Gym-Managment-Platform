// src/features/landing/components/problem/FragmentedWorkflow.tsx
import React from "react";
import { Database, FileText, TrendingDown } from "lucide-react";

export const FragmentedWorkflow = () => {
  const silos = [
    { icon: Database, label: "Scattered Data" },
    { icon: FileText, label: "Static Programming" },
    { icon: TrendingDown, label: "Lost Momentum" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full mt-10">
      {silos.map((silo, idx) => (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-[#0D1117] p-8 text-center w-full max-w-[240px] opacity-80 grayscale-[30%]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <silo.icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-gray-300">
              {silo.label}
            </span>
          </div>
          {idx < silos.length - 1 && (
            <div className="hidden md:flex h-px w-10 bg-gradient-to-r from-red-500/50 to-transparent dashed opacity-50" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

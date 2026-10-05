// src/features/dashboard/member/components/states/DashboardEmpty.tsx
import React from "react";
import { Inbox } from "lucide-react";

export const DashboardEmpty: React.FC = () => {
  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center justify-center p-4 md:p-6 lg:p-8 min-h-[60vh]">
      <div className="flex flex-col items-center text-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-12 max-w-md">
        <Inbox className="h-12 w-12 text-gray-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">No Dashboard Data</h2>
        <p className="text-sm text-gray-400">
          It looks like you don't have any training history or active
          assignments yet. Once you start logging workouts, your dashboard will
          populate here.
        </p>
      </div>
    </main>
  );
};

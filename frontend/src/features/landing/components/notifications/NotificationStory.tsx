// src/features/landing/components/notifications/NotificationStory.tsx
import React from "react";
import { Bell, Zap, Dumbbell, ClipboardList } from "lucide-react";

export const NotificationStory = () => {
  return (
    <section className="border-t border-[#1E2329] bg-[#0A0C10] py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Real-Time Operational Pulse.
          </h2>
          <p className="text-gray-400 text-base max-w-md">
            Our integrated Socket.IO engine broadcasts mission-critical updates
            instantly. Whether an athlete logs a PR or a coach pushes a new
            block, the entire facility stays perfectly synced.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#5BE584] bg-[#5BE584]/10 px-3 py-1.5 rounded-lg border border-[#5BE584]/20">
              <Zap className="h-3.5 w-3.5" /> Sub-second Latency
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-[#1E2329]/50 px-3 py-1.5 rounded-lg border border-[#1E2329]">
              <Bell className="h-3.5 w-3.5" /> Zero Refresh Needed
            </span>
          </div>
        </div>

        {/* Visual Real-time Flow */}
        <div className="relative w-full h-[300px] flex items-center justify-center bg-[#0D1117] border border-[#1E2329] rounded-2xl shadow-xl">
          <div className="absolute left-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-[#090B0F] border border-[#1E2329] p-3 rounded-lg opacity-60">
              <Dumbbell className="h-4 w-4 text-gray-500" />
              <div className="flex flex-col gap-1">
                <div className="h-1.5 w-16 bg-[#1E2329] rounded" />
                <div className="h-1.5 w-24 bg-[#1E2329] rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#090B0F] border border-[#5BE584]/30 p-3 rounded-lg shadow-[0_0_20px_rgba(91,229,132,0.1)] relative z-10">
              <ClipboardList className="h-4 w-4 text-[#5BE584]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-200">
                  Assignment Completed
                </span>
                <span className="text-[9px] text-gray-500">
                  Alex finished Block A
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-px bg-gradient-to-r from-[#5BE584] to-transparent dashed opacity-50" />

          <div className="absolute right-8">
            <div className="relative group flex items-start gap-3 border border-[#1E2329] bg-[#090B0F] p-4 rounded-lg w-[240px] shadow-2xl">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-[#5BE584]" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-[#5BE584] shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-100">
                  Live Update
                </span>
                <span className="text-[10px] text-gray-400">
                  Assignment Completed: Alex finished Block A
                </span>
                <span className="text-[9px] text-gray-600 mt-1">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

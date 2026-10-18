// src/features/landing/components/notifications/NotificationStory.tsx
import React from "react";
import { ArrowRight, Bell, ClipboardList, Dumbbell, Zap } from "lucide-react";

export const NotificationStory = () => {
  return (
    <section className="relative border-b border-[#2A3039] bg-[#090B0F] bg-[radial-gradient(ellipse_at_bottom_right,rgba(91,229,132,0.07),transparent_50%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <span className="w-fit rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
            Real-Time Notifications
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
            Instant Operational Sync.
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed">
            Integrated Socket.IO events keep coaches and athletes aligned. When
            a workout is assigned or a training session is completed,
            notifications update live across the workspace.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#5BE584] bg-[#5BE584]/10 px-3 py-1.5 rounded-[12px] border border-[#5BE584]/30">
              <Zap className="h-3.5 w-3.5" /> Live Socket.IO Events
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC] bg-[#13171D] px-3 py-1.5 rounded-[12px] border border-[#2A3039]">
              <Bell className="h-3.5 w-3.5 text-[#5BE584]" /> Read & Unread Tracking
            </span>
          </div>
        </div>

        {/* Responsive Event Pipeline */}
        <div className="relative overflow-hidden lg:col-span-7 rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-5 sm:p-6 shadow-[0_18px_48px_rgba(0,0,0,0.45),0_0_32px_rgba(91,229,132,0.06)]">
          {/* Top specular highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/50 to-transparent"
          />

          <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
            {/* Trigger Side */}
            <div className="sm:col-span-5 space-y-3">
              <div className="flex items-center gap-3 rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#5BE584]/15 text-[#5BE584]">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F8FAFC]">
                    Workout Assigned
                  </p>
                  <p className="truncate text-[11px] text-[#94A3B8]">
                    Coach assigned Upper Body A
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#22C55E]/15 text-[#22C55E]">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F8FAFC]">
                    Session Completed
                  </p>
                  <p className="truncate text-[11px] text-[#94A3B8]">
                    Member finished 18 sets
                  </p>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="sm:col-span-1 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#5BE584]/35 bg-[#090B0F] text-[#5BE584] shadow-[0_0_14px_rgba(91,229,132,0.18)]">
                <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
              </div>
            </div>

            {/* Notification Card */}
            <div className="sm:col-span-5 rounded-[14px] border border-[#5BE584]/45 bg-[#090B0F] p-4 shadow-[0_0_24px_rgba(91,229,132,0.1)]">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5BE584]/35 bg-[#5BE584]/15 text-[#5BE584]">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#F8FAFC]">
                      Live Notification
                    </span>
                    <span className="text-[10px] font-medium text-[#5BE584]">
                      Just now
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                    Assignment Completed: Member logged all prescribed sets for
                    Block A.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


"use client";

import { Dumbbell, LogOut, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigation } from "@/constants/navigation";

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  return (
    <aside
      className={`
        relative flex h-screen flex-col border-r border-border/40 bg-card/60 backdrop-blur-xl transition-all duration-300 z-30
        ${collapsed ? "w-20" : "w-64 lg:w-72"}
      `}
    >
      {/* ================= 1. Brand Logo Area ================= */}
      <div className="flex h-16 items-center border-b border-border/40 px-5">
        <div className="flex items-center gap-3.5 overflow-hidden">
          {/* Glowing Brand Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_rgba(91,229,132,0.15)] transition-transform duration-300 hover:scale-105">
            <Dumbbell className="h-5 w-5" />
          </div>

          {/* Brand Titles (Hidden when collapsed) */}
          {!collapsed && (
            <div className="flex flex-col transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-foreground">
                  GymFlow
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground/80">
                Management Pro
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= 2. Navigation Links ================= */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar">
        {/* Section Label (Optional: disappears on collapse) */}
        {!collapsed && (
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Menu
          </div>
        )}

        <ul className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    } ${collapsed ? "justify-center px-0 py-3" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Left 2px Vertical Indicator Bar (As specified in your Design System) */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary shadow-[0_0_8px_rgba(91,229,132,0.8)]" />
                      )}

                      {/* Nav Icon */}
                      <Icon
                        className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? "text-primary scale-105"
                            : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                        }`}
                      />

                      {/* Nav Title */}
                      {!collapsed && (
                        <span className="truncate transition-colors duration-200">
                          {item.title}
                        </span>
                      )}

                      {/* Subtle Arrow or Sparkle for active item (Optional aesthetic touch) */}
                      {!collapsed && isActive && (
                        <Sparkles className="ml-auto h-3.5 w-3.5 text-primary/70 animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ================= 3. Footer / Logout Area ================= */}
      <div className="border-t border-border/40 p-3">
        <button
          type="button"
          onClick={() => {
            // أضف هنا منطق تسجيل الخروج (e.g., auth.logout())
          }}
          className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive ${
            collapsed ? "justify-center px-0 py-3" : ""
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />

          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

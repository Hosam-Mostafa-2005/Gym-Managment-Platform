"use client";

import { Search, Bell, HelpCircle, PanelLeft, Command } from "lucide-react";

interface HeaderProps {
  onToggle?: () => void;
}

const Header = ({ onToggle }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md transition-all lg:px-8">
      {/* ================= Left: Toggle & Brand & Search ================= */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggle}
          type="button"
          aria-label="Toggle Sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 bg-card/40 text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Brand Text (Matches screenshot top-left) */}
        <span className="hidden text-xl font-bold tracking-tight text-foreground sm:inline-block">
          GymFlow
        </span>

        {/* Search Bar (Pill-shaped as in screen.jpg) */}
        <div className="relative w-56 sm:w-72 md:w-80 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members, workouts..."
            className="w-full rounded-full border border-border/60 bg-card/40 py-1.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-sm transition-all focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          {/* Shortcut Hint (e.g., ⌘K) for developer-tier feel */}
          <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border/60 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* ================= Right: Actions & Profile ================= */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <Bell className="h-5 w-5" />
          {/* Unread Badge Indicator */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        {/* Help / Support Icon */}
        <button
          type="button"
          aria-label="Help & Support"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Vertical Divider */}
        <div className="mx-1 h-5 w-px bg-border/40 hidden sm:block" />

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 cursor-pointer rounded-full p-1 transition-colors hover:bg-accent/40">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border/80 bg-primary/10 flex items-center justify-center font-semibold text-primary text-xs shadow-sm">
            {/* ضع هنا صورة المستخدم الحقيقية، وإذا لم توجد سيظهر هذا البديل الاحترافي */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Alex Profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

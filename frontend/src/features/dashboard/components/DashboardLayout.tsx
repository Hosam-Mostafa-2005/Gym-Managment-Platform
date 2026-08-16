import type { ReactNode } from "react";
import { Calendar } from "lucide-react";

interface DashboardLayoutProps {
  userName: string;
  children: ReactNode;
}

export const DashboardLayout = ({
  userName,
  children,
}: DashboardLayoutProps) => {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#090B0F] text-zinc-50 p-6 md:p-10 font-sans selection:bg-[#5BE584] selection:text-black pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#5BE584] font-medium text-sm tracking-wide uppercase">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Welcome back, {userName.split(" ")[0]}
            </h1>
            <p className="text-zinc-400 text-lg">
              Here is an overview of your training progress.
            </p>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
};

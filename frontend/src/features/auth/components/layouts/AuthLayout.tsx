// src/features/auth/components/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";
import heroImage from "@/assets/Generated image 1.png";

const AuthLayout = () => {
  return (
    <main className="min-h-screen w-full flex bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* ========================================================= */}
      {/* LEFT PANEL: BRAND & IMAGE (Hidden on Mobile)              */}
      {/* ========================================================= */}
      <section className="relative hidden lg:flex w-1/2 min-h-screen flex-col overflow-hidden border-r border-[#1E2329] bg-[#0D1014]">
        {/* Background Image with Dark & Gradient Overlays */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.2]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1014] via-[#0D1014]/60 to-[#0D1014]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1014]/90 via-[#0D1014]/40 to-transparent" />

        {/* Content Layer */}
        <div className="relative z-10 flex min-h-screen flex-col p-12 xl:p-16 2xl:p-20">
          {/* Brand */}
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm">
              STREN
            </h1>
          </div>

          {/* Hero Copy */}
          <div className="mt-auto max-w-xl pb-8 xl:pb-12 animate-in fade-in duration-1000 fill-mode-both">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#23422E] bg-[#16291D]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5BE584] backdrop-blur-sm mb-6">
              Platform Access
            </div>

            <h2 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white">
              Train Smarter.
              <br />
              <span className="text-[#9CA3AF]">Manage Better.</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-relaxed text-[#6B7280]">
              Manage members, workouts, assignments and progress from one modern
              platform designed for high-performance facilities.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT PANEL: FORM OUTLET                                  */}
      {/* ========================================================= */}
      <section className="relative flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12 xl:p-24 z-10">
        {/* Subtle Background Glow behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.03)_0%,_rgba(13,16,20,0)_70%)] blur-3xl pointer-events-none" />

        {/* Mobile Logo (Visible only on small screens where the left panel is hidden) */}
        <div className="lg:hidden absolute top-8 left-6 sm:left-12">
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm">
            STREN
          </h1>
        </div>

        {/* The dynamic form content (Login, Register, etc.) */}
        <div className="relative z-10 w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;

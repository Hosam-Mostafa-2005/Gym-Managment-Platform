// src/features/auth/components/layouts/AuthLayout.tsx
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import heroImage from "@/assets/Generated image 1.png";
import { tokenService } from "@/services/token.service";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const AuthLayout = () => {
  const token = tokenService.getToken();
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (token && isLoading) {
    return null;
  }

  if (token && user) {
    const state = location.state as {
      from?: { pathname?: string; search?: string };
    } | null;
    const fromPathname = state?.from?.pathname;
    const fromSearch = state?.from?.search ?? "";
    const isValidReturnPath =
      fromPathname &&
      fromPathname !== "/" &&
      fromPathname !== "/login" &&
      fromPathname !== "/register";

    return (
      <Navigate
        to={isValidReturnPath ? `${fromPathname}${fromSearch}` : "/home"}
        replace
      />
    );
  }

  return (
    <main className="min-h-screen w-full flex bg-[#090B0F] text-[#F8FAFC] font-sans selection:bg-[#5BE584] selection:text-[#090B0F]">
      {/* LEFT PANEL: BRAND & IMAGE (Hidden on Mobile) */}
      <section className="relative hidden lg:flex w-1/2 min-h-screen flex-col overflow-hidden border-r border-[#2A3039] bg-[#090B0F]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 grayscale-[0.25]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B0F] via-[#090B0F]/70 to-[#090B0F]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090B0F]/90 via-[#090B0F]/40 to-transparent" />

        <div className="relative z-10 flex min-h-screen flex-col p-12 xl:p-16">
          <Link to="/" className="inline-flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              STREN
            </span>
          </Link>

          <div className="mt-auto max-w-xl pb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-5">
              Performance Workspace
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-[-0.03em] text-[#F8FAFC]">
              Train Smarter.
              <br />
              <span className="text-[#94A3B8]">Coach with Precision.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm xl:text-base leading-relaxed text-[#94A3B8]">
              Manage members, structured workouts, training assignments, live
              sessions, and body measurements in one connected platform.
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: FORM OUTLET */}
      <section className="relative flex w-full lg:w-1/2 flex-col items-center justify-center p-4 sm:p-8 xl:p-16 z-10">
        {/* Mobile Brand Header */}
        <div className="lg:hidden w-full max-w-md mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F8FAFC]">
              STREN
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            Back to overview
          </Link>
        </div>

        {/* Form Card Surface */}
        <div className="relative z-10 w-full max-w-md rounded-[20px] border border-[#2A3039] bg-[#13171D] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;

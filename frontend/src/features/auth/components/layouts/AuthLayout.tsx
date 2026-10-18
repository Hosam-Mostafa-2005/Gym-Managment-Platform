// src/features/auth/components/layouts/AuthLayout.tsx
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
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
    <main className="min-h-screen w-full flex bg-[#0B0D10] text-[#F5F6F8] font-sans selection:bg-[#4FE080] selection:text-[#0B0D10]">
      {/* LEFT PANEL: BRANDING & HERO (Approximately 49% on desktop) */}
      <section className="relative hidden lg:flex w-[49%] min-h-screen flex-col overflow-hidden border-r border-[#252B33] bg-[#0B0D10]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 grayscale-[0.2]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/70 to-[#0B0D10]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D10]/95 via-[#0B0D10]/50 to-[#0B0D10]/20" />

        <div className="relative z-10 flex min-h-screen flex-col p-10 xl:p-14 2xl:p-16">
          <Link to="/" className="inline-flex items-center w-fit">
            <span className="text-3xl font-extrabold tracking-tight text-[#F5F6F8]">
              STREN
            </span>
          </Link>

          <div className="mt-auto max-w-xl pb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4FE080]/30 bg-[#121E17] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#4FE080] mb-5">
              PLATFORM ACCESS
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.08] tracking-[-0.03em] text-[#F5F6F8]">
              Train Smarter.
              <br />
              <span className="text-[#9CA3AF]">Manage Better.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm xl:text-base leading-relaxed text-[#91A0B5]">
              Manage members, workouts, assignments and progress from one modern
              platform designed for high-performance facilities.
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: AUTHENTICATION FORM */}
      <section className="relative flex flex-1 min-h-screen flex-col items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 z-10 bg-[#0B0D10]">
        {/* Mobile Brand Header */}
        <div className="lg:hidden w-full max-w-[480px] mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <span className="text-2xl font-bold tracking-tight text-[#F5F6F8]">
              STREN
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs font-medium text-[#91A0B5] hover:text-[#F5F6F8] transition-colors"
          >
            Back to overview
          </Link>
        </div>

        {/* Form Container (Direct surface on #0B0D10, matching reference layout) */}
        <div className="w-full max-w-[480px]">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;

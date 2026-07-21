import { Dumbbell } from "lucide-react";
import { Outlet } from "react-router-dom";
import "./auth.css";
import heroImage from "@/assets/Generated image 1.png";

const AuthLayout = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        {/* ================= Hero ================= */}
        <section className="relative hidden border-r border-border lg:flex">
          {/* Background Gradient */}
          <>
            {/* Image */}
            <div
              className="absolute inset-0 bg-cover bg-[position:10%_center]"
              style={{
                backgroundImage: `url(${heroImage})`,
              }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 " />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/90" />
          </>
          <div className="pad">
            <div className="relative mx-auto flex h-full w-full max-w-xl flex-col justify-between px-24 py-20 xl:px-28">
              {/* Logo */}
              <div>
                <div className="flex h-16  w-16 items-center justify-center rounded-3xl bg-primary text-background shadow-lg shadow-primary/20">
                  <Dumbbell className="h-8 w-8" />
                </div>
              </div>

              {/* Hero Content */}
              <div>
                <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground">
                  Train Smarter.
                  <br />
                  Manage Better.
                </h1>

                <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">
                  Manage members, workouts, assignments and progress from one
                  modern platform designed for gyms, coaches and fitness
                  businesses.
                </p>
              </div>

              {/* هنضيف Feature Cards هنا بعدين */}
              <div className="mt-16" />
            </div>

            {/* Footer */}
            <div>
              <p className="text-sm tracking-wide text-muted-foreground">
                Built for modern fitness businesses.
              </p>
            </div>
          </div>
        </section>

        {/* ================= Right Side ================= */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-lg">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;

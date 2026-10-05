import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Adjust this import to point to your actual authentication hook
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

import OverviewHero from "../components/OverviewHero";
import OverviewFeatures from "../components/OverviewFeatures";
import OverviewCTA from "../components/OverviewCTA";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();

  // Redirect authenticated users to the actual application
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Prevent flashing the public overview if auth is still resolving
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0D1014]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  // If the user exists, return null to block rendering while navigation completes
  if (user) return null;

  return (
    // The relative wrapper establishes the coordinate system for the sticky children.
    // Because each child is h-screen, this wrapper naturally has a height of 300vh,
    // allowing the normal browser scroll bar to drive the layered transitions natively.
    <main className="relative bg-[#0D1014] selection:bg-[#5BE584]/30">
      <OverviewHero />
      <OverviewFeatures />
      <OverviewCTA />
    </main>
  );
}

// src/features/auth/components/GoogleAuthButton.tsx
import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleAuthButtonProps {
  mode?: "signin" | "signup";
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = "signin",
  disabled = false,
}) => {
  const { t } = useTranslation("auth");
  const containerRef = useRef<HTMLDivElement>(null);
  const googleMutation = useGoogleAuth();
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "223238339735-74boaq5cf0ntijdv7of6eb358cgkoqo2.apps.googleusercontent.com";

  useEffect(() => {
    if (!googleClientId) {
      setScriptError(
        t(
          "google.missingClientId",
          "Google authentication requires VITE_GOOGLE_CLIENT_ID.",
        ),
      );
      return;
    }

    let isMounted = true;

    const initializeGoogle = () => {
      if (!isMounted) return;
      if (!window.google?.accounts?.id) {
        setScriptError(
          t(
            "google.scriptFailed",
            "Google Identity Services failed to load. Check ad blocker or network settings.",
          ),
        );
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential?: string }) => {
            if (response?.credential) {
              googleMutation.mutate(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          const clientWidth = containerRef.current.clientWidth || 360;
          // Google Identity Services requires width between 200 and 400 pixels
          const containerWidth = Math.max(200, Math.min(clientWidth, 400));

          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: mode === "signup" ? "signup_with" : "continue_with",
            shape: "pill",
            logo_alignment: "left",
            width: containerWidth,
          });
        }

        setIsReady(true);
        setScriptError(null);

        // Attempt One Tap prompt (non-blocking)
        try {
          window.google.accounts.id.prompt();
        } catch {
          // Gracefully suppress prompt errors if dismissed or blocked
        }
      } catch (err: any) {
        if (isMounted) {
          setScriptError(
            err.message ||
              t("google.initFailed", "Failed to initialize Google Sign-In."),
          );
        }
      }
    };

    // If Google script is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      // Check if script tag exists; if not, dynamically inject it
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      ) as HTMLScriptElement;

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", initializeGoogle);
      script.addEventListener("error", () => {
        if (isMounted) {
          setScriptError(
            t(
              "google.loadError",
              "Could not load Google authentication script. Please check your network or ad blocker.",
            ),
          );
        }
      });
    }

    return () => {
      isMounted = false;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // Ignore
      }
    };
  }, [googleClientId, mode, t]);

  if (!googleClientId) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
        <span>
          {t(
            "google.missingClientId",
            "Google authentication requires VITE_GOOGLE_CLIENT_ID.",
          )}
        </span>
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{scriptError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Pending / Mutating Overlay */}
      {googleMutation.isPending && (
        <div className="flex h-[44px] w-full items-center justify-center gap-2.5 rounded-full border border-[#252B33] bg-[#171B20] text-sm font-medium text-[#F5F6F8]">
          <Loader2 className="h-4 w-4 animate-spin text-[#5BE584]" />
          <span>{t("google.connecting", "Connecting to Google...")}</span>
        </div>
      )}

      {/* Rendered Google Identity Services Button */}
      <div
        className={`w-full flex justify-center ${
          googleMutation.isPending ? "hidden" : "block"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <div
          ref={containerRef}
          className="w-full flex justify-center min-h-[44px]"
        />
        {!isReady && (
          <div className="flex h-[44px] w-full items-center justify-center gap-2.5 rounded-full border border-[#252B33] bg-[#171B20] text-sm font-medium text-[#91A0B5]">
            <GoogleIcon className="h-4 w-4" />
            <span>{t("google.loading", "Loading Google Sign-In...")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

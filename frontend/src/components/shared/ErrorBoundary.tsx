import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleNavigateHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] flex items-center justify-center p-4">
          <div className="relative z-10 mx-auto max-w-md w-full rounded-2xl border border-red-900/40 bg-[#101418] p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/60 text-red-400 border border-red-900/50 mx-auto mb-5 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-7 w-7 stroke-[2.2]" />
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              Something went wrong
            </h1>

            <p className="mt-2 text-xs text-[#9CA3AF] leading-relaxed">
              An unexpected error occurred while rendering this view. Your saved data remains secure on STREN.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 rounded-xl border border-white/5 bg-[#090B0E] p-3 text-left font-mono text-[11px] text-[#9CA3AF] max-h-24 overflow-y-auto break-all">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-semibold text-[#090B0F] hover:bg-[#49D472] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleNavigateHome}
                className="inline-flex items-center gap-2 rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

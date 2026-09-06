import React, { useState } from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RotateCw, Home, Copy, Check, ChevronDown, ChevronUp, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AppErrorViewProps {
  error?: any;
  onReset?: () => void;
}

export function AppErrorView({ error: customError, onReset }: AppErrorViewProps) {
  let routerError: any = null;
  try {
    routerError = useRouteError();
  } catch {
    // Not inside a router error context
  }

  const error = customError || routerError;
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  let errorMessage = "An unexpected runtime error occurred in the application.";
  let errorStack = "";
  let statusCode = "";

  if (isRouteErrorResponse(error)) {
    statusCode = `${error.status}`;
    errorMessage = error.statusText || error.data?.message || `HTTP Error ${error.status}`;
  } else if (error instanceof Error) {
    errorMessage = error.message || error.toString();
    errorStack = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object") {
    errorMessage = error.message || JSON.stringify(error, null, 2);
    errorStack = error.stack || "";
  }

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleCopyReport = () => {
    const report = [
      `MODPKG Crash Report`,
      `Date: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `User Agent: ${navigator.userAgent}`,
      `Error: ${errorMessage}`,
      errorStack ? `\nStack Trace:\n${errorStack}` : "",
    ].join("\n");

    navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success("Error report copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl p-6 sm:p-7 flex flex-col text-left overflow-hidden">
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#FE5000]/10 border border-[#FE5000]/25 flex items-center justify-center text-[#FE5000] shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            {statusCode && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60">
                HTTP {statusCode}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 font-medium">
              Application Error
            </span>
          </div>
        </div>

        {/* Title & Explanation */}
        <h2 className="text-xl font-bold text-white tracking-tight">
          Something went wrong
        </h2>
        <p className="text-xs sm:text-sm text-white/50 mt-1 leading-relaxed">
          The application ran into an unexpected error. You can reload the page or return to the home screen.
        </p>

        {/* Simplified Error Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-red-400 break-words select-text">
          {errorMessage}
        </div>

        {/* Optional Collapsible Stack Trace */}
        {errorStack && (
          <div className="mt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <span>{showDetails ? "Hide stack trace" : "Show stack trace"}</span>
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showDetails && (
              <pre className="mt-2 max-h-36 overflow-y-auto p-3 rounded-xl bg-black text-[10px] font-mono text-white/40 leading-relaxed custom-scrollbar select-text border border-white/5">
                {errorStack}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E1E1E]">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReload}
              className="bg-[#FE5000] hover:bg-[#E04700] text-white font-semibold rounded-xl h-10 px-4 gap-2 border-0 active:scale-95 transition-all shadow-md shadow-[#FE5000]/20"
            >
              <RotateCw className="w-4 h-4" />
              <span>Reload Page</span>
            </Button>

            <Button
              onClick={handleGoHome}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-[#1E1E1E] rounded-xl h-10 px-4 gap-2 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>

          <Button
            onClick={handleCopyReport}
            variant="outline"
            className="rounded-xl border-[#262626] text-white/60 hover:text-white hover:bg-[#1E1E1E] h-10 px-3 gap-1.5 text-xs transition-all ml-auto"
            title="Copy full crash details to report a bug"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#45D66F]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Report Bug"}</span>
          </Button>
        </div>

      </div>
    </div>
  );
}

// React Router errorElement export
export function AppErrorBoundary() {
  return <AppErrorView />;
}

// React Class Component ErrorBoundary for general tree wrapping
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <AppErrorView
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

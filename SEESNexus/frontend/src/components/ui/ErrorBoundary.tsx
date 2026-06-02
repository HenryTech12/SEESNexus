import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-emerald-500 font-mono p-4">
          <h1 className="text-4xl font-black mb-4">SYSTEM_CRITICAL_ERROR</h1>
          <p className="mb-8 text-center max-w-md">
            The Nexus interface has encountered a memory leak or runtime distortion.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-glow-mint"
          >
            REBOOT_INTERFACE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

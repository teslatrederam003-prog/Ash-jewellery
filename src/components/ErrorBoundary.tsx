import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#FFF8EC]">
          <div className="bg-white border-2 border-[#D4A017] rounded-sm p-8 max-w-lg w-full text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-red-100 text-[#9B1C2F] flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#2A1810]">
              {this.props.fallbackTitle || "Couldn't load the collection. Please refresh."}
            </h2>

            <p className="text-xs text-[#7A6A5C] mt-2 leading-relaxed">
              {this.props.fallbackMessage ||
                "We encountered an unexpected issue while communicating with the store service. Please try reloading or return to the main showcase."}
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-sm text-left text-[11px] font-mono text-red-700 overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#9B1C2F] text-white font-bold text-xs uppercase tracking-wider border border-[#D4A017] hover:bg-[#7D1626] transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-white text-[#2A1810] font-bold text-xs uppercase tracking-wider border border-[#EFE1C8] hover:bg-[#FFF8EC] hover:border-[#D4A017] transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

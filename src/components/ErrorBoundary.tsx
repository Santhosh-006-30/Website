import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error('[ErrorBoundary caught error]:', error, errorInfo);

    // Auto-recover once from stale chunk loading errors after new production deployments
    const isChunkLoadFailed =
      error.name === 'ChunkLoadError' ||
      /Loading (CSS )?chunk (\d+ )?failed/i.test(error.message) ||
      /Failed to fetch dynamically imported module/i.test(error.message);

    if (isChunkLoadFailed) {
      const hasReloaded = sessionStorage.getItem('lia_chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('lia_chunk_reload', 'true');
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    sessionStorage.removeItem('lia_chunk_reload');
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#07111F] text-slate-100 flex items-center justify-center p-4 selection:bg-[#D7B65A]/30">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-white/10 bg-gradient-to-br from-[#10233D]/90 via-[#0c192e]/90 to-[#07111F] p-8 sm:p-10 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-[#D7B65A] shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Something Went Wrong
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                An unexpected interface error occurred. You can reload the page or return to the main homepage.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-md shadow-[#D7B65A]/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#D7B65A]" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

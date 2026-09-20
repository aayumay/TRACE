import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('TRACE Uncaught Error Boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl liquid-glass border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-fraunces text-2xl font-medium text-foreground">
              Archive Anomaly Detected
            </h2>
            <p className="font-ui text-xs text-muted leading-relaxed">
              An unexpected error occurred while rendering this digital dossier. Telemetry and state have been safely quarantined.
            </p>
            {this.state.error?.message && (
              <p className="font-ibm-mono text-[11px] text-destructive/90 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-left overflow-x-auto">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-xs font-ibm-mono uppercase tracking-wider font-medium hover:bg-accent/90 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recover Session</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center scanlines bg-background">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-foreground mb-2">System Error</h2>
          <p className="text-muted-foreground font-mono text-sm max-w-md bg-card p-4 border border-border">
            {this.state.error?.message || 'An unexpected error occurred during execution.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 border border-primary text-primary px-4 py-2 font-mono text-xs uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Re-Initialize
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

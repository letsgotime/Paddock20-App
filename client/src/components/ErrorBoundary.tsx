import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-[#FFD700] h-8 w-8" />
              <h2 className="text-xl font-bold text-white">Application Error</h2>
            </div>
            <div className="bg-black/40 p-4 rounded-md mb-4 overflow-auto max-h-[300px]">
              <p className="text-[#FF9999] font-mono text-sm mb-2">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              <details className="mt-2">
                <summary className="text-[#1982FC] cursor-pointer mb-2">Show Component Stack</summary>
                <pre className="text-gray-400 text-xs overflow-auto">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => window.location.reload()}
              >
                Reload Application
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
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryFallbackRenderProps = {
  error: Error | null;
  reset: () => void;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (props: ErrorBoundaryFallbackRenderProps) => ReactNode;
  contextName?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "ErrorBoundary caught an error",
      this.props.contextName ?? "unknown",
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          reset: this.reset,
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="rounded-none border border-border bg-card p-4">
          <p className="font-display italic text-on-surface">
            Something went wrong while loading this section.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex rounded-none border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] text-on-surface hover:bg-surface-container-low"
            onClick={this.reset}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface IslandErrorFallbackProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function IslandErrorFallback({
  title = "This section had trouble loading.",
  description = "The rest of the page still works. You can try again.",
  actionLabel = "Try again",
  onAction,
}: IslandErrorFallbackProps) {
  return (
    <div role="alert" className="rounded-none border border-border bg-card p-4 md:p-5">
      <p className="font-display text-base italic text-on-surface">{title}</p>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
      {onAction && (
        <button
          type="button"
          className="mt-4 inline-flex rounded-none border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] text-on-surface hover:bg-surface-container-low"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

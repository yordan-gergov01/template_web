import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: unknown;
}

/** Last line of defence: shows a friendly page instead of a blank one when rendering fails. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- development-only diagnostics
      console.error(error, info.componentStack);
    }
  }

  override render() {
    if (this.state.error === null) {
      return this.props.children;
    }
    return (
      <main>
        <h1>Something went wrong</h1>
        <p>The page could not be displayed. Reload the page to try again.</p>
        {import.meta.env.DEV && this.state.error instanceof Error && (
          <pre>{this.state.error.message}</pre>
        )}
      </main>
    );
  }
}

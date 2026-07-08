import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { failed: boolean }

export function KeyboardErrorFallback() {
  return (
    <div className="keyboard-error-fallback" role="status">
      <img src="/assets/keyboard.png" alt="Mechanical keyboard with colorful keycaps" />
      <p>Interactive keyboard is unavailable right now.</p>
      <a href="/blog/">Explore build notes</a>
    </div>
  );
}

export default class KeyboardErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Interactive keyboard failed to render', error, info);
  }

  render() {
    if (this.state.failed) {
      return <KeyboardErrorFallback />;
    }
    return this.props.children;
  }
}

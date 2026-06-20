import React from 'react';

type State = {
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="max-w-sm rounded-3xl bg-white p-5 text-center shadow-xl">
          <div className="text-4xl">⚠️</div>
          <h1 className="mt-3 font-display text-xl font-bold text-ink">
            App crash detected
          </h1>
          <p className="mt-2 text-sm text-red-600 break-words">
            {this.state.error.message}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('bakeart-location');
              localStorage.removeItem('bakeart-customer-profile');
              window.location.reload();
            }}
            className="mt-4 rounded-2xl bg-coral px-5 py-3 text-sm font-bold text-white"
          >
            Reset saved checkout data
          </button>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 block w-full rounded-2xl bg-ink/5 px-5 py-3 text-sm font-bold text-ink"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

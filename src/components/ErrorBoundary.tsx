import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24,
          background: '#FBF7F5', textAlign: 'center', fontFamily: 'sans-serif',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontWeight: 700, fontSize: 18, color: '#1A1311', marginBottom: 8 }}>
            কিছু একটা ভুল হয়েছে
          </h1>
          <pre style={{
            fontSize: 11, color: '#999', maxWidth: 360, overflow: 'auto',
            background: '#fff', padding: 12, borderRadius: 12, textAlign: 'left',
            marginBottom: 16, maxHeight: 200,
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            style={{
              padding: '12px 24px', borderRadius: 16, background: '#F25E73',
              color: 'white', fontWeight: 700, border: 'none', fontSize: 13,
            }}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

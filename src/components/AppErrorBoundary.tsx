import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null; }

const isAuthNetworkError = (error: Error | null) =>
  /auth\/network-request-failed|network-request-failed/i.test(`${error?.name ?? ''} ${error?.message ?? ''}`);

export default class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AppErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      if (isAuthNetworkError(this.state.error)) {
        return (
          <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-6 text-center">
            <div className="w-full max-w-sm rounded-[28px] border border-border bg-surface p-6 shadow-card">
              <h2 className="text-[20px] font-bold text-ink">সংযোগ পাওয়া যায়নি</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
                Login সার্ভারে পৌঁছানো যায়নি। ইনকগনিটো/প্রাইভেট মোডে কখনো IndexedDB ব্লক হয়, অথবা নেটওয়ার্ক আটকে যায়। কেক দেখা যাবে — অর্ডার/লগইনের জন্য সাধারণ ট্যাবে খুলুন, অথবা ইন্টারনেট চেক করুন।
              </p>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="mt-5 h-12 w-full rounded-2xl bg-coral text-[14px] font-bold text-white shadow-btn"
              >
                গেস্ট হিসেবে চালিয়ে যান
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 h-11 w-full rounded-2xl bg-secondary text-[13px] font-bold text-coral"
              >
                আবার চেষ্টা
              </button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ padding: '20px', background: '#fff0f3', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', wordBreak: 'break-word' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px' }}>🚨</div>
            <h2 style={{ color: '#d32f2f', margin: '10px 0' }}>App Crash Detected</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>Screenshot this page and send it to fix the bug.</p>
          </div>
          <div style={{ background: '#fff', border: '2px solid #d32f2f', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
            <h3 style={{ color: '#d32f2f', margin: '0 0 10px 0', fontSize: '14px' }}>🔴 Error Message</h3>
            <pre style={{ background: '#ffebee', padding: '10px', borderRadius: '8px', overflow: 'auto', fontSize: '12px', color: '#c62828', margin: 0 }}>
              {this.state.error?.name}: {this.state.error?.message}
            </pre>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
            <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '14px' }}>📍 Stack Trace (screenshot this)</h3>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', overflow: 'auto', fontSize: '11px', color: '#333', maxHeight: '200px', margin: 0 }}>
              {this.state.error?.stack || 'No stack trace'}
            </pre>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '15px' }}>
            <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '14px' }}>🧩 Component Stack</h3>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', overflow: 'auto', fontSize: '11px', color: '#333', maxHeight: '150px', margin: 0 }}>
              {this.state.errorInfo?.componentStack || 'No component info'}
            </pre>
          </div>
          <button onClick={() => window.location.reload()} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            🔄 Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

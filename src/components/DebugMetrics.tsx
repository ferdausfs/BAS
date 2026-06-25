import React, { useEffect, useRef } from 'react';
import { useDebug } from '../lib/debug';

export default function DebugMetrics() {
  const { enabled, fps, clicks, incClicks, setFps, lastError } = useDebug();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    
    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onClick = () => incClicks();
    window.addEventListener('click', onClick, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('click', onClick);
    };
  }, [enabled, setFps, incClicks]);

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 6,
      left: 6,
      zIndex: 999999,
      background: 'rgba(0,0,0,0.88)',
      color: '#00ff41',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 10,
      padding: '6px 10px',
      borderRadius: 6,
      lineHeight: 1.5,
      pointerEvents: 'none',
      userSelect: 'none',
      minWidth: 120,
      maxWidth: 180,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: 9, marginBottom: 3, textTransform: 'uppercase' }}>
        🐛 Admin Debug
      </div>
      <div>FPS: {fps}</div>
      <div>Clicks: {clicks}</div>
      <div>Tab: {(window as any).__BAKEART_TAB__ || '—'}</div>
      {lastError && (
        <div style={{ color: '#ff4444', marginTop: 3, fontSize: 9, wordBreak: 'break-word' }}>
          ⚠️ {lastError}
        </div>
      )}
    </div>
  );
}

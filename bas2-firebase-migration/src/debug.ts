import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DebugState {
  enabled: boolean;
  toggle: () => void;
  fps: number;
  setFps: (n: number) => void;
  clicks: number;
  incClicks: () => void;
  lastError: string;
  setLastError: (s: string) => void;
}

export const useDebug = create<DebugState>()(
  persist(
    (set) => ({
      enabled: false,
      fps: 0,
      clicks: 0,
      lastError: '',
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setFps: (fps) => set({ fps }),
      incClicks: () => set((s) => ({ clicks: s.clicks + 1 })),
      setLastError: (lastError) => set({ lastError }),
    }),
    { name: 'bakeart-debug-v2' }
  )
);

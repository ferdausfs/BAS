import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  });
}

// Global image-error fallback — any <img> that fails to load gets the cake logo
// as a fallback (prevents broken-image icons across the whole app). Individual
// <img> tags may still set their own onerror (which fires first and can prevent
// this one by calling event.stopImmediatePropagation()); but the global handler
// ensures every image in the app has at least a safe fallback.
document.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (target.dataset.basFallbackApplied === '1') return;
    if (target.src.includes('logo-cake.png')) return; // already fallback
    target.dataset.basFallbackApplied = '1';
    target.onerror = null;
    target.src = '/cakes/logo-cake.png';
  },
  true // capture phase, so it fires before element-local handlers
);

createRoot(document.getElementById("root")!).render(<App />);

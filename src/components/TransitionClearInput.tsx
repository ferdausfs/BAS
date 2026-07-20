import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const TRANSITION_CLEAR_STYLES = `
:root {
  --clear-dur: 1000ms;
  --clear-out-dur: 400ms;
  --clear-in-dur: 400ms;
  --clear-out-fly: 12px;
  --clear-in-fly: 12px;
  --clear-out-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --clear-in-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --clear-blur: 2px;
  --glow-delay: 50ms;
  --glow-peak-at: 0.15;
  --glow-opacity: 0.85;
  --glow-spread: 1.5;
}
.t-clear { position: relative; overflow: hidden; }
.t-clear-mirror,
.t-clear-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  z-index: 2;
}
.t-clear-mirror { opacity: 0; }
.t-clear.has-value .t-clear-mirror,
.t-clear.is-clearing .t-clear-mirror { opacity: 1; }
.t-clear.has-value > input,
.t-clear.is-clearing > input { -webkit-text-fill-color: transparent; }
.t-clear.has-value .t-clear-placeholder { opacity: 0; }
.t-clear-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 3;
  mix-blend-mode: multiply;
}
@media (prefers-reduced-motion: reduce) {
  .t-clear-glow { opacity: 0 !important; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('transitions-p13')) {
  const style = document.createElement('style');
  style.id = 'transitions-p13';
  style.textContent = TRANSITION_CLEAR_STYLES;
  document.head.appendChild(style);
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  inputClassName: string;
  textLayerClassName: string;
  clearButtonClassName?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export default function TransitionClearInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  inputMode,
  autoFocus,
  disabled,
  readOnly,
  inputRef,
  className = '',
  inputClassName,
  textLayerClassName,
  clearButtonClassName = 'absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-text-secondary transition active:scale-90',
  onFocus,
  onBlur,
  onKeyDown,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const fakePhRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isClearing = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.classList.toggle('has-value', value.length > 0);
    if (value && mirrorRef.current) mirrorRef.current.textContent = value.replace(/ /g, '\u00a0');
  }, [value]);

  const setInputRefs = (node: HTMLInputElement | null) => {
    localInputRef.current = node;
    if (!inputRef) return;
    if (typeof inputRef === 'function') inputRef(node);
    else (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const onClear = () => {
    const wrap = wrapRef.current;
    const input = localInputRef.current;
    const mirror = mirrorRef.current;
    const fakePh = fakePhRef.current;
    const glow = glowRef.current;
    if (!wrap || !input || !mirror || !fakePh || !glow) return;
    if (isClearing.current || !value) return;
    isClearing.current = true;
    const wasFocused = document.activeElement === input;
    mirror.textContent = value.replace(/ /g, '\u00a0');
    const bg = buildLayers(wrap, mirror.textContent);
    const peakAt = readNum('--glow-peak-at', 0.15);
    const opacity = readNum('--glow-opacity', 0.42);
    const total = readNum('--clear-dur', 1000);
    const outDur = readNum('--clear-out-dur', 400);
    const inDur = readNum('--clear-in-dur', 400);
    const outFly = readNum('--clear-out-fly', 12);
    const inFly = readNum('--clear-in-fly', 12);
    const blurPx = readNum('--clear-blur', 2);
    const glowDly = readNum('--glow-delay', 50);
    const eOut = makeEase(readEase('--clear-out-ease', 'cubic-bezier(0.22, 1, 0.36, 1)'));
    const eIn = makeEase(readEase('--clear-in-ease', 'cubic-bezier(0.22, 1, 0.36, 1)'));

    onChange('');
    wrap.classList.remove('has-value');
    wrap.classList.add('is-clearing');
    fakePh.style.transform = `translateY(-${inFly}px)`;
    fakePh.style.opacity = '0.9';
    fakePh.style.filter = `blur(${blurPx}px)`;
    glow.style.background = bg;
    glow.style.opacity = '0';

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / total);
      const e = eOut(Math.min(1, elapsed / outDur));
      mirror.style.transform = `translateY(${(e * outFly).toFixed(1)}px)`;
      mirror.style.opacity = (1 - e).toFixed(3);
      mirror.style.filter = `blur(${(e * blurPx).toFixed(1)}px)`;
      const pe = eIn(Math.min(1, elapsed / inDur));
      fakePh.style.transform = `translateY(${(-inFly + pe * inFly).toFixed(1)}px)`;
      fakePh.style.opacity = (0.9 + pe * 0.1).toFixed(3);
      fakePh.style.filter = `blur(${(blurPx - pe * blurPx).toFixed(1)}px)`;
      let g = 0;
      if (elapsed > glowDly) {
        const remaining = Math.max(1, total - glowDly);
        const gp = Math.min(1, (elapsed - glowDly) / remaining);
        g = gp < peakAt ? gp / peakAt : 1 - (gp - peakAt) / (1 - peakAt);
      }
      glow.style.opacity = (g * opacity).toFixed(3);
      if (p < 1) requestAnimationFrame(tick);
      else {
        wrap.classList.remove('is-clearing');
        for (const el of [mirror, fakePh]) el.style.cssText = '';
        mirror.textContent = '';
        glow.style.opacity = '0';
        glow.style.background = '';
        isClearing.current = false;
        if (wasFocused) input.focus({ preventScroll: true });
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <div ref={wrapRef} className={`t-clear ${className}`}>
      <input
        ref={setInputRefs}
        type={type}
        value={value}
        inputMode={inputMode}
        autoFocus={autoFocus}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={inputClassName}
      />
      <div ref={mirrorRef} className={`t-clear-mirror ${textLayerClassName}`} aria-hidden="true" />
      <div ref={fakePhRef} className={`t-clear-placeholder ${textLayerClassName}`} aria-hidden="true">
        {placeholder}
      </div>
      <div ref={glowRef} className="t-clear-glow" aria-hidden="true" />
      {value && !readOnly && !disabled && (
        <button
          type="button"
          className={clearButtonClassName}
          aria-label="Clear"
          onPointerDown={(event) => { if (document.activeElement === localInputRef.current) event.preventDefault(); }}
          onMouseDown={(event) => { if (document.activeElement === localInputRef.current) event.preventDefault(); }}
          onClick={onClear}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function buildLayers(wrap: HTMLElement, text: string) {
  const inputW = wrap.clientWidth || 280;
  const padLeft = 32;
  const segments = text.split(/(\s+)/);
  const spread = readNum('--glow-spread', 1.5);
  const ctx = ((buildLayers as any)._ctx ||= (() => {
    const c = document.createElement('canvas').getContext('2d');
    if (c) c.font = '400 13px Inter, sans-serif';
    return c;
  })());
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const rgb = isDark ? '255,255,255' : '0,0,0';
  const layers: string[] = [];
  let x = 0;
  for (const seg of segments) {
    const w = ctx?.measureText(seg).width ?? seg.length * 7;
    if (seg.trim()) {
      const cx = padLeft + x + w / 2;
      const hw = Math.max(w * 0.45, 8) * spread;
      const stops = [
        { dx: 0, rw: hw * 0.8, rh: 7, a: 0.22 },
        { dx: hw * 0.45, rw: hw * 0.55, rh: 8, a: 0.18 },
        { dx: -hw * 0.4, rw: hw * 0.65, rh: 6, a: 0.16 },
        { dx: hw * 0.15, rw: hw * 0.9, rh: 5, a: 0.14 },
      ];
      for (const l of stops) {
        const lx = (((cx + l.dx) / inputW) * 100).toFixed(2);
        layers.push(`radial-gradient(ellipse ${Math.max(l.rw, 2).toFixed(1)}px ${l.rh}px at ${lx}% 100%, rgba(${rgb},${l.a.toFixed(3)}), transparent)`);
      }
    }
    x += w;
  }
  return layers.join(', ');
}

function readNum(name: string, fb: number) {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(v) ? v : fb;
}
function readEase(name: string, fb: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fb;
}
function makeEase(ease: string) {
  const m = ease.match(/cubic-bezier\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/i);
  if (!m) return (t: number) => t;
  const [x1, y1, x2, y2] = [m[1], m[2], m[3], m[4]].map(parseFloat);
  const cx = 3 * x1; const bx = 3 * (x2 - x1) - cx; const ax = 1 - cx - bx;
  const cy = 3 * y1; const by = 3 * (y2 - y1) - cy; const ay = 1 - cy - by;
  const sX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sY = (s: number) => ((ay * s + by) * s + cy) * s;
  const dX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let s = t;
    for (let i = 0; i < 8; i++) {
      const dx = sX(s) - t;
      if (Math.abs(dx) < 1e-6) break;
      const d = dX(s);
      if (d === 0) break;
      s -= dx / d;
    }
    return sY(s);
  };
}

import { useEffect, useState } from 'react';

/**
 * Keeps a sheet/modal mounted for `exitMs` after `open` flips to false, so a
 * reverse (closing) animation can play instead of an instant unmount.
 *
 * USAGE:
 *   const { mounted, closing } = useSheetTransition(open);
 *   if (!mounted) return null;
 *   <div className={closing ? 'anim-fade-out' : 'anim-fade'}>
 *     <div className={closing ? 'anim-down' : 'anim-up'}>...</div>
 *   </div>
 *
 * `exitMs` should match the exit animation's CSS duration (see
 * `.anim-down` / `.anim-fade-out` / `.anim-right-out` in index.css).
 */
export function useSheetTransition(open: boolean, exitMs = 220) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, exitMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return { mounted, closing };
}

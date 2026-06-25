// src/hooks/useModalDepth.ts
//
// PURPOSE: Call this hook inside any modal/sheet/popup component to
// automatically hide the BottomTabBar while the modal is mounted.
//
// USAGE:
//   import { useModalDepth } from '../hooks/useModalDepth';
//
//   export default function MyModal({ open }: { open: boolean }) {
//     useModalDepth(open);   // ← one line, done
//     if (!open) return null;
//     return <div>...</div>;
//   }
//
// HOW IT WORKS:
//   - When `open` becomes true  → increments global modalDepth counter
//   - When `open` becomes false → decrements global modalDepth counter
//   - BottomTabBar hides whenever modalDepth > 0
//   - Counter-based (not boolean) so multiple simultaneous modals work correctly
//

import { useEffect } from 'react';
import { useUI } from '../lib/store';

export function useModalDepth(open: boolean) {
  const openModal = useUI((s) => s.openModal);
  const closeModal = useUI((s) => s.closeModal);

  useEffect(() => {
    if (open) {
      openModal();
      return () => closeModal();
    }
  }, [open, openModal, closeModal]);
}

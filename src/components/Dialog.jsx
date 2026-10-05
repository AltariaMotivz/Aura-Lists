import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Native modal semantics provide a focus trap, Escape handling and focus return.
export default function Dialog({ children, onClose, labelledBy }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={dialogRef} className="aura-dialog" aria-labelledby={labelledBy} onCancel={onClose}>
      {children}
    </dialog>, document.body
  );
}

import type { MouseEvent } from "react";

// Native light dismiss for modal <dialog>s: spread onto the element. React's types do not
// know `closedby` yet; it renders as a plain attribute.
export const closedByAny = { closedby: "any" } as Record<string, string>;

// True when a click on a modal dialog landed on its ::backdrop. Test the pointer position:
// a target check alone would also match clicks in the dialog's own padding.
export function clickedBackdrop(event: MouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  if (event.target !== dialog) return false;
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
}

// Where `closedby` is unsupported (Safari), close on a click on the backdrop.
export function lightDismissFallback(event: MouseEvent<HTMLDialogElement>) {
  if ("closedBy" in HTMLDialogElement.prototype) return;
  if (clickedBackdrop(event)) event.currentTarget.close();
}

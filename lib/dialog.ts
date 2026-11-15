import type { MouseEvent } from "react";

// Native light dismiss for modal <dialog>s: spread onto the element. React's types do not
// know `closedby` yet; it renders as a plain attribute.
export const closedByAny = { closedby: "any" } as Record<string, string>;

// Where `closedby` is unsupported (Safari), close on a click whose pointer lies outside the
// dialog box. A target check alone would also close on clicks in the dialog's own padding.
export function lightDismissFallback(event: MouseEvent<HTMLDialogElement>) {
  if ("closedBy" in HTMLDialogElement.prototype) return;
  const dialog = event.currentTarget;
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
}

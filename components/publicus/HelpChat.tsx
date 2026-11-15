"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// The panel, its fact sheet and supabase-js load on first open, so the page's own JS stays small.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });
const noop = () => () => {};

export default function HelpChat() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null), restore = useRef(false);
  // The launcher is hidden while the panel is open, so focus returns once it is back.
  useEffect(() => { if (!open && restore.current) { restore.current = false; launcher.current?.focus(); } }, [open]);
  if (!hydrated) return null;
  function close() { restore.current = true; setOpen(false); }
  return <>
    <button ref={launcher} type="button" className="pu-chat-launch" aria-haspopup="dialog" aria-expanded={open} hidden={open} onClick={() => { setLoaded(true); setOpen(true); }}>Ask a question</button>
    {loaded && <ChatPanel open={open} onClose={close}/>}
  </>;
}

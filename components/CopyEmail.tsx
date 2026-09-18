"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PROFILE } from "@/lib/content";

const subscribe = () => () => {};

export default function CopyEmail() {
  const [status, setStatus] = useState("");
  const available = useSyncExternalStore(
    subscribe,
    () => Boolean(navigator.clipboard?.writeText),
    () => false,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  if (!available) return null;
  return (
    <div>
      <button
        type="button"
        className="button-secondary"
        onClick={async () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          try {
            await navigator.clipboard.writeText(PROFILE.email);
            setStatus("Email copied.");
          } catch {
            setStatus(
              "Couldn’t copy. Select the email address above to copy it.",
            );
          }
          timerRef.current = setTimeout(() => setStatus(""), 5000);
        }}
      >
        Copy email
      </button>
      <span
        role="status"
        className="mt-2 block max-w-[32ch] text-xs leading-relaxed text-muted"
      >
        {status}
      </span>
    </div>
  );
}

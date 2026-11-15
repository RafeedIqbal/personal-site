"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type Ref } from "react";
import { rowFromHash } from "@/lib/publicus/records";

// The same box before and after mounting, so nothing shifts while the chunk loads.
const Placeholder = ({ ref }: { ref?: Ref<HTMLDivElement> }) => <div ref={ref} className="pu-demo-loading"><p>Loading the explorer…</p></div>;
const Workspace = dynamic(() => import("./Workspace"), { loading: () => <Placeholder/>, ssr: false });

// The explorer sits mid-page, so its code and sample data load as the reader approaches it.
// It mounts at once when a link targets one of its rows (#records, #cb-NN) or a private
// workspace was connected on an earlier visit and should reconnect.
export default function DemoLoader() {
  const anchor = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const mount = () => setMounted(true);
    let returning = false;
    try { returning = localStorage.getItem("publicus-connected") === "1"; } catch { /* Blocked storage: wait for scroll. */ }
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) mount(); }, { rootMargin: "600px 0px" });
    const onHash = () => { if (rowFromHash(window.location.hash)) mount(); };
    if (returning || rowFromHash(window.location.hash)) queueMicrotask(mount);
    else if (anchor.current) observer.observe(anchor.current);
    window.addEventListener("hashchange", onHash);
    return () => { observer.disconnect(); window.removeEventListener("hashchange", onHash); };
  }, [mounted]);

  return <>{mounted ? <Workspace/> : <Placeholder ref={anchor}/>}<noscript><div className="pu-demo-loading"><p>The explorer needs JavaScript. Everything else on this page works without it.</p></div></noscript></>;
}

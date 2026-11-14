"use client";

import dynamic from "next/dynamic";

const Workspace = dynamic(() => import("./Workspace"), { loading: () => <div className="pu-demo-loading"><span className="pu-micro">PROCUREMENT EXPLORER</span><p>Loading the workspace…</p></div>, ssr: false });
export default function DemoLoader() {
  return <><Workspace/><noscript><div className="pu-demo-loading"><p>Enable JavaScript to explore the interactive workspace. The experience, research, and résumé on this page are available without it.</p></div></noscript></>;
}

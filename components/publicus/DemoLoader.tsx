"use client";

import dynamic from "next/dynamic";

const Workspace = dynamic(() => import("./Workspace"), { loading: () => <div className="pu-demo-loading"><p>Loading the explorer…</p></div>, ssr: false });
export default function DemoLoader() {
  return <><Workspace/><noscript><div className="pu-demo-loading"><p>The explorer needs JavaScript. Everything else on this page works without it.</p></div></noscript></>;
}

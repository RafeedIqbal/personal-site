import type { ReactNode } from "react";

// Icons and badges shared by the explorer, its setup screen and its tour.
export type IconType = "grid" | "brief" | "source" | "arrow" | "expand" | "external" | "down" | "up" | "search" | "check" | "alert" | "close" | "play" | "sliders";
const paths: Record<IconType, string> = { grid: "M3 3h6v6H3zM13 3h6v6h-6zM3 13h6v6H3zM13 13h6v6h-6z", brief: "M4 6h14v13H4zM8 6V3h6v3M4 11h14M9 11v3h4v-3", source: "M5 2h9l4 4v14H5zM14 2v5h4M8 11h7M8 15h7", arrow: "M4 11h13M12 6l5 5-5 5", expand: "M3 8V3h5M14 3h5v5M19 14v5h-5M8 19H3v-5", external: "M7 15L15 7M8 7h7v7", down: "M11 4v13M6 12l5 5 5-5", up: "M11 18V5M6 10l5-5 5 5", search: "M9.5 16a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM14.5 14.5L19 19", check: "M5 11.5l4 4 8-9", alert: "M11 5v8M11 16.5v.5", close: "M6 6l10 10M16 6L6 16", play: "M7 4.5l10 6.5-10 6.5z", sliders: "M3 6h9M16 6h3M3 16h3M10 16h9M14 3.5v5M8 13.5v5" };
export function Icon({ type, size = 18 }: { type: IconType; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type]}/></svg>;
}
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "violet" }) { return <span className={`px-badge px-badge-${tone}`}>{children}</span>; }

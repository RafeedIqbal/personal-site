import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader, Schibsted_Grotesk } from "next/font/google";
import "./belong.css";

// Only the fonts above the fold are preloaded: Newsreader (the hero) and Plex Sans (the
// hero bar). The italic cut (147 KB) is a separate file used for bylines and figure numbers.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader-italic",
  style: "italic",
  axes: ["opsz"],
  preload: false,
});

const grotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk-display",
  weight: ["700", "800"],
  preload: false,
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  preload: false,
});

export default function BelongLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="belong" className={`belong ${newsreader.variable} ${newsreaderItalic.variable} ${grotesk.variable} ${plexSans.variable} ${plexMono.variable}`}>
      {children}
    </div>
  );
}

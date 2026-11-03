import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./belong.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
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
});

export default function BelongLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="belong" className={`belong ${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      {children}
    </div>
  );
}

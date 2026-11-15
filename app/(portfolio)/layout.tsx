import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

// The weight lists keep each variable font's file to the weights in use; omitting them
// loads the full axis (about 9 KB more), and Turbopack does not accept a range.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

// The portfolio's fonts preload only on its own route; /belong and /publicus bring their own.
// The wrapper uses display: contents, so it carries the font variables without adding a box.
export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`portfolio-fonts ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      {children}
    </div>
  );
}

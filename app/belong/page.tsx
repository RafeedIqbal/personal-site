import type { Metadata, Viewport } from "next";
import { DemoProvider } from "@/components/belong/demo";
import Masthead from "@/components/belong/Masthead";
import Architecture from "@/sections/belong/Architecture";
import BreakFile from "@/sections/belong/BreakFile";
import Colophon from "@/sections/belong/Colophon";
import Hero from "@/sections/belong/Hero";
import Judged from "@/sections/belong/Judged";
import NextStep from "@/sections/belong/NextStep";
import Ownership from "@/sections/belong/Ownership";
import Problem from "@/sections/belong/Problem";

const title = "Making the machine right";
const description =
  "A working proposal for Belong's two accuracy problems, with a fictional E-2 file you can break.";

// Shared by unlisted link only: kept out of search, the sitemap and robots.txt.
export const metadata: Metadata = {
  title,
  description,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: "/belong" },
  openGraph: { title, description, url: "/belong", type: "article" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#EDF0F3",
  colorScheme: "light",
};

export default function BelongPage() {
  return (
    <DemoProvider>
      <a className="bl-skip bl-ui" href="#break">
        Skip to the demo
      </a>
      <Masthead />
      <main id="top">
        <Hero />
        <Problem />
        <Architecture />
        <BreakFile />
        <Judged />
        <Ownership />
        <NextStep />
      </main>
      <Colophon />
    </DemoProvider>
  );
}

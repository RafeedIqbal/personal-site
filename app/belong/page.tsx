import type { Metadata, Viewport } from "next";
import { DemoProvider } from "@/components/belong/demo";
import BreakFile from "@/sections/belong/BreakFile";
import Colophon from "@/sections/belong/Colophon";
import Coverage from "@/sections/belong/Coverage";
import Evidence from "@/sections/belong/Evidence";
import Hero from "@/sections/belong/Hero";
import Judged from "@/sections/belong/Judged";
import Knowledge from "@/sections/belong/Knowledge";
import Loop from "@/sections/belong/Loop";
import Milestones from "@/sections/belong/Milestones";
import NextStep from "@/sections/belong/NextStep";
import Ownership from "@/sections/belong/Ownership";
import Problem from "@/sections/belong/Problem";
import Routing from "@/sections/belong/Routing";
import System from "@/sections/belong/System";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F4EE" },
    { media: "(prefers-color-scheme: dark)", color: "#10171E" },
  ],
  colorScheme: "light dark",
};

export default function BelongPage() {
  return (
    <DemoProvider>
      <a className="bl-skip bl-ui" href="#break">
        Skip to the demo
      </a>
      <main id="top">
        <Hero />
        <Problem />
        <BreakFile />
        <Coverage />
        <System />
        <Routing />
        <Evidence />
        <Knowledge />
        <Loop />
        <Judged />
        <Ownership />
        <Milestones />
        <NextStep />
      </main>
      <Colophon />
    </DemoProvider>
  );
}

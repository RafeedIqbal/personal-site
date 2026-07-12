import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rafeed.dev"),
  title: {
    default: "Rafeed Iqbal — Portfolio",
    template: "%s — Rafeed Iqbal",
  },
  description:
    "Software Engineer & Product Leader. Building products at the intersection of code and strategy.",
  applicationName: "Rafeed Iqbal — Portfolio",
  keywords: [
    "Rafeed Iqbal",
    "Software Engineer",
    "Product Leader",
    "Portfolio",
    "Full-stack Developer",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "Rafeed Iqbal", url: "https://rafeed.dev" }],
  creator: "Rafeed Iqbal",
  publisher: "Rafeed Iqbal",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rafeed Iqbal — Portfolio",
    description: "Software Engineer & Product Leader.",
    url: "https://rafeed.dev",
    siteName: "rafeed.dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rafeed Iqbal — Portfolio",
    description: "Software Engineer & Product Leader.",
  },
  appleWebApp: {
    capable: true,
    title: "Rafeed Iqbal",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body>
        {/* Without JS the scroll-reveal animations never fire, so force the
            animated content visible for no-JS visitors and crawlers. The raw
            HTML keeps React 19 from hoisting the rule out of <noscript>. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.js-reveal{opacity:1 !important;transform:none !important;}</style>",
          }}
        />
        {children}
      </body>
    </html>
  );
}

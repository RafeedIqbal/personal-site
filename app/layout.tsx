import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { PROFILE } from "@/lib/content";
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

const title = `${PROFILE.name} — Portfolio`;
const description = `${PROFILE.title}. ${PROFILE.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.siteUrl),
  title: {
    default: title,
    template: `%s — ${PROFILE.name}`,
  },
  description,
  applicationName: title,
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
  authors: [{ name: PROFILE.name, url: PROFILE.siteUrl }],
  creator: PROFILE.name,
  publisher: PROFILE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: PROFILE.siteUrl,
    siteName: "rafeed.dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  appleWebApp: {
    capable: true,
    title: PROFILE.name,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: PROFILE.name,
              url: PROFILE.siteUrl,
              jobTitle: PROFILE.title,
              sameAs: [PROFILE.githubUrl, PROFILE.linkedinUrl],
            }).replace(/</g, "\\u003c"),
          }}
        />
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

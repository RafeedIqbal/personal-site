import type { Metadata, Viewport } from "next";
import { PROFILE } from "@/lib/content";
import "./globals.css";

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
  themeColor: "#111315",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Fonts are loaded per route: app/(portfolio)/layout.tsx, app/belong and app/publicus.
    <html lang="en">
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
        {children}
      </body>
    </html>
  );
}

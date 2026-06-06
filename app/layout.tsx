import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rafeed.dev"),
  title: "Rafeed Iqbal — Portfolio",
  description:
    "Software Engineer & Product Manager. Building products at the intersection of code and strategy.",
  openGraph: {
    title: "Rafeed Iqbal — Portfolio",
    description: "Software Engineer & Product Manager.",
    url: "https://rafeed.dev",
    siteName: "rafeed.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rafeed Iqbal — Portfolio",
    description: "Software Engineer & Product Manager.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
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

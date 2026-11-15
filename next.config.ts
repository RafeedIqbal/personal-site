import type { NextConfig } from "next";

// Every page is prerendered, so the CSP is static: a nonce would force dynamic rendering.
// Next's inline flight scripts need 'unsafe-inline'; the policy still blocks foreign
// script, connect, frame and image origins. Trusted Types are not enforced because the
// Turbopack runtime assigns script.src without a policy.
const production = process.env.NODE_ENV === "production";

// Vercel injects its toolbar on preview deployments only. Origins from
// https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
const toolbar = process.env.VERCEL_ENV === "preview"
  ? {
    script: ["https://vercel.live"],
    style: ["https://vercel.live"],
    img: ["https://vercel.live", "https://vercel.com", "data:", "blob:"],
    font: ["https://vercel.live", "https://assets.vercel.com"],
    connect: ["https://vercel.live", "wss://ws-us3.pusher.com"],
    frame: ["https://vercel.live"],
  }
  : { script: [], style: [], img: [], font: [], connect: [], frame: [] };

function httpsOrigin(value: string | undefined) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

function contentSecurityPolicy(connect: string[] = []) {
  if (!production) {
    // Dev needs eval and a websocket for HMR; keep only the framing and plugin rules.
    return "frame-ancestors 'none'; base-uri 'none'; object-src 'none'";
  }
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...toolbar.script],
    "style-src": ["'self'", "'unsafe-inline'", ...toolbar.style],
    "img-src": ["'self'", ...toolbar.img],
    "font-src": ["'self'", ...toolbar.font],
    "media-src": ["'self'"],
    "connect-src": ["'self'", ...connect, ...toolbar.connect],
    "manifest-src": ["'self'"],
    "frame-src": toolbar.frame.length ? toolbar.frame : ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
}

// Only /publicus talks to Supabase (auth, edge functions, signed uploads).
const supabase = httpsOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Screenshots are static files that change only with a deploy.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), fullscreen=(self)",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
        ],
      },
      {
        // Later entries override earlier ones for the same header key.
        source: "/publicus/:path*",
        headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy(supabase ? [supabase] : []) }],
      },
      // Link previews and icons may be embedded by other sites.
      ...["/opengraph-image", "/twitter-image", "/:segment/opengraph-image", "/:segment/twitter-image", "/icon.svg", "/apple-icon", "/favicon.ico"].map((source) => ({
        source,
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      })),
      {
        // Unlisted pages and their image routes: shared by link only, never indexed.
        source: "/belong/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/publicus/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;

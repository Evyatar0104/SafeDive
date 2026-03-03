import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Configure caching for PWA
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  }
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  async headers() {
    // CSP notes:
    //  - 'unsafe-inline' in script-src: required by Next.js hydration & next-themes
    //    (they inject inline <script> tags for theme flash prevention)
    //  - 'unsafe-eval' in script-src: required by some bundled libraries
    //    (react-chessboard / chess.js internal eval usage)
    //  - 'unsafe-inline' in style-src: required for Tailwind / framer-motion inline styles
    //  - Allowlisted only the image/font/API origins the app actually uses
    //  - frame-ancestors 'none' blocks clickjacking at CSP level
    const ContentSecurityPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://image.pollinations.ai https://upload.wikimedia.org",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://fonts.googleapis.com https://en.wikipedia.org https://upload.wikimedia.org",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // --- Content Security ---
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          // --- Clickjacking Defence ---
          { key: "X-Frame-Options", value: "DENY" },
          // --- MIME Sniffing ---
          { key: "X-Content-Type-Options", value: "nosniff" },
          // --- Referrer Leakage ---
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // --- Browser Feature Restrictions ---
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // --- Force HTTPS (enable when deployed to production with HTTPS) ---
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);


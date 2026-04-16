import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import path from "path";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERSION: packageJson.version,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.vaticannews.va',
      },
      {
        protocol: 'https',
        hostname: 'vaticannews.va',
      }
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
      {
        // Proxy static assets (logos, certificates, etc.) served by the API
        source: "/storage/:path*",
        destination: `${apiBase}/storage/:path*`,
      },
    ];
  },
  turbopack: {
    // Explicitly set the monorepo root to silence inference warnings.
    // Must be an absolute path in recent Next.js versions.
    root: path.resolve(__dirname, '..'),
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;

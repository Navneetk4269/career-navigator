import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL
  ?.replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return backendUrl
      ? [
          {
            source: "/api/:path*",
            destination: `${backendUrl}/api/:path*`,
          },
        ]
      : [];
  },
};

export default nextConfig;

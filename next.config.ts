import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Extracted runtime image lacked next-auth module augmentation historically.
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "pg",
    "@prisma/adapter-pg",
    "@prisma/client",
    "prisma",
    "sharp",
  ],
  experimental: {
    proxyClientMaxBodySize: "85mb",
  },
};

export default nextConfig;

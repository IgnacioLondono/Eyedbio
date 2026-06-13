import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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

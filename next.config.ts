import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "pg",
    "@prisma/adapter-pg",
    "@prisma/client",
    "prisma",
  ],
  experimental: {
    proxyClientMaxBodySize: "55mb",
  },
};

export default nextConfig;

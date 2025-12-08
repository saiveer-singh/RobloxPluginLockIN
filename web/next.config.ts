import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackBuildWorker: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

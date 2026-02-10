import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore type errors from parent directory files
    ignoreBuildErrors: false,
  },
  // Set turbopack root to this directory
  turbopack: {
    root: '.',
  },
};

export default nextConfig;

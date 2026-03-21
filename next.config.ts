import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Disable linting and type checking during build to allow the APK assets to generate
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // We REMOVE 'output: export' because Server Actions are not supported in static mode.
  // We will use the 'Live URL' method for the APK.
};

export default nextConfig;

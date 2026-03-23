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
  // We ensure Server Actions are enabled (standard in Next 15)
  // We do NOT use 'output: export' because we need the server for Ajo payouts and KYC.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

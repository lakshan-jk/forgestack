import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow importing TS source directly from workspace packages.
  transpilePackages: ['@forgestack/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;

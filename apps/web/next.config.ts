import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow importing TS source directly from workspace packages.
  transpilePackages: ['@forgestack/shared'],
  experimental: {
    typedRoutes: true,
  },
  // The shared package uses ESM-style `.js` import specifiers that resolve to
  // `.ts` source. tsx/tsc handle this natively; webpack needs to be told.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;

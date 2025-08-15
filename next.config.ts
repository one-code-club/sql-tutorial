import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'duckdb',
        '@mapbox/node-pre-gyp',
        'aws-sdk',
        'mock-aws-s3',
        'nock',
      ];
    }
    return config;
  },
};

export default nextConfig;



import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lp-mp-pearl.vercel.app',
      },
    ],
  },
};

export default nextConfig;

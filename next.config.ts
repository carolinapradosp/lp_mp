import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'express-pharma-seven.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'www.expresspharma.com.br',
      },
      {
        protocol: 'https',
        hostname: 'expresspharma.com.br',
      },
    ],
  },
};

export default nextConfig;

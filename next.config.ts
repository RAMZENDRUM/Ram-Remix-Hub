import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['three'] = path.resolve(__dirname, 'node_modules/three')
    return config
  },
  turbopack: {},
};

export default nextConfig;

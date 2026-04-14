import type { NextConfig } from "next";
import pkg from "./package.json";
const { version } = pkg;

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    TIMEZONE: 'UTC',
    version
  },
  experimental: {
    useCache: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname:'/**'
      },
    ],
  },
};

export default nextConfig;

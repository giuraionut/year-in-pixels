import type { NextConfig } from "next";
const { version } = require("./package.json")

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

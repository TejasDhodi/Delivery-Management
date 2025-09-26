import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://delivery-management-mulr.onrender.com/api/:path*',
      },
    ]
  },
};

export default nextConfig;

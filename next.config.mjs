/** @type {import('next').NextConfig} */

const API_BACKEND = process.env.API_BACKEND_URL || "https://delightful-encouragement-production-878d.up.railway.app";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' data: blob: https://res.cloudinary.com https://uploadthing.com https://utfs.io; font-src 'self' data:; connect-src 'self' https://delightful-encouragement-production-878d.up.railway.app https://uploadthing.com; frame-src 'self' https://accounts.google.com; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

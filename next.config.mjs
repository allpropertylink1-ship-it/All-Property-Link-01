/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";
const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

const nextConfig = {
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "api.allpropertylink.co.ke",
      },
      {
        protocol: "https",
        hostname: "allpropertylink.co.ke",
      },
      {
        protocol: "https",
        hostname: "delightful-encouragement-production-878d.up.railway.app",
      },
    ],
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
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/agents", destination: "/aplreps", permanent: true },
      { source: "/agents/:id", destination: "/aplreps/:id", permanent: true },
      // Option B consolidation: /fundis merged into /services (type=FUNDI).
      // Incoming query (?category=&city=&search=&page=) is merged automatically.
      { source: "/fundis", destination: "/services?type=FUNDI", permanent: true },
    ];
  },
};

export default nextConfig;

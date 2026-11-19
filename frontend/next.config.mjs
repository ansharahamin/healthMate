/** @type {import('next').NextConfig} */
const backendUrl = (
  process.env.HEALTHMATE_API_URL
  || process.env.VITE_API_URL
  || "https://backend-gxdj.vercel.app"
).replace(/\/+$/, "");

const nextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "src/app/globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

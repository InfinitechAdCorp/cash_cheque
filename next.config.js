/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/signatures/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/api/signatures/**", // Add this line
      },
      {
        protocol: "https",
        hostname: "infinitech-api1.site",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "infinitech-api1.site",
        pathname: "/signatures/**",
      },
      {
        protocol: "https",
        hostname: "infinitech-api1.site",
        pathname: "/api/signatures/**", // Add this line for production too
      },
    ],
  },
}

module.exports = nextConfig

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Serve alicdn images pre-sized straight from Alibaba's CDN instead of
    // proxying every image through our runtime optimizer. See image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "**.aliexpress.com",
      },
      {
        protocol: "https",
        hostname: "images.kittycontrol.shop",
      },
    ],
  },
};

export default nextConfig;

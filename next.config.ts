import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        // `/categories` rendered an empty state in production — nothing in the
        // application ever creates an ImportedCategory row, so the only writer
        // is the admin "clear the slate" delete. It was linked from the header,
        // the footer and the homepage hero, and listed in the sitemap. Those
        // links now go to real collection pages; this catches the indexed URL
        // and any external link that still points here.
        //
        // `permanent: true` yields a 308, which is the same status the PDP
        // returns when a product's slug moves — redirects are resolved before
        // the filesystem, so this also covers the deleted route.
        source: "/categories",
        destination: "/products",
        permanent: true,
      },
    ];
  },
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

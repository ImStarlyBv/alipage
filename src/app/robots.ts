import type { MetadataRoute } from "next";

const SITE_URL = "https://kittycontrol.shop";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/auth/",
          "/checkout/",
          "/cart",
          "/*?callbackUrl*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/models";

const SITE_URL = "https://kittycontrol.shop";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, slug: true, updatedAt: true },
    });

    productPages = products.map((product) => ({
      // The stored slug is the URL the page actually serves, so the sitemap and
      // the PDP can't disagree about a product's address.
      url: `${SITE_URL}/products/${product.slug ?? product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] failed to load products:", err);
  }

  return [...staticPages, ...productPages];
}

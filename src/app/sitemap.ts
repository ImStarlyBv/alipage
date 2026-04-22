import type { MetadataRoute } from "next";
import { prisma } from "@/lib/models";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";

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
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, title: true, updatedAt: true, images: true },
    });
    const slugMap = buildProductSlugMap(products);

    productPages = products.map((product) => {
      const images = Array.isArray(product.images)
        ? (product.images as string[]).filter((u) => typeof u === "string")
        : [];
      return {
        url: `${SITE_URL}/products/${slugMap.get(product.id) || product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: images.slice(0, 5),
      };
    });
  } catch (err) {
    console.error("[sitemap] failed to load products:", err);
  }

  return [...staticPages, ...productPages];
}

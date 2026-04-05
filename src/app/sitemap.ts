import type { MetadataRoute } from "next";
import { prisma } from "@/lib/models";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
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

  // Dynamic product pages
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category pages
  const categories = await prisma.importedCategory.findMany({
    select: { id: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/categories/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}

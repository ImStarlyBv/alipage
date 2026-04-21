import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const BASE_URL = "https://kittycontrol.shop";
const KIE_API_KEY = "d56149c6bc8091b6550179fa24f60a08";
const KIE_BASE_URL = "https://api.kie.ai/api/v1";

const R2_BUCKET = "lui";
const R2_PUBLIC_URL = "https://images.kittycontrol.shop";

const r2 = new S3Client({
  region: "auto",
  endpoint: "https://e8087f01f77b4a7ccdcbccc18b04da3c.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "f2d5a0332afe8bd1391dea360041c941",
    secretAccessKey: "4d5af256cb5ca3f3e790f89f3236a1cb80b83010e6ab0558bd35bc7427a6b090",
  },
});

async function uploadToR2(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download image from kie.ai: ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const ext = contentType.split("/")[1]?.split(";")[0] ?? "jpg";
  const key = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await res.arrayBuffer());
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
  return `${R2_PUBLIC_URL}/${key}`;
}

const server = new McpServer({
  name: "kittycontrol-seo",
  version: "1.0.0",
});

// ─── SEO tools ───────────────────────────────────────────────────────────────

server.tool(
  "list_products",
  "List all products in the store with their current titles. Supports pagination.",
  {
    page: z.number().int().min(1).default(1).describe("Page number"),
    limit: z.number().int().min(1).max(50).default(50).describe("Products per page (max 50)"),
  },
  async ({ page, limit }) => {
    const res = await fetch(`${BASE_URL}/api/products?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const lines = data.products.map(
      (p) => `id: ${p.id} | title: ${p.title}`
    );
    return {
      content: [
        {
          type: "text",
          text: `Page ${page} of ${data.pagination.totalPages} (${data.pagination.total} total)\n\n${lines.join("\n")}`,
        },
      ],
    };
  }
);

server.tool(
  "rename_product",
  "Update the visible title of a product for SEO purposes. Does not affect the product ID.",
  {
    id: z.string().describe("The internal product ID (from list_products)"),
    title: z.string().min(1).describe("The new SEO-optimized title"),
  },
  async ({ id, title }) => {
    const res = await fetch(`${BASE_URL}/api/admin/products/${id}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to rename: ${err.error ?? res.status}`);
    }
    const data = await res.json();
    return {
      content: [
        {
          type: "text",
          text: `Renamed successfully:\nID: ${data.product.id}\nNew title: ${data.product.title}`,
        },
      ],
    };
  }
);

// ─── Image tools ─────────────────────────────────────────────────────────────

server.tool(
  "list_product_images",
  "List all products with their current image URLs. Use this before transforming images.",
  {
    page: z.number().int().min(1).default(1).describe("Page number"),
    limit: z.number().int().min(1).max(50).default(20).describe("Products per page (max 50)"),
  },
  async ({ page, limit }) => {
    const res = await fetch(`${BASE_URL}/api/products?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const lines = data.products.map((p) => {
      const imgs = Array.isArray(p.images) ? p.images : [];
      return `id: ${p.id} | title: ${p.title}\n  images (${imgs.length}): ${imgs.join(" | ")}`;
    });
    return {
      content: [
        {
          type: "text",
          text: `Page ${page} of ${data.pagination.totalPages} (${data.pagination.total} total)\n\n${lines.join("\n\n")}`,
        },
      ],
    };
  }
);

server.tool(
  "update_product_images",
  "Replace all images for a product with new URLs (e.g. after AI transformation).",
  {
    id: z.string().describe("The product ID"),
    images: z.array(z.string().url()).min(1).describe("New image URLs to set on the product"),
  },
  async ({ id, images }) => {
    const res = await fetch(`${BASE_URL}/api/admin/products/${id}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update images: ${err.error ?? res.status}`);
    }
    const data = await res.json();
    const imgs = Array.isArray(data.product.images) ? data.product.images : [];
    return {
      content: [
        {
          type: "text",
          text: `Updated images for product ${data.product.id} ("${data.product.title}"):\n${imgs.join("\n")}`,
        },
      ],
    };
  }
);

// ─── AI image transformation tools ───────────────────────────────────────────

server.tool(
  "transform_image",
  "Send a product image to kie.ai (wan/2-7-image model) for AI transformation to make it look original. Polls until complete and returns the new image URLs. This can take 30–120 seconds.",
  {
    image_url: z.string().url().describe("The original product image URL to transform"),
    prompt: z
      .string()
      .default(
        "Transform this product photo into a professional, high-quality original image. Keep the same product, composition, lighting angle, and overall style, but make it look like a fresh original product photo with clean background, sharp details, and professional studio quality."
      )
      .describe("Transformation prompt for the AI model"),
    resolution: z
      .enum(["720P", "1080P", "2K", "4K"])
      .default("1080P")
      .describe("Output resolution"),
  },
  async ({ image_url, prompt, resolution }) => {
    // 1. Create the task
    const createRes = await fetch(`${KIE_BASE_URL}/jobs/createTask`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "wan/2-7-image",
        input: {
          prompt,
          input_urls: [image_url],
          n: 1,
          enable_sequential: false,
          resolution,
          thinking_mode: false,
          watermark: false,
          seed: 0,
          bbox_list: [[]],
        },
      }),
    });

    if (!createRes.ok) {
      const txt = await createRes.text().catch(() => "");
      throw new Error(`kie.ai createTask failed (${createRes.status}): ${txt}`);
    }
    const createData = await createRes.json();
    if (createData.code !== 200) {
      throw new Error(`kie.ai error: ${createData.msg}`);
    }
    const taskId = createData.data.taskId;

    // 2. Poll until complete (max 3 minutes, every 5 seconds)
    const maxAttempts = 36;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, 5000));

      const pollRes = await fetch(
        `${KIE_BASE_URL}/jobs/recordInfo?taskId=${taskId}`,
        { headers: { Authorization: `Bearer ${KIE_API_KEY}` } }
      );
      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();
      if (pollData.code !== 200) continue;

      const { state, resultJson, failMsg, failCode } = pollData.data;

      if (state === "failed") {
        throw new Error(`kie.ai task failed — code: ${failCode}, msg: ${failMsg}`);
      }

      if (state === "success" && resultJson) {
        let result;
        try {
          result = JSON.parse(resultJson);
        } catch {
          throw new Error("kie.ai returned malformed resultJson");
        }
        const kieUrls = result.resultUrls ?? [];
        const r2Urls = await Promise.all(kieUrls.map(uploadToR2));
        return {
          content: [
            {
              type: "text",
              text: `Task ${taskId} completed.\nR2 image URLs:\n${r2Urls.join("\n")}`,
            },
          ],
        };
      }
      // still pending/processing — keep polling
    }

    throw new Error(`kie.ai task ${taskId} timed out after 3 minutes`);
  }
);

server.tool(
  "transform_and_update_product_images",
  "Full pipeline: take a product's existing images, transform each with kie.ai, then update the product with the new URLs. Use list_product_images first to see what's available.",
  {
    product_id: z.string().describe("The product ID to update"),
    image_urls: z
      .array(z.string().url())
      .min(1)
      .describe("The original image URLs to transform (copy from list_product_images)"),
    prompt: z
      .string()
      .default(
        "Transform this product photo into a professional, high-quality original image. Keep the same product, composition, lighting angle, and overall style, but make it look like a fresh original product photo with clean background, sharp details, and professional studio quality."
      )
      .describe("Transformation prompt for the AI model"),
  },
  async ({ product_id, image_urls, prompt }) => {
    const results = [];

    for (const image_url of image_urls) {
      // Create task
      const createRes = await fetch(`${KIE_BASE_URL}/jobs/createTask`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KIE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "wan/2-7-image",
          input: {
            prompt,
            input_urls: [image_url],
            n: 1,
            enable_sequential: false,
            resolution: "1080P",
            thinking_mode: false,
            watermark: false,
            seed: 0,
            bbox_list: [[]],
          },
        }),
      });

      if (!createRes.ok) {
        results.push(`SKIP ${image_url} — createTask HTTP ${createRes.status}`);
        continue;
      }
      const createData = await createRes.json();
      if (createData.code !== 200) {
        results.push(`SKIP ${image_url} — ${createData.msg}`);
        continue;
      }
      const taskId = createData.data.taskId;

      // Poll
      let newUrl = null;
      for (let attempt = 0; attempt < 36; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const pollRes = await fetch(
          `${KIE_BASE_URL}/jobs/recordInfo?taskId=${taskId}`,
          { headers: { Authorization: `Bearer ${KIE_API_KEY}` } }
        );
        if (!pollRes.ok) continue;
        const pollData = await pollRes.json();
        if (pollData.code !== 200) continue;
        const { state, resultJson } = pollData.data;
        if (state === "failed") break;
        if (state === "success" && resultJson) {
          try {
            const r = JSON.parse(resultJson);
            const kieUrl = (r.resultUrls ?? [])[0] ?? null;
            if (kieUrl) newUrl = await uploadToR2(kieUrl);
          } catch {
            // ignore
          }
          break;
        }
      }

      if (newUrl) {
        results.push(`OK ${image_url} → ${newUrl}`);
      } else {
        results.push(`FAILED ${image_url} — timed out or no result`);
        // keep original on failure
        newUrl = image_url;
      }
    }

    // Collect new URLs (use original if transformation failed)
    const newImages = image_urls.map((orig, i) => {
      const line = results[i];
      if (line && line.startsWith("OK ")) {
        const arrow = line.indexOf(" → ");
        return line.slice(arrow + 3);
      }
      return orig;
    });

    // Update the product
    const updateRes = await fetch(`${BASE_URL}/api/admin/products/${product_id}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: newImages }),
    });

    const updateOk = updateRes.ok;
    const summary = results.join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Transformation results:\n${summary}\n\nProduct update: ${updateOk ? "SUCCESS" : `FAILED (HTTP ${updateRes.status})`}`,
        },
      ],
    };
  }
);

// ─── Bulk transform ───────────────────────────────────────────────────────────

async function transformOneImage(imageUrl, prompt) {
  const createRes = await fetch(`${KIE_BASE_URL}/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "wan/2-7-image",
      input: {
        prompt,
        input_urls: [imageUrl],
        n: 1,
        enable_sequential: false,
        resolution: "1080P",
        thinking_mode: false,
        watermark: false,
        seed: 0,
        bbox_list: [[]],
      },
    }),
  });
  if (!createRes.ok) return null;
  const createData = await createRes.json();
  if (createData.code !== 200) return null;
  const taskId = createData.data.taskId;

  for (let i = 0; i < 36; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const pollRes = await fetch(`${KIE_BASE_URL}/jobs/recordInfo?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${KIE_API_KEY}` },
    });
    if (!pollRes.ok) continue;
    const pollData = await pollRes.json();
    if (pollData.code !== 200) continue;
    const { state, resultJson } = pollData.data;
    if (state === "failed") return null;
    if (state === "success" && resultJson) {
      try {
        const r = JSON.parse(resultJson);
        const kieUrl = (r.resultUrls ?? [])[0] ?? null;
        if (!kieUrl) return null;
        return await uploadToR2(kieUrl);
      } catch {
        return null;
      }
    }
  }
  return null;
}

server.tool(
  "transform_all_products",
  "Bulk pipeline: paginate through ALL products, transform every image with kie.ai, and update each product. Processes one page at a time to avoid timeouts. Returns a per-product summary. WARNING: slow — each image takes ~30-120s.",
  {
    page: z.number().int().min(1).default(1).describe("Which page of products to process (run repeatedly to cover all pages)"),
    limit: z.number().int().min(1).max(10).default(5).describe("Products per batch (keep low to avoid timeout, max 10)"),
    prompt: z
      .string()
      .default(
        "Transform this product photo into a professional, high-quality original image. Keep the same product, composition, lighting angle, and overall style, but make it look like a fresh original product photo with clean background, sharp details, and professional studio quality."
      )
      .describe("Transformation prompt applied to every image"),
    max_images_per_product: z
      .number().int().min(1).max(5).default(2)
      .describe("Max images to transform per product (keeps costs down, uses originals for the rest)"),
  },
  async ({ page, limit, prompt, max_images_per_product }) => {
    const res = await fetch(`${BASE_URL}/api/products?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    const data = await res.json();
    const products = data.products;

    const report = [];

    for (const product of products) {
      const originalImages = Array.isArray(product.images) ? product.images : [];
      if (originalImages.length === 0) {
        report.push(`[${product.id}] "${product.title}" — no images, skipped`);
        continue;
      }

      const toTransform = originalImages.slice(0, max_images_per_product);
      const untouched = originalImages.slice(max_images_per_product);
      const newImages = [...untouched]; // will prepend transformed ones

      const imageResults = [];
      for (const imgUrl of toTransform) {
        const newUrl = await transformOneImage(imgUrl, prompt);
        if (newUrl) {
          imageResults.push(`  OK: ${imgUrl} → ${newUrl}`);
          newImages.unshift(newUrl);
        } else {
          imageResults.push(`  FAILED: ${imgUrl} (kept original)`);
          newImages.unshift(imgUrl);
        }
      }

      const updateRes = await fetch(`${BASE_URL}/api/admin/products/${product.id}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      });

      const updateStatus = updateRes.ok ? "updated" : `update failed (${updateRes.status})`;
      report.push(`[${product.id}] "${product.title}" — ${updateStatus}\n${imageResults.join("\n")}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Page ${page}/${data.pagination.totalPages} (${data.pagination.total} total products)\n\n${report.join("\n\n")}`,
        },
      ],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);

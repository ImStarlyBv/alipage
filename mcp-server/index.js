import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://kittycontrol.shop";

const server = new McpServer({
  name: "kittycontrol-seo",
  version: "1.0.0",
});

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

const transport = new StdioServerTransport();
await server.connect(transport);

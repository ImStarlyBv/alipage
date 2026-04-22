# Image AI Transformation — Progress Log

## Stack
- **AI model**: kie.ai `wan/2-7-image` (image-to-image)
- **Storage**: Cloudflare R2 bucket `lui` → public at `https://images.kittycontrol.shop`
- **MCP server**: `mcp-server/index.js` (local stdio, `kittycontrol-seo`)
- **API endpoint**: `PATCH /api/admin/products/[id]/images`

---

## What's Done

### Backend API
- `src/app/api/admin/products/[id]/images/route.ts` — replaces all images for a product by ID

### MCP Tools (mcp-server/index.js)
| Tool | What it does |
|------|-------------|
| `list_product_images` | Lists all products with their current image URLs |
| `update_product_images` | Manually replace images for one product |
| `transform_image` | Transform a single image URL via kie.ai, upload result to R2, return R2 URL |
| `transform_and_update_product_images` | Full pipeline for one product |
| `transform_all_products` | Bulk pipeline — one page at a time |

### R2 Integration
- `uploadToR2(url)` helper: downloads any image URL, uploads to R2 with UUID filename, returns `https://images.kittycontrol.shop/<uuid>.<ext>`
- All three transform paths save R2 URLs to the DB (not kie.ai CDN URLs)
- `@aws-sdk/client-s3` installed in mcp-server (R2 is S3-compatible, pointed at Cloudflare endpoint)

---

## Bugs Fixed (in order)

### 1. AliExpress CDN blocked by kie.ai
- **Symptom**: All transformations returned FAILED, kept original URLs
- **Root cause**: kie.ai can't fetch `ae01.alicdn.com` URLs — they're blocked
- **Fix**: Added R2 proxy step before submitting to kie.ai. Each original image is first uploaded to R2, then the R2 URL is passed as `input_urls` to kie.ai
- **Commit**: `fix: proxy original images through R2 before sending to kie.ai`

### 2. `resolution` param not supported by wan/2-7-image
- **Symptom**: kie.ai returned `"resolution is not within the range of allowed options"`
- **Root cause**: The `resolution: "1080P"` field is not valid for this model
- **Fix**: Removed `resolution` from all kie.ai payloads (3 places)
- **Commits**: `fix: remove resolution param from kie.ai requests` + `fix: remove remaining resolution param from transformOneImage bulk helper`
- **Note**: The second commit was needed because the `replace_all` edit matched 12-space indented versions but missed the 8-space indented one in `transformOneImage`

---

## Active Prompt (applied to every image)

> *"This is a product photo. If there is an animal in the image, replace it with a cute cat in the exact same pose, position, and scale. If there is no animal, naturally add a cute cat to the scene. Keep all product details, background, lighting, and composition identical. The result must look like a professional product photo."*

---

## Bulk Run Plan

109 total products across 22 pages (limit 5 per batch, 2 images per product max).

Each image: ~30–120s on kie.ai. Each page batch: ~5–20 min.

Run sequentially — after each page completes, call the next:

```
transform_all_products(page=1,  limit=5, max_images_per_product=2)
transform_all_products(page=2,  limit=5, max_images_per_product=2)
...
transform_all_products(page=22, limit=5, max_images_per_product=2)
```

### Current status
- [x] Page 1 — pipeline confirmed working via `transform_image` test (R2 URL returned successfully)
- [ ] Page 1 bulk — pending (MCP reload in progress after final fix)
- [ ] Pages 2–22 — pending

---

## Reload Procedure
After any `mcp-server/index.js` change: `/mcp` → reconnect `kittycontrol-seo` in Claude Code.

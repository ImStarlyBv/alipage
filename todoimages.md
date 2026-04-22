# Image AI Transformation — Todo

## Credentials & Config (hardcoded in mcp-server/index.js)

### kie.ai
- API key: `d56149c6bc8091b6550179fa24f60a08`
- Model: `wan/2-7-image`
- Create task: `POST https://api.kie.ai/api/v1/jobs/createTask`
- Poll task: `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={id}`

### Cloudflare R2
- Account ID: `e8087f01f77b4a7ccdcbccc18b04da3c`
- Bucket: `lui`
- S3 endpoint: `https://e8087f01f77b4a7ccdcbccc18b04da3c.r2.cloudflarestorage.com`
- Access Key ID: `f2d5a0332afe8bd1391dea360041c941`
- Secret Access Key: `4d5af256cb5ca3f3e790f89f3236a1cb80b83010e6ab0558bd35bc7427a6b090`
- Public domain: `https://images.kittycontrol.shop`

---

## Done
- [x] **Task 1** — `PATCH /api/admin/products/[id]/images` endpoint (`src/app/api/admin/products/[id]/images/route.ts`)
- [x] **Task 2** — MCP tools: `list_product_images` + `update_product_images` (`mcp-server/index.js`)
- [x] **Task 3** — MCP tools: `transform_image` + `transform_and_update_product_images` (kie.ai wan/2-7-image, polls every 5s, max 3 min)
- [x] **Task 4** — `transform_all_products` bulk tool: paginates through all products, transforms up to N images per product, updates each one automatically
- [x] **Task 5** — MCP server syntax verified OK. Reload: `/mcp` → disable → re-enable `kittycontrol-seo`

## Blocked / Pending
- [x] **BLOCKER — Fix site (1016 error)**: Fixed (domain issues resolved per user).
- [x] **Task 6** — R2 public domain `images.kittycontrol.shop` set up and working.
- [x] **Task 7** — R2 upload step added to MCP server: `uploadToR2()` helper downloads kie.ai image and uploads to R2, all three transform paths now save `https://images.kittycontrol.shop/<uuid>.<ext>` to DB. `@aws-sdk/client-s3` installed.
- [ ] **Task 8** — Reload MCP server and test end-to-end on one product.

## MCP tools (available after reload)
- `list_product_images` — shows products with image URLs
- `update_product_images` — replaces images for one product
- `transform_image` — transforms one image via kie.ai, returns new URL
- `transform_and_update_product_images` — full pipeline for one product
- `transform_all_products` — bulk pipeline (run per page, e.g. page=1 limit=5)

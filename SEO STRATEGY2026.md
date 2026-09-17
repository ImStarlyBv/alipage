# SEO Strategy 2026 — Kitty Control (kittycontrol.shop)

**Niche:** Sphynx / hairless cat clothing (secondary: Devon Rex, Cornish Rex, Peterbald, post-surgery recovery suits)
**Written:** 2026-09-16
**Inputs:** `Sphynx Cat Clothing SEO Strategy.md` (deep research), audit of this repo, live-site check, SERP spot-checks.
**Supersedes:** `SEO/todoSEO.md` (most of its Phase 1–2 is already shipped — see §1).

---

## 0. TL;DR — the 10 moves that matter

| # | Move | Why | When |
|---|------|-----|------|
| 1 | **Persist product slugs + 301 old URLs** | Slugs are recomputed from titles; the automated SEO rename task silently 404s every renamed URL | Week 1 |
| 2 | **Real collection pages** (`/sphynx-cat-sweaters`, `/sphynx-cat-hoodies`, …) | We rank only with the homepage + 20 PDPs. Commercial head terms are won by *collection* pages on every competitor | Weeks 1–3 |
| 2.5 | **`/cat-recovery-suits` next, ahead of the rest of Phase 2** | Ubersuggest (2026-09-17, live): `cat recovery suit` = 6,600–8,100 mo/vol, SD 27 — 3–4× every other collection keyword in this plan and easier than `sphynx cat sweater` (SD 30). We already sell the product. See §1.5 | **Now** |
| 3 | **Winter + Christmas content NOW** | Mid-Sept → Google needs 4–8 weeks to rank new pages before the Nov–Dec peak. **Caveat added 2026-09-17:** exact-match volume for `sphynx winter clothes` (10/mo) and `christmas sweater for sphynx cat` (0/mo) is near-zero per Ubersuggest — these pages win, if at all, on the broader `sphynx cat sweater`/`cat winter clothes`/`sphynx cat costume` terms and AI-answer extraction, not on their own head term. See §1.5 | Weeks 1–4 |
| 4 | **`/guides` content hub** (12 core articles) | Informational queries ("how to keep sphynx warm") feed AI Overviews/ChatGPT citations and link equity to collections | Weeks 2–12 |
| 5 | **ProductGroup + variant schema** from AliExpress SKU data | Variants already exist in `Product.variants`; exposing them unlocks variant-aware Shopping / AI surfaces | Weeks 2–3 |
| 6 | **Rewrite 20 PDPs** with the "answer block + fit + fabric + care" template | Current meta descriptions are one boilerplate template ×20 | Weeks 3–6 |
| 7 | **Google Merchant Center free listings** (feed = page parity) | Shopping Graph is the primary source for Google AI Mode + Gemini product answers | Weeks 3–5 |
| 8 | **Keep the domain sphynx-pure** — no cat toys on this site | `cat_toys_products.md` (107 generic toys) would dilute topical authority | Decision now |
| 9 | **GEO basics:** `llms.txt`, explicit AI-bot allow, Organization `sameAs`/logo, Bing + IndexNow | Cheap, 1 day, affects ChatGPT/Copilot/Perplexity eligibility | Week 1 |
| 10 | **Measurement loop:** GSC queries → monthly content decisions; AI referral segment in GA4. Ubersuggest MCP now live — use it for keyword volume/difficulty checks before committing a URL/H1, not just GSC after the fact | Replace research-doc estimates with our own data | Week 1, then monthly |
| 11 | **Fold the existing daily Tumblr image pipeline into content** | A parallel flow already publishes images to Tumblr daily — reuse it as the original-photo source for guides/collections (§8) and as a `sameAs`/citation profile (§9), instead of building a second photo pipeline from scratch | Week 1 (wire it in), ongoing |

---

## 1. Where we are today (audit, 2026-09-16)

### Already done ✅
- Root + page `metadata` with sphynx-focused titles/descriptions, canonicals on `/`, `/products`, `/categories`, PDPs (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/products/[id]/page.tsx`).
- `robots.ts` blocks `/api /admin /account /auth /checkout /cart`; `sitemap.ts` lists home, listing and 20 active PDPs.
- `Product` JSON-LD with brand, offer, `OfferShippingDetails`, `MerchantReturnPolicy`, real `aggregateRating`/`review` (`src/components/JsonLd.tsx`, `src/lib/seo/merchant-policy.ts`).
- `BreadcrumbList` on PDPs; `WebSite`, `ItemList`, `FAQPage` + `Organization` on home.
- Title-derived slugs with redirect from id → slug.
- Mobile perf work (GA `lazyOnload`, WebP happy-cats gallery), review system.
- API-key protected product rename/description endpoints for automated SEO writes (`src/middleware.ts`).

### Gaps / risks found ❌

| Severity | Issue | Evidence | Fix (section) |
|---|---|---|---|
| **Critical** | Renaming a product changes its URL; the old URL 404s (only id → slug redirects exist). Slugs also depend on `createdAt` ordering for duplicate titles. | `src/lib/utils/product-slugs.ts`, `/api/admin/products/[id]/rename` | §3.1 |
| **High** | No indexable category/collection pages. `/categories` renders empty on live; filtering uses `/products?categoryId=<cuid>` (not canonical, not in sitemap). | live `/categories`, `src/app/categories/page.tsx` | §3.2 |
| **High** | Zero informational content (no blog/guides). All ranking eggs in homepage + 20 PDPs. | repo | §4 |
| **High** | PDP meta descriptions are one template ("Shop X at Kitty Control for $Y…") ×20 — near-duplicate snippets. | `products/[id]/page.tsx:75` | §5 |
| Medium | Variants (size/color) not in structured data; no `sku`, `color`, `size`, `material`. | `JsonLd.tsx` | §3.3 |
| Medium | Homepage FAQ says "vets recommend 3–5 sets" and pushes cotton/bamboo — unsourced claim + conflicts with the research (cotton stains/pills with sebum and licking). Unsupported "vet" claims are an E-E-A-T liability. | `src/app/page.tsx` faqItems | §5.3 |
| Medium | `force-dynamic` on `/products` and `/categories` → slower TTFB for crawlers. | files | §3.5 |
| Medium | `Organization` schema has no `logo`, `sameAs`, `contactPoint`. No About / Contact / Size-guide / Shipping / Returns pages linked as trust pages. | `layout.tsx` | §3.4, §6 |
| Low | `llms.txt` 404; AI bots not explicitly listed in robots. | live | §3.4 |
| Low | `keywords` meta tag (ignored by Google) — harmless, don't spend time on it. | `layout.tsx` | — |

---

## 1.5 Live keyword data (Ubersuggest, pulled 2026-09-17, US/en)

This replaces the research doc's *estimated* volumes for the pages already in
scope with measured Ubersuggest numbers. Full detail lives in
`SEO-KEYWORD-DATA-2026-09-17-UBERSUGGEST.md`; the headline results:

| Keyword | Vol/mo | SD | Page it targets | Verdict |
|---|--:|--:|---|---|
| `cat recovery suit` | 6,600–8,100 | 27 | `/cat-recovery-suits` (not built) | **Biggest opportunity in the plan.** 3–4× every other collection term, easier than sweaters. Build next |
| `cat surgery suit` | 1,900–2,400 | 27 | same page, secondary H2/keyword | Fold in as the page's #2 term |
| `sphynx cat clothes` | 2,400 (seasonal 1,600–2,900) | 18 | Home | Low difficulty for the volume — home is already ranking **position 42** for the close variant `clothes for hairless cats` (2,400 vol). On-page/internal-link push here is cheap and fast |
| `hairless cat clothes` | 2,400 | 18 | Home | Same page, same verdict |
| `sphynx cat sweater` | 1,900–2,400 | 30 | `/sphynx-cat-sweaters` (live) | Solid, justifies the page as shipped |
| `sphynx cat costume` | 260 (spikes to 880 in Oct) | 22 | `/sphynx-cat-christmas-sweaters` (live) | Real volume exists here — retarget the page's secondary keyword/FAQ toward "costume" rather than only "christmas sweater," which has 0 |
| `cat winter clothes` | 260 (spikes to 720 Nov) | 25 | `/sphynx-cat-winter-clothes` (live) | Use this broader phrase in body copy/H2s; the exact `sphynx winter clothes` (10/mo) isn't worth optimizing for directly |
| `sphynx cat shirt` | 70–110 | 27 | `/sphynx-cat-shirts` (Phase 2) | Low but non-zero; keep in Phase 2 order |
| `sphynx cat pajamas` | 20–70 | 26 | `/sphynx-cat-pajamas` (Phase 2) | Same |
| `devon rex clothes` | 20–40 | 28 | `/devon-rex-clothes` (Phase 2) | Lowest volume of the eight planned collections — keep last |
| `sphynx cat hoodie` | 20–90 | 17 | `/sphynx-cat-hoodies` (live) | Low volume but the easiest difficulty in the set; page already shipped so no action needed |
| `sphynx winter clothes` | 10 | 44 | — | Don't chase the literal phrase |
| `christmas sweater for sphynx cat` | 0 | — | — | Don't chase the literal phrase; the page's value is `sphynx cat costume` + "holiday outfits" instead |

**Long-tail signal from `cat recovery suit` suggestions (100+ variants):** real
demand clusters around *for spay* / *for neuter* / *vs cone* / *near me* /
named retailers (Petco, PetSmart, Amazon, Chewy, Walmart, Target). That's a
comparison-content opportunity (`cat-recovery-suit-vs-cone`, already in the
Sprint C calendar — bump it toward Sprint A once the collection page ships)
and a reason the collection page's FAQ should answer "recovery suit vs cone"
directly.

**Also surfaced, `domain_overview`:** the live site already has a small
organic footprint that predates this plan — DA 9, 59 backlinks / 53 referring
domains, and 3 organic keywords already indexed (`sphynx pajamas` pos 29,
`clothes for hairless cats` pos 42 at 2,400 vol, `sphynx cat pajamas` pos 41).
Worth pulling into the Week 1 GSC baseline in §10 rather than starting the
measurement loop from a "zero" assumption.

**What this changes vs. §11 Roadmap as shipped:** Phase 1's four collections
(sweaters, hoodies, winter-clothes, christmas-sweaters) were the right build —
routing/schema/ISR work doesn't depend on keyword volume, and the strategy's
seasonal-urgency logic for winter/Christmas still holds even with low
exact-match volume, since AI Overviews and the sweater/costume broad terms
still route through those URLs. The change is **ordering of what's not yet
built**: `/cat-recovery-suits` moves to the front of Phase 2, ahead of
shirts/pajamas/devon-rex, and each live collection's on-page copy should lean
on the broader term this table names (e.g. "cat winter clothes", "sphynx cat
costume") rather than only the page's original exact-match keyword.

---

## 2. How to read the research doc (what we adopt vs. adjust)

The research is directionally right. Five things to keep in mind when applying it to *this* store:

1. **The AI Overview trigger % in the keyword table are estimates, not measurements.** Use them to rank ideas, not to forecast. Real prioritization comes from GSC + Keyword Planner (§8).
2. **We dropship from AliExpress — we can only claim what's true of the actual garment.** Research copy like "micro-nylon", "flatlock seams", "fluorine-free dyes", "tagless", "single front-leg hole" is great *only when verified per product* (supplier specs, photos, a sample in hand). False material claims = Merchant Center disapproval + returns + trust loss. Rule: **order one sample of each best-seller and document fabric, seams, tags, leg-hole design with our own photos.** That sample becomes our first-hand E-E-A-T asset.
3. **"Board-certified veterinary dermatologist review"** is a Phase 3 stretch goal (paid reviewer). Until then: cite reputable sources (PetMD, Cornell Feline Health Center, VCA, ICatCare) in guides and never write "vets recommend" without a link.
4. **Fabric narrative must be honest and consistent:** cotton = breathable & soft but absorbs sebum and can stain/pill; fleece = warm but can pill; smooth synthetic/stretch blends = release oil in the wash and resist licking. Sell *the right fabric for the use case* (warmth vs. summer vs. post-surgery), not "one best fabric". Update the homepage FAQ to match.
5. **ProductGroup schema is worth it, but feed parity comes first** — schema must mirror what's visible on the page (price, per-variant availability). AliExpress products have no GTIN → submit with `identifier_exists = no` / brand "Kitty Control".

---

## 3. Technical & structural foundation (Weeks 1–3)

### 3.1 Stable URLs (CRITICAL — do first)
- Add `slug String @unique` (+ `seoTitle`, `metaDescription`, `collectionSlugs` optional) to `Product` in `prisma/schema.prisma`; backfill with the **current** live slugs so no URL changes.
- Add `ProductSlugRedirect { fromSlug @unique, productId }` table. Rename endpoint writes the old slug into it; `products/[id]/page.tsx` looks up redirects and issues a permanent redirect via `permanentRedirect` — **which Next 16 answers with 308, not 301** (the doc's original wording; same permanent semantics Google treats identically, so don't chase a literal 301). Not the current temporary `redirect` (307).
- Rename ≠ re-slug by default: changing the display title should *not* change the URL unless explicitly requested.
- Sitemap and all links read `product.slug` directly (drop `buildProductSlugMap` full-table scans on every page).

### 3.2 Collection pages (the money pages)
Build a curated `Collection` model (not AliExpress categories — those names are generic and mis-structured). Flat, keyword-matched URLs at root level:

| URL | Primary keyword | Secondary / long-tail |
|---|---|---|
| `/sphynx-cat-sweaters` | sphynx cat sweater | hairless cat sweater, knit sweater for sphynx |
| `/sphynx-cat-hoodies` | sphynx cat hoodie | hairless cat hoodie, four-leg hoodie |
| `/sphynx-cat-pajamas` | sphynx cat pajamas | sphynx cat onesie, jumpsuit for hairless cat |
| `/sphynx-cat-shirts` | sphynx cat shirt | sphynx t-shirt, summer clothes for hairless cats |
| `/sphynx-cat-winter-clothes` | sphynx winter clothes | fleece coat for sphynx, turtleneck, how to keep sphynx warm (link to guide) |
| `/sphynx-cat-christmas-sweaters` | christmas sweater for sphynx cat | holiday outfits, cat costumes (seasonal — keep URL live all year) |
| `/cat-recovery-suits` | cat recovery suit | cat surgery suit, spay recovery suit for sphynx (broad, high-volume query we already have a product for) |
| `/devon-rex-clothes` | devon rex clothes | cornish rex clothes, peterbald clothes (breed-fit landing, not a thin duplicate — own copy + size notes) |

Each collection page template:
1. H1 = primary keyword phrase (natural). 
2. **40–60 word answer block** above the grid ("What makes a good sphynx sweater? …") — extractable by AI Overviews.
3. Product grid (server-rendered, crawlable `<a>` links).
4. Below grid: 300–600 words — fabric comparison table, sizing tips for the hairless body (long torso, deep chest, belly), care notes, 3–5 FAQs (FAQPage schema), links to 2–3 related guides.
5. Schema: `CollectionPage` + `ItemList` + `BreadcrumbList` (+ `FAQPage`).
6. Unique title/meta; canonical self; `/products?categoryId=` gets `noindex,follow` or 301 to the matching collection.

A product can live in multiple collections (e.g. fleece hoodie → hoodies + winter).

### 3.3 Structured data upgrades (`src/components/JsonLd.tsx`)
- Switch PDPs with >1 SKU to **`ProductGroup`** with `productGroupID` (our product id), `variesBy` (size/color from `Product.variants`), `hasVariant[]` each with `sku`, `size`, `color`, `image` (when SKU image exists), own `Offer` (price + availability from AE SKU stock). Keep single-SKU products as `Product`.
- Add `material` **only where verified** (§2.2), `audience`/`additionalProperty` for "Suitable for: Sphynx, Devon Rex…".
- Use `sizeSpecification`/size guide link once size charts exist.
- Variant URLs: `?size=M&color=black` render the same page, canonical to the clean PDP URL (no separate indexable variant pages — we don't have search demand for them).
- `Organization`: add `logo`, `sameAs` (Instagram, TikTok, Pinterest, Facebook), `contactPoint` (email), `address` if any. Move to a single `@id` (`https://kittycontrol.shop/#organization`) referenced by `WebSite` and `Brand`.
- `Article` + `author` (Person with bio page) + `datePublished/dateModified` on guides.
- Validate every template in Rich Results Test + Schema.org validator before deploy; add to the drift baseline.

### 3.4 Crawl, index & AI accessibility
- `robots.ts`: keep `*` allow and add explicit groups for `Googlebot`, `Bingbot`, `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended` with the same disallows (makes intent explicit; lets us flip individually later).
- Add `public/llms.txt` (or `app/llms.txt/route.ts` generated from DB): brand one-liner, collections, top guides, shipping/returns/size-guide URLs.
- Sitemap: split into `sitemap.ts` sections (static, collections, products, guides) with real `lastModified`; add product `image` entries back only for primary image if Google Images traffic matters (c9a1869 removed them — fine for now).
- **Bing Webmaster Tools** (feeds Copilot + ChatGPT search) + **IndexNow** ping on product/guide publish and rename.
- Search Console: verify Domain property, submit sitemap, request indexing for new collections/guides.

### 3.5 Performance (keep CWV green on mobile)
- Replace `force-dynamic` on `/products`, `/categories`, collections, guides with `revalidate` (ISR, e.g. 1h) + on-demand `revalidatePath` from admin writes. Check `node_modules/next/dist/docs/` for this Next version's caching API before implementing (AGENTS.md).
- PDP LCP: first carousel image `priority`/`fetchPriority="high"`, proper `sizes`; AliExpress-hosted description images lazy-loaded.
- Targets (p75 field data, CrUX/PSI): LCP < 2.5 s, INP < 200 ms, CLS < 0.1.

---

## 4. Content strategy — `/guides` hub (Weeks 2–16)

Topical authority = cover the whole "living with a hairless cat" problem space and route every article to a collection. One hub page `/guides` + articles at `/guides/<slug>`.

### 4.1 Article format (GEO-ready)
- H1 as the question/topic → **30–50 word direct answer** in the first paragraph.
- H2s phrased as real follow-up questions; each starts with a 1–2 sentence answer, then a table or numbered steps.
- At least one original element per article: our own photo of a garment on a cat, a measured size table, a wash test ("after 10 washes"), a customer photo with permission. This is what AI engines and Google's helpful-content systems can't get elsewhere.
- Cite 2–4 authoritative sources (PetMD, Cornell Feline Health Center, VCA, ICatCare, Merck Vet Manual).
- Named author with bio (owner/cat parent experience); `dateModified` updated on real edits only.
- 2–4 contextual links to collections/PDPs + 2 links to sibling guides. Short product module at the end, not an ad wall.
- 1,200–2,000 words for pillars, 700–1,200 for supporting.

### 4.2 Editorial calendar (ordered by season + intent)

**Sprint A — publish by 2026-10-15 (winter window)**
| Slug | Target query | Links to |
|---|---|---|
| `how-to-keep-a-sphynx-cat-warm` (pillar) | how to keep sphynx cat warm, sphynx cat cold, what temperature is too cold for a sphynx | winter clothes, sweaters, hoodies |
| `do-sphynx-cats-need-clothes` | do sphynx cats need clothes, should hairless cats wear clothes | homepage, sweaters, shirts |
| `sphynx-cat-size-guide` (also a utility page) | sphynx cat clothes size chart, how to measure a cat for clothes | all collections; linked from every PDP |
| `best-christmas-sweaters-for-sphynx-cats` | christmas sweater for sphynx | christmas collection |

**Sprint B — Oct–Nov 2026 (fabric & care authority)**
| Slug | Target query |
|---|---|
| `best-fabric-for-sphynx-cat-clothes` (pillar) | best fabric for hairless cat clothes, cotton vs fleece sphynx — honest comparison table: warmth, breathability, oil release, pilling, lick-resistance |
| `how-to-wash-sphynx-cat-clothes` | how to get sebum/oil stains out of cat clothes, washing sphynx clothes |
| `sphynx-cat-skin-care-oil-and-clothes` | sphynx oily skin, sphynx blackheads clothes |
| `why-does-my-cat-chew-lick-its-sweater` | cat licks/chews clothes, clothes getting holes |

**Sprint C — Dec 2026–Feb 2027 (fit, health, breeds)**
| Slug | Target query |
|---|---|
| `cat-recovery-suit-vs-cone` | recovery suit vs cone after spay, cat surgery suit |
| `how-to-get-a-cat-used-to-wearing-clothes` | cat won't wear sweater, getting cat used to clothes |
| `devon-rex-and-cornish-rex-clothes-guide` | devon rex clothes, cornish rex sweater |
| `sphynx-cat-sunburn-summer-clothes` (publish Apr 2027) | sphynx sunburn, summer clothes for hairless cats |

**Always-on:** 1 new or substantially refreshed article every 2 weeks, chosen from GSC "queries with impressions but no page" (§8).

### 4.3 Linking architecture
```
Home ─┬─ Collections (8) ─── PDPs (20+)
      │        ▲   ▲
      └─ /guides hub ── pillars ── supporting articles
```
- Header nav: Shop by type (collections), Guides, Size guide.
- Footer: all collections + trust pages.
- PDP: breadcrumb `Home › Sphynx Cat Sweaters › Product`, "Complete the wardrobe" related products from same collection, link to size guide + care guide.
- Anchor text: descriptive and varied ("fleece-lined winter hoodies"), never 20 identical "sphynx cat clothes" anchors (the homepage de-cannibalization work in 5ee79c5 already follows this — keep it).

### 4.4 Keyword ownership (anti-cannibalization map)
| Page | Owns |
|---|---|
| Home | sphynx cat clothes, hairless cat clothes (brand + head term) |
| `/products` | shop all (low priority; canonical listing) |
| Collections | the type head term (sweater, hoodie, pajamas…) |
| PDPs | product-specific long tail ("sphynx fleece turtleneck", "four-leg hoodie for sphynx") |
| Guides | question / how-to / comparison queries |

Any new page that targets an owned term must be merged or re-angled.

---

## 5. Product page (PDP) optimization (Weeks 3–6)

### 5.1 PDP template (`src/app/products/[id]/page.tsx`)
Above the fold: H1 · price · rating · variant selectors · add-to-cart · **3 bullet "why it works for hairless cats"** · free shipping / returns line.
Below:
1. **Quick answer (40–60 words):** who it's for, warmth level, fabric, fit.
2. **Specs table:** fabric (verified), warmth level (Light / Medium / Warm), leg openings (2-leg / 4-leg / single front hole), neckline, closure, seams/tags, machine wash temp.
3. **Size chart** (neck / chest / back length, cm + in) + "how to measure" link.
4. **Care:** wash frequency and how to release skin oil.
5. **Suitable for:** Sphynx, Devon Rex, Cornish Rex, Peterbald, small cats post-surgery (if true).
6. Reviews (existing) — prompt reviewers for cat breed, weight and size bought (feeds fit content + trust).
7. Mini FAQ (2–3 Qs) + related products + related guide.
8. Supplier HTML description (DescriptionGallery) moved last, collapsed — it's non-unique content.

### 5.2 Titles & metas
- Title pattern: `{Product type} for Sphynx Cats – {Key feature} | Kitty Control` (≤ 60 chars).
- Meta description: unique per product, lead with the use case ("Fleece-lined 4-leg hoodie that keeps hairless cats warm in cold homes…"), then shipping. Store in `metaDescription` column so the automated SEO task (`scripts/push-seo-descriptions.js`, API-key endpoints) can manage them — **after §3.1 prevents URL breakage.**
- Image alt: describe garment + cat ("Sphynx cat wearing a grey brushed-fleece turtleneck"), first image per product.

### 5.3 Homepage fixes
- Rewrite FAQ "fabric" answer to the honest per-use-case comparison (§2.4) and drop/cite "vets recommend".
- Point category cards to the new collection URLs (currently static cards).
- Add a "Guides" strip (3 cards) and a size-guide link.

---

## 6. Trust / E-E-A-T pages (Weeks 2–4)
Each is linked in the footer and referenced from `Organization` schema:
- `/about` — real story, who runs the shop, our cat(s) with photos, why sphynx. (The single biggest E-E-A-T lever for a small shop.)
- `/size-guide` — see §4.2.
- `/shipping` — honest 7–20 day window, tracking, countries (must match `merchant-policy.ts`).
- `/returns` — must match `RETURN_POLICY` schema exactly.
- `/contact` — email, response time.
- Author page(s) for guides.

---

## 7. Feeds, Shopping Graph & agentic commerce (Weeks 3–6)
1. **Google Merchant Center** → free listings + (optional) Shopping ads later. Generate feed from DB at `/feeds/google.xml` (or Content API): `id` per SKU, `item_group_id` = product id, `title` (type + "for Sphynx Cats" + color/size), `color`, `size`, `material` (verified), `gender=unisex`, `age_group=adult`, `product_type` = collection path, `google_product_category` = 5 (Animals & Pet Supplies › Pet Supplies › Cat Supplies… choose "Pet Apparel" node), `brand=Kitty Control`, `identifier_exists=no`, shipping + return policy configured in GMC matching the site.
2. **Parity check** (script or cron): feed price/availability == page JSON-LD == DB. The AliExpress price/stock sync cron (`api/cron/sync-products`) must trigger feed + ISR revalidation, so a price change never leaves stale schema.
3. **Bing Merchant Center** import from GMC (Copilot shopping).
4. **ChatGPT / OpenAI product discovery:** keep OAI-SearchBot allowed, and apply for the merchant program / product feed when eligible for small Shopify-less stores — track, don't block on it.
5. **Pinterest**: claim the domain, enable rich pins (OG + product schema already there), upload catalog from same feed. Pinterest is a strong discovery channel for pet apparel.

---

## 8. Visual search (Weeks 6–12)
- Per product, minimum image set: (a) clean 1:1 1200×1200 garment on plain background, (b) garment worn by a hairless cat (lifestyle), (c) detail shot (seams/leg holes/fabric), (d) size/fit shot. Supplier photos are shared with dozens of AliExpress resellers → **our own photos from samples are a real ranking and Lens-matching differentiator.**
- Filenames: `sphynx-cat-{product-type}-{color}-{shot}.webp`. Alt text as in §5.2.
- Serve from our domain (not AE CDN) for owned-image equity; `ImageObject` with `creditText`/`copyrightNotice` on originals.
- Vertical 2:3 pins (1000×1500) for each guide and collection.
- Leverage the happy-cats UGC flow: ask customers for photos (with permission) → gallery + PDP + Pinterest.
- **Existing Tumblr pipeline (added 2026-09-17):** there is already a running
  flow that publishes images to Tumblr daily, separate from this plan. Don't
  build a second photo cadence — point it at this section's needs instead:
  route its daily output (or a curated subset) into the same image set above
  and into guide hero images, so the "always-on" guide cadence (§4.2) has a
  real image on day one instead of waiting on the sample-order/own-photography
  work. Same honesty rule as the rest of this plan applies: only images of the
  actual garments/cats, captioned accurately — a Tumblr post is public and
  citable, so a false claim there is the same liability as one on the site.
  **Needs from the user:** the Tumblr blog URL/handle and a call on whether
  its images are real product/lifestyle photos (usable directly per this
  section) or AI-generated/stock (then they're a distribution channel, not an
  E-E-A-T asset, and shouldn't substitute for the sample-photo work).

---

## 9. Off-page authority & brand mentions (Months 2–6)
AI engines choose sources by where a brand is mentioned; Google still needs links. For a niche shop, prioritize **relevance over DA**; skip paid "guest post on 200 pet blogs" lists and link insertions from link farms (spam risk).

| Tactic | Target | Monthly goal |
|---|---|---|
| Sphynx breeders / catteries partnership | "Recommended supplies" pages; kitten-go-home packs with a discount code | 2 outreach batches / 1–2 links |
| Brand roundup inclusion | "best sphynx clothing brands" articles (e.g. purradoxsphynxery.com-style lists, catgear360-style roundups) — pitch a sample | 3 pitches |
| Communities (genuine participation, no spam) | r/sphynx, Sphynx Facebook groups, cat-show forums — answer fabric/warmth questions, share guides only when relevant | ongoing |
| Original data / digital PR | Survey or wash-test study ("We washed 10 sphynx sweaters 20 times") → pet media, local press | 1 per quarter |
| Creator seeding | Sphynx Instagram/TikTok accounts (5k–100k) — free outfit for honest content + tagged link | 3–5 / month |
| Citations | Pinterest, Instagram, TikTok, YouTube Shorts, Trustpilot profile → `sameAs` | Month 1 |
| Tumblr | Add the existing daily-image blog to `sameAs` once we have its URL (§8); Tumblr posts are crawled and citable in AI answers same as any other social profile | Month 1 |
| Expert review (stretch) | Paid vet (DVM) fact-check of the 3 health-adjacent guides; add `reviewedBy` | Month 4–6 |

### Competitor set to monitor
Specialists: The Sphynx Cat Clothing Co. (UK handmade, Oeko-Tex), YESWARMG, PIKAPIKA (strong blog), Sphynx Cat Wear, MEWCATS, CityBear, Kotomoda. Generalists: Walmart/Amazon/Etsy listings.
**Our angle vs. them:** focused education + honest fabric/fit guidance + free worldwide shipping + real-cat photos. Don't compete on "handmade/certified" claims we can't back.

---

## 10. Measurement & KPIs

### Setup (Week 1)
- GSC (Domain property) + Bing WMT + GA4 linked.
- GA4 exploration/segment: sessions where referrer matches `chatgpt.com|chat.openai.com|perplexity.ai|gemini.google.com|copilot.microsoft.com|claude.ai`.
- Monthly manual AI visibility check: ask ChatGPT, Perplexity, Gemini, Google AI Mode 10 fixed prompts ("best clothes for a sphynx cat in winter", "where to buy sphynx cat sweater", "cotton or fleece for hairless cat"…) → log whether Kitty Control is mentioned/cited. Store in a sheet.
- Rank tracking for ~40 keywords (collections + guides + brand).
- Drift baseline on home, 1 collection, 1 PDP, 1 guide after each template deploy.

### Targets
| Metric | Baseline (pull from GSC in Week 1) | 3 months (Dec 2026) | 6 months (Mar 2027) |
|---|---|---|---|
| Indexed URLs (valid) | ~23 | 45+ | 60+ |
| Organic clicks / month | TBD | 2× baseline | 4× baseline |
| Non-brand queries with impressions | TBD | 3× | 6× |
| Collections in top 20 for their head term | 0 | 4 of 8 | 6 of 8, 2 in top 10 |
| Guides in top 10 | 0 | 2 | 6 |
| AI prompt mentions (of 10 prompts × 4 engines) | TBD | 2 | 6 |
| Referring domains (relevant) | TBD | +5 | +15 |
| Merchant Center approved items | 0 | 100% of active | 100% |
| Mobile CWV (p75) | check PSI | all green | all green |

### Monthly ritual (1–2 h)
1. GSC → Queries: find queries with impressions, position 8–30 → improve the owning page or create the missing page.
2. Pages with falling CTR → rewrite title/meta.
3. Check AI prompt log + GA4 AI referrals.
4. Verify feed errors in GMC; schema errors in GSC Enhancements.
5. Pick next 2 guides.

---

## 11. Roadmap

### Phase 1 — Foundation + Winter window (2026-09-16 → 2026-10-15)
- [ ] Decide: cat toys stay off kittycontrol.shop (or separate domain later)
- [ ] §3.1 persistent slugs + 301 redirect table (**before** any more automated renames)
- [ ] §3.4 robots AI groups, `llms.txt`, Bing WMT + IndexNow, GSC baseline export
- [ ] §3.3 Organization `@id`/logo/sameAs; claim social profiles
- [ ] §3.2 Collection model + template; launch `/sphynx-cat-winter-clothes`, `/sphynx-cat-sweaters`, `/sphynx-cat-hoodies`, `/sphynx-cat-christmas-sweaters`
- [ ] §4.2 Sprint A: warmth pillar, do-they-need-clothes, size guide, christmas sweaters guide
- [ ] §5.3 homepage FAQ correction + cards → collections
- [ ] §3.5 ISR instead of force-dynamic
- [ ] Order samples of top 5 best-sellers (for verified specs + photos)

### Phase 2 — Catalog quality + Feeds (2026-10-15 → 2026-12-15)
- [x] All 8 collections live (2026-09-17, ahead of schedule): `/cat-recovery-suits`, `/sphynx-cat-shirts`, `/sphynx-cat-pajamas`, `/devon-rex-clothes` shipped in that Ubersuggest-ranked order, joining the 4 from Phase 1. `/devon-rex-clothes` cross-lists 7 products whose own descriptions confirm breed fit rather than owning new products. ORPHAN_SLUGS in `collections.test.ts` is empty.
- [ ] §3.3 ProductGroup/variant schema
- [ ] §5.1–5.2 PDP template + unique copy/metas for all 20 products (verified specs only)
- [ ] §6 trust pages (about, shipping, returns, contact, author)
- [ ] §7 Merchant Center feed + parity check + Bing Merchant + Pinterest catalog
- [ ] §4.2 Sprint B guides (fabric pillar, washing, skin/oil, licking) + bump `cat-recovery-suit-vs-cone` from Sprint C into this window once the collection ships (§1.5 long-tail signal)
- [ ] Wire the existing daily Tumblr image pipeline into guide/collection imagery (§8) and add it to Organization `sameAs` (§9)
- [ ] Start breeder + creator outreach (§9)

### Phase 3 — Authority + Visual + Scale (2026-12-15 → 2027-03-31)
- [ ] §8 own photography for all products; image filenames/alt/ImageObject
- [ ] §4.2 Sprint C guides; biweekly publishing cadence
- [ ] First original-data PR piece (wash test)
- [ ] Vet fact-check on health guides (`reviewedBy`)
- [ ] Expand catalog in gaps GSC reveals (e.g. single-front-hole designs, UPF summer tees before Apr 2027)
- [ ] Quarterly review of this document against KPIs

---

## Appendix A — Seed keyword universe (validate volumes in Keyword Planner / GSC)

**Commercial head:** sphynx cat clothes · hairless cat clothes · sphynx cat sweater · sphynx cat hoodie · sphynx cat pajamas · sphynx cat onesie · sphynx cat shirt · sphynx winter clothes · cat recovery suit · devon rex clothes · christmas sweater for cats

**Commercial long-tail:** fleece sweater for hairless cat · four leg hoodie for sphynx · sphynx cat turtleneck · warm clothes for sphynx kitten · sphynx cat jumpsuit · oil resistant cat clothes · single front leg hole cat sweater · sphynx cat coat · cat surgery suit after spay · clothes for cornish rex

**Informational:** do sphynx cats need clothes · how to keep a sphynx cat warm · what temperature is too cold for a sphynx cat · best fabric for sphynx clothes · cotton vs fleece for hairless cats · how to wash sphynx cat clothes · how to get oil stains out of cat clothes · how to measure a cat for clothes · why does my cat chew his sweater · how to get a cat used to wearing clothes · recovery suit vs cone · do sphynx cats get sunburn

## Appendix B — Sources consulted
- Internal research: `Sphynx Cat Clothing SEO Strategy.md` (and its 31 citations)
- [Google: Product variant structured data](https://developers.google.com/search/blog/2024/02/product-variants)
- [PetMD — How to keep Sphynx and hairless cats warm](https://www.petmd.com/cat/care/how-keep-sphynx-cats-and-other-hairless-cats-warm)
- SERP spot-check "sphynx cat clothes shop" / "best clothes for hairless cats" (2026-09-16): [The Sphynx Cat Clothing Co.](https://www.thesphynxcatclothingco.com/), [YESWARMG](https://www.yeswarmg.com/product-category/sphynx-cat-clothes/), [PIKAPIKA](https://pikapikatc.com/collections/sphynx-cat-devon-rex), [Sphynx Cat Wear](https://sphynxcatwear.com/), [MEWCATS](https://www.mewcats.com/collections/sphynx-cat-clothes), [CityBear](https://citybear.co/collections/sphynx-cat-clothes), [CatGear360 roundup](https://catgear360.com/sphynx-cat-clothes/), [Purradox Sphynxery brand list](https://purradoxsphynxery.com/favorite-sphynx-clothing-brands/), [Kotomoda](https://kotomoda.com/)

# Phase 1 Report — Stable product URLs

**Date:** 2026-09-16
**Scope:** §3.1 of `SEO STRATEGY2026.md` — persist product slugs so title edits stop
moving URLs, plus the security fix from the Phase 0 recon.
**Status:** Complete, deployed, and verified against production.

---

## 1. Why this came first

Slugs were derived from `title` at render time and never stored. Every rename
silently moved a product's URL and 404'd the version Google had indexed — and an
automated SEO title-rewriting pass had already done exactly that, twice. Until
the slug was made permanent, every later SEO task (collection pages, structured
data, content) was building on URLs that could move under it.

---

## 2. What shipped

Four commits, `9dfc0ae..5593119`, now on `origin/main`:

| Commit | Subject | Size |
|---|---|---|
| `7a1ad7f` | jsonld: escape script-breakout in JSON-LD payloads | 8 files, +167/−6 |
| `fc999f2` | products: persist slugs so renames stop moving URLs | 9 files, +572/−2 |
| `72c750c` | products: read URLs from the stored slug, 308 on moves | 14 files, +374/−280 |
| `5593119` | test: pin the slug corpus to the live catalog | 1 file, +49/−29 |

**26 files changed, +1054/−209.**

Split deliberately: `fc999f2` lands the data (nullable `slug` column, the
`ProductSlugRedirect` table, and the backfill) with **zero** behavioural change,
because nothing read `slug` yet. `72c750c` then switches the read side. That
seam meant a broken read side could be rolled back without losing the data.

### The mechanism

- **`prisma/migrations/0006_add_product_slug`** — adds nullable `slug`,
  `seoTitle`, `metaDescription`; creates `ProductSlugRedirect` with a unique
  `fromSlug`. Additive only; no `UPDATE`, so it cannot alter existing rows.
- **`scripts/backfill-product-slugs.js`** — runs from `entrypoint.sh` between
  `migrate deploy` and `node server.js`, so it completes before the new code
  serves a request. Its only write is
  `UPDATE "Product" SET slug = $1 WHERE id = $2 AND slug IS NULL`.
  Idempotent, and it never touches `title`.
- **`src/app/products/[id]/page.tsx`** — one cached resolver of three indexed
  lookups (stored slug → legacy id → former slug), replacing two full-table
  scans that ran on every request. Anything that is not the canonical slug gets
  a `permanentRedirect`, which Next 16 answers with **308, not 301**.
- **`src/app/api/admin/products/[id]/rename/route.ts`** — a title change no
  longer moves the URL. Moving a product is a separate, explicit act: send
  `slug`, and the old one is recorded in `ProductSlugRedirect`.
- **`scripts/lib/product-slug.js`** — CommonJS mirror of
  `src/lib/utils/product-slugs.ts`, because the deploy-time backfill runs from
  the standalone runner image, which has no loose `src/lib/**` on disk. The two
  are held in lockstep by `product-slug-parity.test.ts`.

---

## 3. Production verification

Verified against `https://kittycontrol.shop` after the deploy landed — by
observing behaviour, not by trusting the push:

| Check | Result |
|---|---|
| id URL `/products/<cuid>` | **308** → `/products/sphynx-cat-sweater-classic-knit` (was 307 before the deploy) |
| Stored slug read back | `/api/products/<id>` returns `slug` |
| All 22 canonical URLs | **22/22 → 200** |
| All 22 legacy id URLs | **22/22 → 308, exactly one hop → 200** |
| Live sitemap before vs. after | **identical, all 22 URLs** |
| Titles before vs. after deploy | **identical, all 22** |

**Zero URLs moved.** The backfill recomputed every slug from the current titles
and reproduced exactly the URLs the site was already serving, which the
`22/22 titles slugify exactly to their live URL` check had predicted before the
push. Titles were untouched, confirming the backfill writes `slug` only.

---

## 4. Finding: the URL history is three generations deep

Production titles are `Sphynx Cat <Type> — <Descriptor>`
(e.g. `Sphynx Cat Sweater — Classic Knit`) and appear **nowhere in git history**.
The catalog has carried three title generations, each of which moved every URL:

1. Import titles (`Classic Knit Sweater for Hairless Cats`)
2. SEO-inserted (`Classic Knit Sphynx Cat Sweater`, commit `61b335f`)
3. Current keyword-front-loaded form — **authored by the site owner**, outside
   the repo, and the URLs live today.

Generations 1 and 2 404 **now**, and did so before this work — they are not
casualties of the deploy. Whether they need redirect rows is an open question
that only Search Console can answer (§6).

---

## 5. Operational correction: a commit does not deploy

The repo ships via a `docker-compose` rebuild of `Dockerfile` + `entrypoint.sh`.
There is **no CI workflow** — `.github/workflows` does not exist. Production
runs from a checkout of `origin/main`, so **the push is the deploy trigger, not
the commit.**

This cost real time: four commits sat local-only while being reported as
shipping. It was caught by probing the live site and finding the id URL still
answered `307` where the new code sends `308`, then confirmed with
`git status -sb` showing `ahead 3` against `origin/main`.

**How to check whether a deploy landed:** ask the live site for something only
the new code does. Here that was the id URL returning `308`. `git status -sb` or
`git log --oneline origin/main..HEAD` tells you whether anything has shipped.

A deploy also produces a short **502 window** (observed ~11 minutes into this
one) while the container restarts. The homepage, `/products`, and `/sitemap`
recovered before `/products/[id]` did. That is expected, not a failure.

---

## 6. Open items

- **GSC reconciliation.** Whether generations 1 and 2 were ever indexed is not
  answerable without Search Console. Needs §3.4 (GSC baseline export). If they
  were, the fix is `ProductSlugRedirect` rows — roughly 44, one per product per
  generation.
- **Not yet proven in production:** that a *title* edit now leaves the URL alone.
  Everything above verifies the *backfill* was safe; the new behaviour needs a
  real title write to demonstrate. The clean test is to rewrite one product's
  title, confirm the URL does not move and no redirect row appears, then rewrite
  it back.
- **`seoTitle` and `metaDescription` are added but unused.** `title` is already
  SEO-shaped, is the `<h1>`, and is the slug source, with `<title>` composed as
  `title + " | Kitty Control"` by the layout template. Either leave the columns,
  drop them, or move display names back to short names and put SEO strings in
  `seoTitle`. Settle this while building §3.2.
- **Latent, unobservable drift:** `product-slugs.ts` has
  `.replace(/-{2,}/g, "-")` where the CJS mirror has `.replace(/-{2,}/g, "")`.
  Unreachable in both — the preceding `[^a-z0-9]+` replace already collapses
  every non-alphanumeric run to a single dash — so parity holds and no URL
  depends on it. Left alone deliberately.
- **Test corpus is a snapshot.** `product-slug-parity.test.ts` asserts that each
  live title slugifies to its live URL. That is true now and is the evidence the
  backfill was URL-neutral, but it is a *migration-input snapshot*, not an
  ongoing rule: once a title is deliberately rewritten post-deploy, the URL
  correctly stays put and that assertion becomes a false alarm. Reword it at
  that point rather than "fixing" the URL.
- **Private-page links take a 308 hop.** `cart/page.tsx:116` and
  `account/orders/[id]/page.tsx:131` link via raw `productId`, resolving through
  the id branch. No SEO impact (private, not indexed), left as-is.
- **Pre-existing test failure, unrelated:** `src/lib/services/aliexpress/__tests__/services.test.ts:93`
  fails with `SyntaxError: "undefined" is not valid JSON`. Suite is 89/90.

## 7. Next

§3.2 collection pages (`/sphynx-cat-sweaters`, `/sphynx-cat-hoodies`, …) — the
highest-value remaining item, and now safe to build on stable URLs. It is a real
feature (curated `Collection` model, page template, `CollectionPage` + `ItemList`
schema, internal linking) and carries one curation decision: the four
Onesie/Jumpsuit products have no collection in the plan — §3.2 lists them as
secondary keywords for `/sphynx-cat-pajamas`, so either they fold in or get
their own page.

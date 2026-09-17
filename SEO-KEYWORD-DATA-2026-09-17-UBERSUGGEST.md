# Keyword data pull — Ubersuggest MCP, 2026-09-17

Source: `ubersuggest-mcp` (`keyword_overview`, `keyword_suggestions`,
`domain_overview`), locId 2840 (US), language en. Referenced from
`SEO STRATEGY2026.md` §1.5 — that section has the interpretation; this file
has the raw pull for future reference/re-checks.

## Primary keywords per page

| Keyword | Search volume/mo | SEO difficulty | Competition | Intent | Notes |
|---|--:|--:|---|---|---|
| `cat recovery suit` | 6,600 (range 5,400–8,100 across the year, peaks Oct–Jan) | 27 | 1.0 | Transactional | See long-tail table below |
| `cat surgery suit` | 1,900 (range 1,600–2,400) | 27 | 1.0 | Transactional | Same demand cluster as recovery suit |
| `spay recovery suit for cats` | 0 | 4 | 0 | — | Don't target literally |
| `sphynx cat clothes` | 2,400 (range 1,600–2,900) | 18 | 1.0 | Transactional | Home |
| `hairless cat clothes` | 2,400 (range 1,600–2,900) | 18 | 1.0 | Transactional | Home |
| `sphynx cat sweater` | 1,900–2,400 (range 1,000–2,400) | 30 | 0.92 | Transactional | `/sphynx-cat-sweaters` |
| `sphynx cat costume` | 260 (spikes to 880 in Oct) | 22 | 0.91 | Transactional | `/sphynx-cat-christmas-sweaters` |
| `cat winter clothes` | 260 (spikes to 720 in Nov) | 25 | 0.92 | Transactional | `/sphynx-cat-winter-clothes` |
| `sphynx cat shirt` | 70–110 | 27 | 1.0 | Transactional | `/sphynx-cat-shirts` (Phase 2) |
| `sphynx cat hoodie` | 20–90 | 17 | 0.99 | Transactional | `/sphynx-cat-hoodies` |
| `sphynx cat pajamas` | 20–70 | 26 | 0.89 | Transactional | `/sphynx-cat-pajamas` (Phase 2) |
| `devon rex clothes` | 20–40 | 28 | 1.0 | Transactional | `/devon-rex-clothes` (Phase 2) |
| `sphynx winter clothes` | 10 (max 20) | 44 | 1.0 | — | Literal phrase not worth targeting |
| `christmas sweater for sphynx cat` | 0 | 4 | 0 | — | Literal phrase not worth targeting |
| `warm clothes for sphynx cat` | 0 | 4 | 0 | — | Literal phrase not worth targeting |
| `how to keep a sphynx cat warm` | 0 | 4 | 0 | — | Guide pillar title needs a different exact phrasing — re-check before publishing |

## `cat recovery suit` long-tail (top by volume, from `keyword_suggestions`, 100+ results total)

| Keyword | Vol/mo | SD | Read |
|---|--:|--:|---|
| `suitical cat recovery suit` | 1,300 | 27 | Branded — competitor/comparison angle only |
| `cat recovery suit near me` | 1,000 | 24 | Local intent, not ownable by an online store |
| `cat recovery suit nearby` | 390 | 25 | Same |
| `petco cat recovery suit` | 210 | 22 | Retailer-branded |
| `cat recovery suit amazon` | 210 | 30 | Retailer-branded |
| `cat recovery suit for spay` | 210 | 27 | **Use in collection FAQ/H2** |
| `diy cat recovery suit` | 170 | 30 | Informational — guide opportunity |
| `target cat recovery suit` / `avont` / `petsmart` / `amazon` / `chewy` / `walmart` | 50–170 each | 22–30 | Retailer-branded cluster; not targetable directly, confirms Amazon/Chewy/Petco/PetSmart/Target/Walmart are the incumbents to watch |
| `male cat recovery suit` | 90 | 27 | Product-variant long tail — good PDP/collection filter language |
| `cat recovery suit with legs` | 90 | 28 | Product-variant long tail |
| `best cat recovery suit` | 70 | 27 | Comparison/roundup angle |
| `cat recovery suit vs cone` | 20 | 26 | **Matches the already-planned Sprint C guide `cat-recovery-suit-vs-cone`** — low solo volume but high relevance as the collection page's FAQ answer and as an internal link target |
| `cat recovery suit for neuter` | 50 | 25 | **Use in collection FAQ/H2** alongside "for spay" |

Everything past roughly the top 30 rows drops to 0–10/mo — long tail is real but
thin per-term; the actionable takeaway is the **for spay / for neuter / vs cone
/ named-retailer** clusters, not any single long-tail keyword.

## Domain snapshot (`domain_overview`, kittycontrol.shop)

- Domain Authority: 9
- Backlinks: 59 (all follow) across 53 referring domains
- Already-indexed organic keywords (3 found): `sphynx pajamas` (pos 29, vol 40),
  `clothes for hairless cats` (pos 42, vol 2,400, on `/`), `sphynx cat pajamas`
  (pos 41, vol 40, on the pajamas PDP)
- `competitors` tool returned no data for locId 2840 (too new/thin a footprint
  for Ubersuggest's competitor-detection to resolve yet) — re-run once more
  organic keywords are indexed, likely after the Phase 1 push.

## Caveats

- Single-source pull (Ubersuggest only) — no GSC/Keyword Planner
  cross-check yet, so treat as directional, same caveat the strategy doc
  already applies to the original research doc's estimates (§2.1 there).
- Seasonal ranges are Ubersuggest's trailing 12-month history, not a
  forecast — re-pull closer to each collection's peak month before making a
  push/no-push call on new content.
- `competitors` call failed for lack of data; don't re-attempt more than
  monthly until the domain has enough indexed keywords for it to resolve.

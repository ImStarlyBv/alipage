/**
 * Populate `Product.slug` for products that don't have one yet.
 *
 * Until this shipped, slugs were derived from `title` on every render and never
 * stored, so renaming a product silently moved its URL and 404'd the version
 * Google had indexed. This writes the slug that is ALREADY the live URL for
 * each product, freezing it so later title edits stop changing URLs.
 *
 * Slug generation mirrors `slugifyTitle` + `findFreeSlug` in
 * `src/lib/utils/product-slugs.ts` exactly, over the same rows and the same
 * ordering the old render-time call sites used (`active: true`,
 * `createdAt asc, id asc`), so no URL changes as a result of running this.
 * `scripts/lib/product-slug.js` is the CommonJS mirror, held in lockstep by a
 * parity test.
 *
 * Idempotent, and only ever fills NULLs: an existing slug is a product's
 * permanent identity, so a title edit must not rewrite it. Safe to run on every
 * boot.
 *
 *   node scripts/backfill-product-slugs.js            # dry run
 *   node scripts/backfill-product-slugs.js --apply    # write
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { slugifyTitle, findFreeSlug } = require("./lib/product-slug");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/**
 * Decide which products get which slug. Pure — pass it the rows and it returns
 * the writes, so the logic that decides whether live URLs change is unit
 * testable without a database (see the accompanying test).
 *
 * Walks the products in the order given (oldest first) and hands each one the
 * first free candidate for its title. Suffixing is driven entirely by what is
 * already taken, rather than by a separate occurrence count, so it composes
 * correctly with slugs that already exist and can never emit `x-2-2`.
 *
 * @param activeRows    `SELECT id, title FROM "Product" WHERE active = true
 *                       ORDER BY "createdAt" ASC, id ASC`
 * @param existingRows   `SELECT id, slug FROM "Product" WHERE slug IS NOT NULL`
 */
function planSlugAssignments(activeRows, existingRows) {
  // Any slug already in the table is off-limits, including ones on inactive
  // products, so an assignment can never trip the unique index.
  const taken = new Set(existingRows.map((row) => row.slug));
  const alreadySet = new Set(existingRows.map((row) => row.id));

  const assignments = [];
  for (const product of activeRows) {
    if (alreadySet.has(product.id)) continue;

    const slug = findFreeSlug(slugifyTitle(product.title), taken);
    taken.add(slug);
    assignments.push({ id: product.id, slug });
  }

  return { assignments, alreadySetCount: alreadySet.size };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const root = path.resolve(__dirname, "..");
  loadEnv(path.join(root, ".env"));

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Same rows and same ordering as every render-time slug call site, so the
    // computed slugs match the URLs currently being served.
    const active = await client.query(
      `SELECT id, title FROM "Product"
       WHERE active = true
       ORDER BY "createdAt" ASC, id ASC`
    );

    const existing = await client.query(
      `SELECT id, slug FROM "Product" WHERE slug IS NOT NULL`
    );

    const { assignments, alreadySetCount } = planSlugAssignments(
      active.rows,
      existing.rows
    );

    if (!assignments.length) {
      console.log(
        `Slug backfill: nothing to do (${alreadySetCount} products already have a slug).`
      );
      return;
    }

    if (!apply) {
      for (const { id, slug } of assignments) {
        const title = active.rows.find((row) => row.id === id).title;
        console.log(`  ${slug}  <-  ${title}`);
      }
      console.log(
        `Slug backfill: would set ${assignments.length} slug(s). Dry run — pass --apply to write.`
      );
      return;
    }

    await client.query("BEGIN");
    for (const { id, slug } of assignments) {
      // `slug IS NULL` guard keeps this a no-op if a concurrent boot already
      // filled the row, rather than overwriting a title-changed product's slug.
      await client.query(
        `UPDATE "Product" SET slug = $1 WHERE id = $2 AND slug IS NULL`,
        [slug, id]
      );
    }
    await client.query("COMMIT");

    console.log(
      `Slug backfill: set ${assignments.length} slug(s); ${alreadySetCount} were already present.`
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = { planSlugAssignments };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

import { BRAND_NAME, SITE_URL } from "./merchant-policy";

/**
 * Stable `@id`s so the site has one Organization and one WebSite entity that
 * every other block can point at, instead of each page restating them. Repeated
 * inline copies are duplicate nodes Google has to reconcile, and they make a
 * brand-name change a multi-file edit.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const ORGANIZATION_DESCRIPTION =
  "Online store specializing in sphynx cat clothes for hairless cats — warm sweaters, breathable shirts, pajamas, hoodies and winter outfits.";

/**
 * §3.3 fields whose real values don't exist yet. Each is emitted only when set,
 * because a wrong value here is worse than a missing one: a `logo` URL that
 * 404s or a `sameAs` profile that isn't ours is a false brand-identity claim,
 * and a `contactPoint` carrying neither email nor telephone is invalid schema.
 *
 * To finish §3.3: drop a square logo of at least 112×112 into `public/` and set
 * the path (`favicon.ico` is too small for Google), add the real profile URLs,
 * and set a monitored support address.
 */
export const ORGANIZATION_LOGO_PATH: string | null = null;
export const ORGANIZATION_SAME_AS: readonly string[] = [];
export const ORGANIZATION_CONTACT_EMAIL: string | null = null;

/**
 * `Brand` is a second type, not a decoration: `ProductJsonLd` points each
 * product's brand at this `@id`, and a `Brand` reference has to resolve to a
 * node that is one.
 */
export const ORGANIZATION = {
  "@type": ["Organization", "Brand"],
  "@id": ORGANIZATION_ID,
  name: BRAND_NAME,
  url: SITE_URL,
  description: ORGANIZATION_DESCRIPTION,
  ...(ORGANIZATION_LOGO_PATH
    ? { logo: `${SITE_URL}${ORGANIZATION_LOGO_PATH}` }
    : {}),
  ...(ORGANIZATION_SAME_AS.length > 0
    ? { sameAs: [...ORGANIZATION_SAME_AS] }
    : {}),
  ...(ORGANIZATION_CONTACT_EMAIL
    ? {
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: ORGANIZATION_CONTACT_EMAIL,
        },
      }
    : {}),
} as const;

/**
 * Deliberately no `potentialAction`. It used to advertise a `SearchAction`
 * targeting `/products?q={search_term_string}`, but `src/app/products/page.tsx`
 * never reads a `q` param and there is no search box — the schema promised a
 * feature that does not exist. Re-add it only alongside a real one.
 */
export const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: BRAND_NAME,
  inLanguage: "en",
  publisher: { "@id": ORGANIZATION_ID },
} as const;

/**
 * Site-wide graph, emitted once from the root layout. Both nodes are in the same
 * graph, so the `publisher` reference resolves without restating the name.
 */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [ORGANIZATION, WEBSITE],
} as const;

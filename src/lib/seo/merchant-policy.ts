/**
 * Merchant shipping + return policy used to build Product/Offer structured data.
 *
 * ⚠️ These values are surfaced to Google and to shoppers. They MUST match the
 * policy you actually honour — misstated shipping/returns in schema is a
 * structured-data violation (and, for returns, a consumer-law issue). Edit the
 * values below to your real terms before relying on the rich results.
 */

export const SITE_URL = "https://kittycontrol.shop";
export const BRAND_NAME = "Kitty Control";

/** Markets you ship to and want to advertise free shipping for. */
export const SHIPPING_COUNTRIES = ["US", "CA", "GB", "AU", "DE", "FR", "ES"];

/** Free worldwide shipping. Transit window matches the homepage copy (7–20 days). */
export const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: "0",
    currency: "USD",
  },
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: SHIPPING_COUNTRIES,
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 3,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 7,
      maxValue: 20,
      unitCode: "DAY",
    },
  },
} as const;

/**
 * Return policy. Defaults below are conservative dropship-style terms
 * (30-day window, buyer pays return shipping). CONFIRM these are your real
 * terms — publish a /returns page that states the same.
 */
export const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: SHIPPING_COUNTRIES,
  returnPolicyCategory:
    "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnShippingFees",
} as const;

/** Rolling price validity ~1 year out (removes the GSC "priceValidUntil" warning). */
export function priceValidUntil(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

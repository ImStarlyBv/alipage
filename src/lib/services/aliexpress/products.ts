import { apiCall, type AliExpressResponse } from "./client";

/** Get all dropshipping categories. → aliexpress.ds.category.get */
export async function getCategories(): Promise<AliExpressResponse> {
  return apiCall("aliexpress.ds.category.get", {}, true);
}

/**
 * Get product details for dropshipping. → aliexpress.ds.product.get
 *
 * @param productId - AliExpress product ID
 * @param country - Ship-to country code (default "US")
 * @param currency - Target currency (default "USD")
 * @param lang - Target language (default "en")
 */
export async function getProduct(
  productId: string | number,
  country = "US",
  currency = "USD",
  lang = "en"
): Promise<AliExpressResponse> {
  return apiCall(
    "aliexpress.ds.product.get",
    {
      product_id: String(productId),
      ship_to_country: country,
      target_currency: currency,
      target_language: lang,
    },
    true
  );
}

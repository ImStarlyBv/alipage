import { apiCall, type AliExpressResponse } from "./client";

/**
 * Query shipping options and costs. → aliexpress.ds.freight.query
 *
 * Params inside queryDeliveryReq must be camelCase.
 * quantity must be a string, not a number.
 */
export async function queryShipping(
  productId: string | number,
  skuId: string,
  country = "US",
  quantity = 1,
  currency = "USD"
): Promise<AliExpressResponse> {
  return apiCall(
    "aliexpress.ds.freight.query",
    {
      queryDeliveryReq: JSON.stringify({
        productId: String(productId),
        selectedSkuId: skuId,
        quantity: String(quantity),
        shipToCountry: country,
        language: "en_US",
        currency,
        locale: "en_US",
      }),
    },
    true
  );
}

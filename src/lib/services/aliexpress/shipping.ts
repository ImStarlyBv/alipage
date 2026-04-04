import { apiCall, type AliExpressResponse } from "./client";

/**
 * Query shipping options and costs. → aliexpress.ds.freight.query
 *
 * Important: params inside queryDeliveryReq must be camelCase.
 * Also needs currency/locale/language as both top-level and inner params.
 */
export async function queryShipping(
  productId: string | number,
  skuId: string,
  country = "US",
  quantity = 1,
  price = "10.00",
  currency = "USD"
): Promise<AliExpressResponse> {
  return apiCall(
    "aliexpress.ds.freight.query",
    {
      queryDeliveryReq: JSON.stringify({
        productId: Number(productId),
        selectedSkuId: skuId,
        quantity,
        productNum: quantity,
        shipToCountry: country,
        countryCode: country,
        sendGoodsCountryCode: "CN",
        price,
        priceCurrency: currency,
        currency,
        locale: "en_US",
        language: "en",
      }),
      currency,
      locale: "en_US",
      language: "en",
    },
    true
  );
}

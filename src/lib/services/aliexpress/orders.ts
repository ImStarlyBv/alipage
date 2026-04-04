import { apiCall, type AliExpressResponse } from "./client";

export interface ShippingAddress {
  full_name: string;
  phone_country: string;
  mobile_no: string;
  address: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

/**
 * Create a dropshipping order. → aliexpress.ds.order.create
 *
 * @param productId - AliExpress product ID
 * @param skuAttr - SKU attribute string from product variants
 * @param quantity - Number of items
 * @param shippingMethod - Logistics service name from shipping query
 * @param address - Customer shipping address
 * @param memo - Order memo (default: no invoice/promotions)
 */
export async function createOrder(
  productId: string | number,
  skuAttr: string,
  quantity: number,
  shippingMethod: string,
  address: ShippingAddress,
  memo = "Dropshipping order. No invoice or promotions please."
): Promise<AliExpressResponse> {
  return apiCall(
    "aliexpress.ds.order.create",
    {
      logistics_address: JSON.stringify({
        address: address.address,
        city: address.city,
        country: address.country,
        full_name: address.full_name,
        mobile_no: address.mobile_no,
        phone_country: address.phone_country,
        province: address.province,
        zip: address.zip,
      }),
      product_items: JSON.stringify([
        {
          logistics_service_name: shippingMethod,
          order_memo: memo,
          product_count: quantity,
          product_id: Number(productId),
          sku_attr: skuAttr,
        },
      ]),
    },
    true
  );
}

/** Get order details. → aliexpress.ds.trade.order.get */
export async function getOrder(
  orderId: string | number
): Promise<AliExpressResponse> {
  return apiCall(
    "aliexpress.ds.trade.order.get",
    { order_id: String(orderId) },
    true
  );
}

/** Get tracking info for an order. → aliexpress.ds.trade.order.get */
export async function getTracking(
  orderId: string | number
): Promise<AliExpressResponse> {
  return apiCall(
    "aliexpress.ds.trade.order.get",
    { order_id: String(orderId) },
    true
  );
}

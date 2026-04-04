// PayPal Orders Service - Server Side Only
// Uses OrdersController for create, capture, and get operations

import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { ordersController } from "./client";

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: string; // sale price with markup, e.g. "29.99"
}

/**
 * Create a PayPal order from cart items.
 * Prices are calculated server-side with markup already applied.
 * Returns the full PayPal API response (stored as raw for audit).
 */
export async function createPayPalOrder(
  cartItems: CartItem[],
  currency = "USD"
) {
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0
  );

  const { result } = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: currency,
            value: itemTotal.toFixed(2),
            breakdown: {
              itemTotal: {
                currencyCode: currency,
                value: itemTotal.toFixed(2),
              },
            },
          },
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            unitAmount: {
              currencyCode: currency,
              value: item.unitPrice,
            },
          })),
        },
      ],
    },
    prefer: "return=representation",
  });

  return result;
}

/**
 * Capture payment for an approved PayPal order.
 * Call this after the buyer approves via the PayPal popup.
 * Returns the full response (store as paypalRawResponse for audits).
 */
export async function capturePayPalOrder(orderId: string) {
  const { result } = await ordersController.captureOrder({
    id: orderId,
    prefer: "return=representation",
  });

  return result;
}

/**
 * Get details for a PayPal order by ID.
 */
export async function getPayPalOrder(orderId: string) {
  const { result } = await ordersController.getOrder({
    id: orderId,
  });

  return result;
}

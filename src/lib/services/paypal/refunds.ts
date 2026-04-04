// PayPal Refunds Service - Server Side Only
// Uses PaymentsController for refund operations

import { paymentsController } from "./client";

/**
 * Refund a captured payment.
 * For full refund: omit amount. For partial: pass amount + currency.
 *
 * @param captureId - The PayPal capture ID (from the capture response)
 * @param amount - Optional partial refund amount (e.g. "15.00")
 * @param currency - Currency code (default USD)
 */
export async function refundCapture(
  captureId: string,
  amount?: string,
  currency = "USD"
) {
  const { result } = await paymentsController.refundCapturedPayment({
    captureId,
    prefer: "return=representation",
    body: amount
      ? {
          amount: {
            currencyCode: currency,
            value: amount,
          },
        }
      : {},
  });

  return result;
}

// PayPal Webhook Signature Verification - Server Side Only
// Verifies that incoming webhooks are genuinely from PayPal

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

/**
 * Verify a PayPal webhook notification signature.
 *
 * PayPal signs webhooks using a CRC32 + SHA-256 scheme.
 * The recommended approach is calling PayPal's verify-webhook-signature API,
 * since local verification requires downloading PayPal's cert chain.
 *
 * This function calls PayPal's REST API to verify.
 */
export async function verifyWebhookSignature(
  headers: Record<string, string>,
  rawBody: string
): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.error("PAYPAL_WEBHOOK_ID not configured");
    return false;
  }

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  // Get OAuth token
  const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!authResponse.ok) {
    console.error("Failed to get PayPal OAuth token for webhook verification");
    return false;
  }

  const { access_token } = (await authResponse.json()) as {
    access_token: string;
  };

  // Call PayPal's verify-webhook-signature endpoint
  const verifyResponse = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
    }
  );

  if (!verifyResponse.ok) {
    console.error("PayPal webhook verification request failed");
    return false;
  }

  const result = (await verifyResponse.json()) as {
    verification_status: string;
  };
  return result.verification_status === "SUCCESS";
}

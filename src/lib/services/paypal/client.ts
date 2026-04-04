// PayPal Server SDK Client - Server Side Only
// Auth: OAuth 2.0 Client Credentials (auto-managed by SDK)

import {
  Client,
  Environment,
  OrdersController,
  PaymentsController,
} from "@paypal/paypal-server-sdk";

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment:
    process.env.PAYPAL_MODE === "live"
      ? Environment.Production
      : Environment.Sandbox,
});

export const ordersController = new OrdersController(client);
export const paymentsController = new PaymentsController(client);

export { client };

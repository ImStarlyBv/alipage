import { sendEmail } from "./send";

const STORE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/** Send order confirmation email after successful payment */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalPaid: number;
}) {
  const { to, customerName, orderNumber, orderId, items, totalPaid } = params;

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <h2 style="color:#000">Order Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your order. We've received your payment and are processing your order now.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr style="background:#f5f5f5">
          <td style="padding:8px 12px;font-weight:bold">Order #</td>
          <td style="padding:8px 12px">${orderNumber.slice(0, 8)}</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px 12px;text-align:left">Item</th>
            <th style="padding:8px 12px;text-align:center">Qty</th>
            <th style="padding:8px 12px;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:bold">Total</td>
            <td style="padding:12px;text-align:right;font-weight:bold">$${totalPaid.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p>
        <a href="${STORE_URL}/account/orders/${orderId}"
           style="display:inline-block;background:#000;color:#fff;padding:10px 24px;text-decoration:none;border-radius:6px">
          View Order
        </a>
      </p>

      <p style="margin-top:24px;font-size:13px;color:#888">
        You'll receive another email when your order ships.
      </p>
    </div>
  `;

  await sendEmail(to, `Order Confirmed — #${orderNumber.slice(0, 8)}`, html);
}

/** Send shipping update email when tracking info is available or status changes */
export async function sendShippingUpdateEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  newStatus: string;
  trackingNumber?: string;
}) {
  const { to, customerName, orderNumber, orderId, newStatus, trackingNumber } =
    params;

  const statusLabel =
    newStatus === "SHIPPED"
      ? "Your order has shipped!"
      : newStatus === "DELIVERED"
        ? "Your order has been delivered!"
        : `Order status updated: ${newStatus}`;

  const trackingHtml = trackingNumber
    ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>`
    : "";

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <h2 style="color:#000">${statusLabel}</h2>
      <p>Hi ${customerName},</p>
      <p>We have an update on your order <strong>#${orderNumber.slice(0, 8)}</strong>.</p>

      ${trackingHtml}

      <p>
        <a href="${STORE_URL}/account/orders/${orderId}"
           style="display:inline-block;background:#000;color:#fff;padding:10px 24px;text-decoration:none;border-radius:6px">
          View Order Details
        </a>
      </p>

      <p style="margin-top:24px;font-size:13px;color:#888">
        Thank you for shopping with us!
      </p>
    </div>
  `;

  await sendEmail(to, `${statusLabel} — #${orderNumber.slice(0, 8)}`, html);
}

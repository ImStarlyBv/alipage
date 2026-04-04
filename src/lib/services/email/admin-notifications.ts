import { sendEmail } from "./send";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

export async function notifyAdminOrderFailed(order: {
  id: string;
  orderNumber: string;
  totalPaid: string | number;
  failureReason: string | null;
  items: Array<{ name: string; quantity: number }>;
}) {
  if (!ADMIN_EMAIL) {
    console.warn("[email] No ADMIN_EMAIL configured — skipping notification");
    return;
  }

  const itemsList = order.items
    .map((item) => `<li>${item.name} x${item.quantity}</li>`)
    .join("");

  const html = `
    <h2>Order Failed: #${order.orderNumber.slice(0, 8)}</h2>
    <p>An AliExpress order failed after all retry attempts.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Order ID</td><td>${order.id}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Amount Paid</td><td>$${Number(order.totalPaid).toFixed(2)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Failure Reason</td><td style="color:#dc2626">${order.failureReason || "Unknown"}</td></tr>
    </table>
    <p><strong>Items:</strong></p>
    <ul>${itemsList}</ul>
    <p style="margin-top:16px">
      <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/orders/${order.id}"
         style="background:#000;color:#fff;padding:8px 16px;text-decoration:none;border-radius:4px">
        View Order in Admin
      </a>
    </p>
  `;

  await sendEmail(ADMIN_EMAIL, `[ACTION REQUIRED] Order #${order.orderNumber.slice(0, 8)} failed`, html);
}

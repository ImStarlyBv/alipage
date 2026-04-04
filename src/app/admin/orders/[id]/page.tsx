"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface OrderLog {
  id: string;
  action: string;
  attempt: number;
  requestData: Record<string, unknown> | null;
  responseData: Record<string, unknown> | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  variantId?: string;
  variantLabel?: string;
  aliexpressId?: string;
  skuAttr?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: {
    full_name: string;
    phone: string;
    address: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  } | null;
  totalPaid: string;
  currency: string;
  status: string;
  failureReason: string | null;
  aliexpressOrderId: string | null;
  aliexpressStatus: string | null;
  aliexpressTrackingNumber: string | null;
  paypalTransactionId: string | null;
  paypalStatus: string | null;
  manuallyCompleted: boolean;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  logs: OrderLog[];
}

const statusColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING_AE_ORDER: "bg-yellow-100 text-yellow-800",
  AE_ORDER_PLACED: "bg-blue-100 text-blue-800",
  AE_ORDER_FAILED: "bg-red-100 text-red-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [manualForm, setManualForm] = useState<{
    aeOrderId: string;
    tracking: string;
  } | null>(null);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${params.id}`);
    if (res.ok) {
      setOrder(await res.json());
    }
    setLoading(false);
  }

  async function retryOrder() {
    if (!order) return;
    setActionLoading(true);
    await fetch(`/api/admin/orders/${order.id}/retry-ae`, { method: "POST" });
    await loadOrder();
    setActionLoading(false);
  }

  async function completeManual() {
    if (!order || !manualForm) return;
    setActionLoading(true);
    await fetch(`/api/admin/orders/${order.id}/complete-manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aliexpressOrderId: manualForm.aeOrderId,
        trackingNumber: manualForm.tracking,
      }),
    });
    setManualForm(null);
    await loadOrder();
    setActionLoading(false);
  }

  if (loading) {
    return <p className="text-gray-500">Loading order...</p>;
  }

  if (!order) {
    return <p className="text-red-500">Order not found.</p>;
  }

  const canRetry =
    order.status === "AE_ORDER_FAILED" || order.status === "PENDING_AE_ORDER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to Orders
          </button>
          <h2 className="mt-1 text-2xl font-bold">
            Order #{order.orderNumber.slice(0, 8)}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || "bg-gray-100"}`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Failure Reason */}
      {order.failureReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Failure Reason</p>
          <p className="mt-1 text-sm text-red-700">{order.failureReason}</p>
        </div>
      )}

      {/* Actions */}
      {canRetry && (
        <div className="flex gap-2">
          <button
            onClick={retryOrder}
            disabled={actionLoading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? "Retrying..." : "Retry Auto"}
          </button>
          <button
            onClick={() =>
              setManualForm({ aeOrderId: "", tracking: "" })
            }
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Complete Manual
          </button>
        </div>
      )}

      {/* Manual completion form */}
      {manualForm && (
        <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
          <p className="text-sm font-medium">Manual Completion</p>
          <input
            type="text"
            placeholder="AliExpress Order ID"
            value={manualForm.aeOrderId}
            onChange={(e) =>
              setManualForm({ ...manualForm, aeOrderId: e.target.value })
            }
            className="block w-full rounded border px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Tracking Number"
            value={manualForm.tracking}
            onChange={(e) =>
              setManualForm({ ...manualForm, tracking: e.target.value })
            }
            className="block w-full rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={completeManual}
              disabled={actionLoading}
              className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setManualForm(null)}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Customer</h3>
          <p className="mt-1 font-medium">{order.customer.name}</p>
          <p className="text-sm text-gray-600">{order.customer.email}</p>
        </div>

        {/* Payment Info */}
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Payment</h3>
          <p className="mt-1 text-xl font-bold">
            ${Number(order.totalPaid).toFixed(2)} {order.currency}
          </p>
          {order.paypalTransactionId && (
            <p className="text-sm text-gray-600">
              PayPal: {order.paypalTransactionId}
            </p>
          )}
          {order.paypalStatus && (
            <p className="text-sm text-gray-600">
              Status: {order.paypalStatus}
            </p>
          )}
        </div>

        {/* Shipping Address */}
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">
            Shipping Address
          </h3>
          {order.shippingAddress ? (
            <div className="mt-1 text-sm">
              <p className="font-medium">{order.shippingAddress.full_name}</p>
              <p>{order.shippingAddress.address}</p>
              {order.shippingAddress.address2 && (
                <p>{order.shippingAddress.address2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p>Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-red-500">
              No shipping address on file
            </p>
          )}
        </div>

        {/* AliExpress Info */}
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">AliExpress</h3>
          <div className="mt-1 text-sm">
            {order.aliexpressOrderId ? (
              <p>
                Order ID: <span className="font-mono">{order.aliexpressOrderId}</span>
              </p>
            ) : (
              <p className="text-gray-400">No AE order yet</p>
            )}
            {order.aliexpressStatus && <p>Status: {order.aliexpressStatus}</p>}
            {order.aliexpressTrackingNumber && (
              <p>
                Tracking:{" "}
                <span className="font-mono">
                  {order.aliexpressTrackingNumber}
                </span>
              </p>
            )}
            {order.manuallyCompleted && (
              <p className="mt-1 text-yellow-600">Manually completed</p>
            )}
            <p className="text-gray-400">Retry count: {order.retryCount}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-500">
          Items ({order.items.length})
        </h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Product ID:{" "}
                  <span className="font-mono">{item.productId}</span>
                </p>
                {item.aliexpressId && (
                  <p className="text-xs text-gray-500">
                    AE ID:{" "}
                    <span className="font-mono">{item.aliexpressId}</span>
                  </p>
                )}
                {item.variantId && (
                  <p className="text-xs text-gray-500">
                    Variant: <span className="font-mono">{item.variantId}</span>
                    {item.variantLabel && ` (${item.variantLabel})`}
                  </p>
                )}
                {item.skuAttr && (
                  <p className="text-xs text-gray-500">
                    SKU Attr: <span className="font-mono">{item.skuAttr}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm">x{item.quantity}</p>
                {item.price && (
                  <p className="text-sm font-medium">
                    ${Number(item.price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Logs */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-500">
          Order Logs ({order.logs.length})
        </h3>
        {order.logs.length === 0 ? (
          <p className="text-sm text-gray-400">No logs yet.</p>
        ) : (
          <div className="space-y-2">
            {order.logs.map((log) => (
              <div
                key={log.id}
                className={`rounded border-l-4 p-3 text-sm ${
                  log.success
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {log.action} (attempt {log.attempt})
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                {log.errorMessage && (
                  <p className="mt-1 text-red-700">{log.errorMessage}</p>
                )}
                {log.requestData && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-gray-500">
                      Request Data
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-xs">
                      {JSON.stringify(log.requestData, null, 2)}
                    </pre>
                  </details>
                )}
                {log.responseData && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-gray-500">
                      Response Data
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-xs">
                      {JSON.stringify(log.responseData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number }>;
  totalPaid: string;
  status: string;
  failureReason: string | null;
  aliexpressOrderId: string | null;
  aliexpressTrackingNumber: string | null;
  manuallyCompleted: boolean;
  createdAt: string;
  customer: { name: string; email: string };
}

const statuses = [
  "",
  "PAID",
  "PENDING_AE_ORDER",
  "AE_ORDER_PLACED",
  "AE_ORDER_FAILED",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "CANCELLED",
];

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState<{
    orderId: string;
    aeOrderId: string;
    tracking: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const url = statusFilter
      ? `/api/admin/orders?status=${statusFilter}`
      : "/api/admin/orders";
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    void Promise.resolve().then(loadOrders);
  }, [loadOrders]);

  async function retryOrder(orderId: string) {
    setActionLoading(orderId);
    await fetch(`/api/admin/orders/${orderId}/retry-ae`, { method: "POST" });
    await loadOrders();
    setActionLoading(null);
  }

  async function completeManual() {
    if (!manualForm) return;
    setActionLoading(manualForm.orderId);
    await fetch(`/api/admin/orders/${manualForm.orderId}/complete-manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aliexpressOrderId: manualForm.aeOrderId,
        trackingNumber: manualForm.tracking,
      }),
    });
    setManualForm(null);
    await loadOrders();
    setActionLoading(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="">All Statuses</option>
          {statuses
            .filter(Boolean)
            .map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-4 text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50"
              onClick={() => router.push(`/admin/orders/${order.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    #{order.orderNumber.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p className="mt-1 font-bold">
                    ${Number(order.totalPaid).toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                {order.aliexpressOrderId &&
                  ` | AE: ${order.aliexpressOrderId}`}
                {order.aliexpressTrackingNumber &&
                  ` | Track: ${order.aliexpressTrackingNumber}`}
                {order.manuallyCompleted && " | Manually completed"}
              </p>

              {order.failureReason && (
                <p className="mt-1 text-xs text-red-600">
                  Failure: {order.failureReason}
                </p>
              )}

              {/* Actions */}
              {(order.status === "AE_ORDER_FAILED" ||
                order.status === "PENDING_AE_ORDER") && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => retryOrder(order.id)}
                    disabled={actionLoading === order.id}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                  >
                    {actionLoading === order.id
                      ? "Retrying..."
                      : "Retry Auto"}
                  </button>
                  <button
                    onClick={() =>
                      setManualForm({
                        orderId: order.id,
                        aeOrderId: "",
                        tracking: "",
                      })
                    }
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Complete Manual
                  </button>
                </div>
              )}

              {/* Manual completion form */}
              {manualForm?.orderId === order.id && (
                <div className="mt-3 space-y-2 rounded bg-gray-50 p-3">
                  <input
                    type="text"
                    placeholder="AliExpress Order ID"
                    value={manualForm.aeOrderId}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, aeOrderId: e.target.value })
                    }
                    className="block w-full rounded border px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={manualForm.tracking}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, tracking: e.target.value })
                    }
                    className="block w-full rounded border px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={completeManual}
                      disabled={actionLoading === order.id}
                      className="rounded bg-black px-3 py-1 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setManualForm(null)}
                      className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

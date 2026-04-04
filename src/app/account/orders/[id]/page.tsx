"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderDetail {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: string;
    image?: string;
  }>;
  totalPaid: string;
  currency: string;
  status: string;
  aliexpressTrackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  PAID: "Payment Received",
  PENDING_AE_ORDER: "Processing",
  AE_ORDER_PLACED: "Order Placed with Supplier",
  AE_ORDER_FAILED: "Processing Issue",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/account/orders/${orderId}`);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Order not found");
        return r.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, authStatus, router, orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">{error || "Order not found"}</p>
        <Link
          href="/account/orders"
          className="mt-4 inline-block text-sm hover:underline"
        >
          &larr; Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/account/orders"
        className="text-sm text-gray-500 hover:text-black"
      >
        &larr; Back to orders
      </Link>

      <h1 className="mt-4 text-2xl font-bold">
        Order #{order.orderNumber.slice(0, 8)}
      </h1>
      <p className="text-sm text-gray-500">
        Placed on {new Date(order.createdAt).toLocaleDateString()}
      </p>

      {/* Status */}
      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-sm font-semibold text-gray-500">Status</h2>
        <p className="mt-1 text-lg font-bold">
          {statusLabels[order.status] || order.status}
        </p>

        {order.aliexpressTrackingNumber && (
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-500">
              Tracking Number
            </h3>
            <p className="mt-1 font-mono text-sm">
              {order.aliexpressTrackingNumber}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-sm font-semibold text-gray-500">Items</h2>
        <div className="mt-3 divide-y">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold">
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t pt-3 text-right">
          <p className="text-lg font-bold">
            Total: ${Number(order.totalPaid).toFixed(2)} {order.currency}
          </p>
        </div>
      </div>
    </div>
  );
}

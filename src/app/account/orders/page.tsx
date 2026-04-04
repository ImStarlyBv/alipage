"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; unitPrice: string }>;
  totalPaid: string;
  currency: string;
  status: string;
  createdAt: string;
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

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/account/orders");
      return;
    }

    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, authStatus, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Order #{order.orderNumber.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p className="mt-1 text-sm font-bold">
                    ${Number(order.totalPaid).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

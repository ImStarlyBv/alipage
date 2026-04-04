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
  PAID: "bg-primary/20 text-primary-dark",
  PENDING_AE_ORDER: "bg-secondary/30 text-amber-800",
  AE_ORDER_PLACED: "bg-primary/15 text-primary-dark",
  AE_ORDER_FAILED: "bg-red-100 text-red-800",
  SHIPPED: "bg-primary/20 text-primary-dark",
  DELIVERED: "bg-primary/25 text-primary-dark",
  REFUNDED: "bg-beige text-foreground/60",
  CANCELLED: "bg-beige text-foreground/60",
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
        <p className="text-foreground/50">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-foreground/50">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
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
              className="block rounded-xl border border-primary/10 bg-white p-4 transition-all hover:shadow-md hover:shadow-secondary/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Order #{order.orderNumber.slice(0, 8)}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-beige"}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p className="mt-1 text-sm font-bold text-primary-dark">
                    ${Number(order.totalPaid).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-foreground/50">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

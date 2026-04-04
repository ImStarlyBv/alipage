"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  failedOrders: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/orders?limit=1000"),
        fetch("/api/products?limit=1"),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      const orders = ordersData.orders || [];
      const totalRevenue = orders.reduce(
        (sum: number, o: { totalPaid: string }) => sum + Number(o.totalPaid),
        0
      );
      const pendingOrders = orders.filter(
        (o: { status: string }) =>
          o.status === "PENDING_AE_ORDER" || o.status === "PAID"
      ).length;
      const failedOrders = orders.filter(
        (o: { status: string }) => o.status === "AE_ORDER_FAILED"
      ).length;

      setStats({
        totalOrders: ordersData.pagination?.total || orders.length,
        totalRevenue,
        pendingOrders,
        failedOrders,
        totalProducts: productsData.pagination?.total || 0,
      });
    }

    loadStats();
  }, []);

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const cards = [
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}` },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Failed Orders", value: stats.failedOrders, alert: stats.failedOrders > 0 },
    { label: "Products", value: stats.totalProducts },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border p-4 ${
              card.alert ? "border-red-300 bg-red-50" : ""
            }`}
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

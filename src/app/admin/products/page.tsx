"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  salePrice: string;
  stock: number;
  active: boolean;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products?limit=50");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await fetch("/api/admin/products/sync", { method: "POST" });
      await loadProducts();
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading products...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync with AliExpress"}
          </button>
          <Link
            href="/admin/import"
            className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Import New
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No products yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 pr-4">
                    <p className="line-clamp-1 font-medium">{product.title}</p>
                  </td>
                  <td className="py-3 pr-4">
                    ${Number(product.salePrice).toFixed(2)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        product.stock === 0 ? "text-red-600" : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

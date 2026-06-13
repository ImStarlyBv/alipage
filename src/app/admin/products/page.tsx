"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  title: string;
  salePrice: string;
  basePrice: string;
  stock: number;
  active: boolean;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [wiping, setWiping] = useState(false);
  const [wipeMsg, setWipeMsg] = useState<string | null>(null);

  const WIPE_PHRASE = "DELETE ALL PRODUCTS";

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

  async function handleWipe() {
    if (wipeConfirm !== WIPE_PHRASE) return;
    setWiping(true);
    setWipeMsg(null);
    try {
      const res = await fetch("/api/admin/products/delete-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: WIPE_PHRASE }),
      });
      const data = await res.json();
      if (res.ok) {
        setWipeMsg(
          `Wiped ${data.deleted?.products ?? 0} products and ${
            data.deleted?.categories ?? 0
          } categories.`
        );
        setWipeOpen(false);
        setWipeConfirm("");
        await loadProducts();
      } else {
        setWipeMsg(data.error || "Failed to wipe products.");
      }
    } catch {
      setWipeMsg("Network error while wiping products.");
    } finally {
      setWiping(false);
    }
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setEditPrice(Number(product.salePrice).toFixed(2));
  }

  function cancelEditing() {
    setEditingId(null);
    setEditPrice("");
  }

  async function savePrice(productId: string) {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) return;

    setSaving(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salePrice: price }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, salePrice: price.toString() } : p
          )
        );
        setEditingId(null);
        setEditPrice("");
      }
    } finally {
      setSaving(null);
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
          <button
            onClick={() => {
              setWipeOpen((v) => !v);
              setWipeMsg(null);
            }}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Delete all
          </button>
        </div>
      </div>

      {wipeOpen && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            Danger zone — this permanently deletes every product and imported
            category.
          </p>
          <p className="mt-1 text-sm text-red-700">
            Type{" "}
            <code className="rounded bg-white px-1 font-mono">{WIPE_PHRASE}</code>{" "}
            to confirm.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={wipeConfirm}
              onChange={(e) => setWipeConfirm(e.target.value)}
              placeholder={WIPE_PHRASE}
              className="w-64 rounded border border-red-300 px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
              aria-label="Confirmation phrase"
            />
            <button
              onClick={handleWipe}
              disabled={wipeConfirm !== WIPE_PHRASE || wiping}
              className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {wiping ? "Wiping…" : "Wipe catalog"}
            </button>
            <button
              onClick={() => {
                setWipeOpen(false);
                setWipeConfirm("");
              }}
              className="px-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {wipeMsg && (
        <p className="mt-3 text-sm text-gray-700" role="status">
          {wipeMsg}
        </p>
      )}

      {products.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No products yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Cost</th>
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
                  <td className="py-3 pr-4 text-gray-400 text-xs">
                    ${Number(product.basePrice).toFixed(2)}
                  </td>
                  <td className="py-3 pr-4">
                    {editingId === product.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") savePrice(product.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="w-20 rounded border px-1.5 py-0.5 text-sm focus:border-[#A2BFC2] focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => savePrice(product.id)}
                          disabled={saving === product.id}
                          className="rounded bg-[#A2BFC2] px-2 py-0.5 text-xs text-white hover:bg-[#8AABAD] disabled:opacity-50"
                        >
                          {saving === product.id ? "..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-1 text-xs text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(product)}
                        className="cursor-pointer rounded px-1.5 py-0.5 hover:bg-gray-100"
                        title="Click to edit price"
                      >
                        ${Number(product.salePrice).toFixed(2)}
                      </button>
                    )}
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
                      href={`/products/${product.slug}`}
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

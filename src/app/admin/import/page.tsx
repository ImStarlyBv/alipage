"use client";

import { FormEvent, useState } from "react";

export default function AdminImportPage() {
  const [aliexpressId, setAliexpressId] = useState("");
  const [markup, setMarkup] = useState("1.5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliexpressId: aliexpressId.trim(),
          markup: parseFloat(markup),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: `Product "${data.product.title}" imported successfully!`,
        });
        setAliexpressId("");
      } else {
        setResult({
          success: false,
          message: data.error || "Import failed",
        });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Import Product</h2>
      <p className="mt-1 text-sm text-gray-500">
        Import a product from AliExpress by entering its product ID.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <div>
          <label htmlFor="aliexpressId" className="block text-sm font-medium">
            AliExpress Product ID
          </label>
          <input
            id="aliexpressId"
            type="text"
            value={aliexpressId}
            onChange={(e) => setAliexpressId(e.target.value)}
            required
            placeholder="e.g. 1005006123456789"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="markup" className="block text-sm font-medium">
            Markup Multiplier
          </label>
          <input
            id="markup"
            type="number"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            min="1"
            step="0.1"
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Sale price = base price x markup (e.g. 1.5 = 50% margin)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import Product"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 max-w-md rounded p-3 text-sm ${
            result.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}

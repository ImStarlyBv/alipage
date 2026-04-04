"use client";

import { FormEvent, useState } from "react";

function extractProductId(input: string): string {
  const trimmed = input.trim();
  // If it's just digits, return as-is
  if (/^\d+$/.test(trimmed)) return trimmed;
  // Try to extract from URL: /item/1234567890.html or /item/1234567890
  const match = trimmed.match(/\/item\/(\d+)/);
  return match ? match[1] : trimmed;
}

export default function AdminImportPage() {
  const [rawInput, setRawInput] = useState("");
  const aliexpressId = extractProductId(rawInput);
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
          aliexpressId,
          markup: parseFloat(markup),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: `Product "${data.product.title}" imported successfully!`,
        });
        setRawInput("");
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
        Paste an AliExpress product link or ID to import it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <div>
          <label htmlFor="aliexpressId" className="block text-sm font-medium">
            AliExpress Product Link or ID
          </label>
          <input
            id="aliexpressId"
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            required
            placeholder="e.g. https://www.aliexpress.com/item/1005006123456789.html"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
          {rawInput && aliexpressId && (
            <p className="mt-1 text-xs text-gray-500">
              Product ID: {aliexpressId}
            </p>
          )}
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

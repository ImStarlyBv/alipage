"use client";

import { useState } from "react";

interface ShippingOption {
  serviceName: string;
  estimatedDays: string;
  cost: string;
  currency: string;
}

export default function ShippingOptions({ productId }: { productId: string }) {
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadShipping() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/shipping`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load shipping options");
        return;
      }
      setOptions(data.options || []);
    } catch {
      setError("Failed to load shipping options");
    } finally {
      setLoading(false);
    }
  }

  if (!options && !loading) {
    return (
      <button
        onClick={loadShipping}
        className="text-sm text-gray-600 underline hover:text-black"
      >
        Check shipping options
      </button>
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading shipping options...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (options && options.length === 0) {
    return <p className="text-sm text-gray-500">No shipping options available.</p>;
  }

  return (
    <div>
      <h3 className="text-sm font-medium">Shipping Options</h3>
      <div className="mt-2 space-y-2">
        {options!.map((opt, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{opt.serviceName}</p>
              <p className="text-xs text-gray-500">
                Est. {opt.estimatedDays} days
              </p>
            </div>
            <p className="font-medium">
              {Number(opt.cost) === 0
                ? "Free"
                : `$${Number(opt.cost).toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

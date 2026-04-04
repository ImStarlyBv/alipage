"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-full border border-primary/30">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="rounded-l-full px-3 py-2 text-sm transition-colors hover:bg-primary/10"
          disabled={disabled}
        >
          -
        </button>
        <span className="w-10 text-center text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="rounded-r-full px-3 py-2 text-sm transition-colors hover:bg-primary/10"
          disabled={disabled}
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={disabled || loading}
        className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50 sm:flex-1 sm:w-auto"
      >
        {loading ? "Adding..." : added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}

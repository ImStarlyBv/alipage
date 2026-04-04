"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
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
          className="flex-1 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Adding..." : added ? "Added!" : "Add to Cart"}
        </button>
      </div>
      {added && (
        <Link
          href="/cart"
          className="block rounded-full border-2 border-primary py-2.5 text-center text-sm font-medium text-primary-dark transition-colors hover:bg-primary hover:text-white"
        >
          Go to Cart
        </Link>
      )}
    </div>
  );
}

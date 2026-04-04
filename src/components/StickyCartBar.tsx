"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StickyCartBar({
  productId,
  price,
  disabled,
}: {
  productId: string;
  price: number;
  disabled?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
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
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-secondary/30 bg-cream px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center gap-3">
        <p className="text-lg font-bold text-primary-dark">
          ${price.toFixed(2)}
        </p>
        <div className="flex flex-1 gap-2">
          {added ? (
            <Link
              href="/cart"
              className="flex-1 rounded-full bg-primary py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Go to Cart
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              disabled={disabled || loading}
              className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

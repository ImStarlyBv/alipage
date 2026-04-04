"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  unitPrice: string;
  image: string;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/cart");
      return;
    }

    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status, router]);

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }
    const res = await fetch(`/api/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }

  async function removeItem(productId: string) {
    const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-foreground/50">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-foreground/50">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 divide-y divide-secondary/30">
            {items.map((item) => (
              <div
                key={`${item.productId}:${item.variantId || ""}`}
                className="flex gap-4 py-4"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-beige sm:h-20 sm:w-20">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-foreground/30">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link
                      href={`/products/${item.productId}`}
                      className="truncate text-sm font-medium text-foreground hover:text-primary-dark hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="flex-shrink-0 text-sm font-bold text-primary-dark">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-primary/30 text-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-3 py-1 transition-colors hover:bg-primary/10 rounded-l-full"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="px-3 py-1 transition-colors hover:bg-primary/10 rounded-r-full"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-primary-dark transition-colors hover:text-primary hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-beige p-4">
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Subtotal</span>
              <span className="text-primary-dark">${subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-foreground/50">
              Shipping calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-4 block rounded-full bg-primary py-3 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

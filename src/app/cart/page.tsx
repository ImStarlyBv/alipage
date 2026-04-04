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
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 divide-y">
            {items.map((item) => (
              <div
                key={`${item.productId}:${item.variantId || ""}`}
                className="flex gap-4 py-4"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded border text-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-2 py-1 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="px-2 py-1 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Shipping calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-4 block rounded bg-black py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="mt-4 text-2xl font-bold">Order Confirmed!</h1>
      <p className="mt-2 text-gray-600">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {orderId && (
        <p className="mt-3 text-sm text-gray-500">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId && (
          <Link
            href={`/account/orders/${orderId}`}
            className="rounded bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            View Order
          </Link>
        )}
        <Link
          href="/products"
          className="rounded border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

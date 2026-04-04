"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState } from "react";

interface ShippingAddress {
  full_name: string;
  phone_country: string;
  mobile_no: string;
  address: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

interface PayPalCheckoutButtonsProps {
  /** Called when payment completes successfully */
  onSuccess?: (orderId: string) => void;
  /** Called when payment is cancelled */
  onCancel?: () => void;
  /** Called on error */
  onError?: (error: string) => void;
  disabled?: boolean;
  /** Shipping address to send with capture */
  shippingAddress?: ShippingAddress;
}

export default function PayPalCheckoutButtons({
  onSuccess,
  onCancel,
  onError,
  disabled = false,
  shippingAddress,
}: PayPalCheckoutButtonsProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="animate-pulse h-12 bg-gray-200 rounded-md" />
    );
  }

  return (
    <div>
      <PayPalButtons
        disabled={disabled}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
        createOrder={async () => {
          setErrorMessage(null);
          const res = await fetch("/api/checkout/create", { method: "POST" });
          const data = await res.json();
          if (!res.ok) {
            const msg = data.error || "Failed to create order";
            setErrorMessage(msg);
            throw new Error(msg);
          }
          return data.paypalOrderId;
        }}
        onApprove={async (data) => {
          setErrorMessage(null);
          const res = await fetch("/api/checkout/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paypalOrderId: data.orderID,
              shippingAddress,
            }),
          });
          const result = await res.json();
          if (!res.ok) {
            const msg = result.error || "Payment capture failed";
            // INSTRUMENT_DECLINED: buyer should retry with another payment method
            if (result.code === "INSTRUMENT_DECLINED") {
              setErrorMessage(
                "Payment was declined. Please try a different payment method."
              );
              // Returning from onApprove restarts the PayPal flow
              return;
            }
            setErrorMessage(msg);
            onError?.(msg);
            return;
          }
          onSuccess?.(result.orderId);
        }}
        onCancel={() => {
          setErrorMessage(null);
          onCancel?.();
        }}
        onError={(err) => {
          const msg =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setErrorMessage(msg);
          onError?.(msg);
        }}
      />
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

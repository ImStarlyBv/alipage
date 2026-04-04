"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import PayPalProvider from "@/components/paypal/PayPalProvider";
import PayPalCheckoutButtons from "@/components/paypal/PayPalCheckoutButtons";

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  unitPrice: string;
  image: string;
}

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

const COUNTRIES = [
  { code: "US", name: "United States", phone: "+1" },
  { code: "CA", name: "Canada", phone: "+1" },
  { code: "GB", name: "United Kingdom", phone: "+44" },
  { code: "DE", name: "Germany", phone: "+49" },
  { code: "FR", name: "France", phone: "+33" },
  { code: "ES", name: "Spain", phone: "+34" },
  { code: "IT", name: "Italy", phone: "+39" },
  { code: "PT", name: "Portugal", phone: "+351" },
  { code: "NL", name: "Netherlands", phone: "+31" },
  { code: "BE", name: "Belgium", phone: "+32" },
  { code: "AT", name: "Austria", phone: "+43" },
  { code: "CH", name: "Switzerland", phone: "+41" },
  { code: "SE", name: "Sweden", phone: "+46" },
  { code: "NO", name: "Norway", phone: "+47" },
  { code: "DK", name: "Denmark", phone: "+45" },
  { code: "FI", name: "Finland", phone: "+358" },
  { code: "IE", name: "Ireland", phone: "+353" },
  { code: "PL", name: "Poland", phone: "+48" },
  { code: "CZ", name: "Czech Republic", phone: "+420" },
  { code: "RO", name: "Romania", phone: "+40" },
  { code: "HU", name: "Hungary", phone: "+36" },
  { code: "GR", name: "Greece", phone: "+30" },
  { code: "AU", name: "Australia", phone: "+61" },
  { code: "NZ", name: "New Zealand", phone: "+64" },
  { code: "JP", name: "Japan", phone: "+81" },
  { code: "KR", name: "South Korea", phone: "+82" },
  { code: "SG", name: "Singapore", phone: "+65" },
  { code: "MY", name: "Malaysia", phone: "+60" },
  { code: "TH", name: "Thailand", phone: "+66" },
  { code: "PH", name: "Philippines", phone: "+63" },
  { code: "ID", name: "Indonesia", phone: "+62" },
  { code: "VN", name: "Vietnam", phone: "+84" },
  { code: "IN", name: "India", phone: "+91" },
  { code: "AE", name: "United Arab Emirates", phone: "+971" },
  { code: "SA", name: "Saudi Arabia", phone: "+966" },
  { code: "IL", name: "Israel", phone: "+972" },
  { code: "TR", name: "Turkey", phone: "+90" },
  { code: "RU", name: "Russia", phone: "+7" },
  { code: "UA", name: "Ukraine", phone: "+380" },
  { code: "BR", name: "Brazil", phone: "+55" },
  { code: "MX", name: "Mexico", phone: "+52" },
  { code: "AR", name: "Argentina", phone: "+54" },
  { code: "CO", name: "Colombia", phone: "+57" },
  { code: "CL", name: "Chile", phone: "+56" },
  { code: "PE", name: "Peru", phone: "+51" },
  { code: "DO", name: "Dominican Republic", phone: "+1" },
  { code: "PR", name: "Puerto Rico", phone: "+1" },
  { code: "ZA", name: "South Africa", phone: "+27" },
  { code: "NG", name: "Nigeria", phone: "+234" },
  { code: "EG", name: "Egypt", phone: "+20" },
  { code: "KE", name: "Kenya", phone: "+254" },
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: "",
    phone_country: "",
    mobile_no: "",
    address: "",
    city: "",
    province: "",
    country: "",
    zip: "",
  });
  const [addressValid, setAddressValid] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }

    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        const cartItems = data.items || [];
        if (cartItems.length === 0) {
          router.push("/cart");
          return;
        }
        setItems(cartItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status, router]);

  function updateAddress(field: keyof ShippingAddress, value: string) {
    const updated = { ...shippingAddress, [field]: value };
    setShippingAddress(updated);
    const required: (keyof ShippingAddress)[] = [
      "full_name",
      "mobile_no",
      "address",
      "city",
      "country",
      "zip",
    ];
    setAddressValid(required.every((k) => updated[k].trim().length > 0));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );

  if (loading || status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {/* Order summary */}
      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="mt-3 divide-y">
          {items.map((item) => (
            <div
              key={`${item.productId}:${item.variantId || ""}`}
              className="flex items-center gap-3 py-3"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold">
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t pt-3 text-right">
          <p className="text-lg font-bold">Total: ${subtotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Shipping address */}
      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              value={shippingAddress.full_name}
              onChange={(e) => updateAddress("full_name", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Street Address *
            </label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) => updateAddress("address", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => updateAddress("city", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State / Province
            </label>
            <input
              type="text"
              value={shippingAddress.province}
              onChange={(e) => updateAddress("province", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ZIP / Postal Code *
            </label>
            <input
              type="text"
              value={shippingAddress.zip}
              onChange={(e) => updateAddress("zip", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country *
            </label>
            <select
              value={shippingAddress.country}
              onChange={(e) => {
                const code = e.target.value;
                const match = COUNTRIES.find((c) => c.code === code);
                const updated = { ...shippingAddress, country: code, phone_country: match?.phone || shippingAddress.phone_country };
                setShippingAddress(updated);
                const required: (keyof ShippingAddress)[] = ["full_name", "mobile_no", "address", "city", "country", "zip"];
                setAddressValid(required.every((k) => updated[k].trim().length > 0));
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Country Code
            </label>
            <input
              type="text"
              value={shippingAddress.phone_country}
              onChange={(e) => updateAddress("phone_country", e.target.value)}
              placeholder="e.g. +1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="text"
              value={shippingAddress.mobile_no}
              onChange={(e) => updateAddress("mobile_no", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* PayPal payment */}
      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Payment</h2>
        {!addressValid && (
          <p className="mt-1 text-sm text-amber-600">
            Please fill in all required shipping fields before paying.
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Complete your purchase using PayPal.
        </p>
        <div className="mt-4">
          <PayPalProvider>
            <PayPalCheckoutButtons
              disabled={!addressValid}
              shippingAddress={shippingAddress}
              onSuccess={(orderId) => {
                router.push(`/checkout/confirmation?orderId=${orderId}`);
              }}
              onCancel={() => {
                router.push("/cart");
              }}
            />
          </PayPalProvider>
        </div>
      </div>
    </div>
  );
}

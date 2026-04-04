import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/products" className="hover:text-black">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-black">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/auth/login" className="hover:text-black">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-black">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <span className="text-gray-400">Contact Us</span>
              </li>
              <li>
                <span className="text-gray-400">Shipping Info</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Store</h3>
            <p className="mt-3 text-sm text-gray-600">
              Quality products at great prices, shipped worldwide.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

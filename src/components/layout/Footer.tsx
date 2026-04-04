import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition-colors hover:text-white">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/auth/login" className="transition-colors hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="transition-colors hover:text-white">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <span className="text-white/40">Contact Us</span>
              </li>
              <li>
                <span className="text-white/40">Shipping Info</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Clevver</h3>
            <p className="mt-3 text-sm text-white/70">
              Quality products at great prices, shipped worldwide.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-6 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} Clevver. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

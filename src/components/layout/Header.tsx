"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || [];
        setCartCount(
          items.reduce(
            (sum: number, i: { quantity: number }) => sum + i.quantity,
            0
          )
        );
      })
      .catch(() => {});
  }, [session]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Store
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/products" className="hover:text-gray-600">
            Products
          </Link>
          <Link href="/categories" className="hover:text-gray-600">
            Categories
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <Link href="/cart" className="relative hover:text-gray-600">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/account/orders" className="hover:text-gray-600">
                Orders
              </Link>
              {(session.user as { role?: string }).role === "ADMIN" && (
                <Link href="/admin" className="font-medium hover:text-gray-600">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-gray-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-gray-600">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded bg-black px-3 py-1.5 text-white hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-gray-100 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="hover:text-gray-600"
            >
              Products
            </Link>
            <Link
              href="/categories"
              onClick={() => setMenuOpen(false)}
              className="hover:text-gray-600"
            >
              Categories
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

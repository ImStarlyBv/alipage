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
    <header className="sticky top-0 z-50 border-b border-secondary/40 bg-cream shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary-dark">
          Clevver
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/products" className="text-foreground/70 transition-colors hover:text-primary-dark">
            Products
          </Link>
          <Link href="/categories" className="text-foreground/70 transition-colors hover:text-primary-dark">
            Categories
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <Link href="/cart" className="relative text-foreground/70 transition-colors hover:text-primary-dark">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/account/orders" className="text-foreground/70 transition-colors hover:text-primary-dark">
                Orders
              </Link>
              {(session.user as { role?: string }).role === "ADMIN" && (
                <Link href="/admin" className="font-medium text-foreground/70 transition-colors hover:text-primary-dark">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-foreground/70 transition-colors hover:text-primary-dark"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-foreground/70 transition-colors hover:text-primary-dark">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-primary px-4 py-1.5 text-white transition-colors hover:bg-primary-dark"
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
        <nav className="border-t border-secondary/30 bg-beige px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="text-foreground/70 transition-colors hover:text-primary-dark"
            >
              Products
            </Link>
            <Link
              href="/categories"
              onClick={() => setMenuOpen(false)}
              className="text-foreground/70 transition-colors hover:text-primary-dark"
            >
              Categories
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

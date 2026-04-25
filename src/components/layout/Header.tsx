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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        {/* Logo */}
        <Link href="/" className="font-heading text-xl font-bold tracking-tight text-primary-dark md:text-2xl">
          Kitty Control
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

        {/* Right side - desktop */}
        <div className="hidden items-center gap-4 text-sm md:flex">
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
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-3 md:hidden">
          {session?.user && (
            <Link href="/cart" className="relative text-foreground/70">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
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
        <nav className="border-t border-secondary/30 bg-beige px-4 py-4 md:hidden">
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

            {session?.user ? (
              <>
                <div className="border-t border-secondary/30 pt-3" />
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="text-foreground/70 transition-colors hover:text-primary-dark"
                >
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMenuOpen(false)}
                  className="text-foreground/70 transition-colors hover:text-primary-dark"
                >
                  My Orders
                </Link>
                {(session.user as { role?: string }).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="font-medium text-foreground/70 transition-colors hover:text-primary-dark"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-left text-foreground/70 transition-colors hover:text-primary-dark"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-secondary/30 pt-3" />
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-foreground/70 transition-colors hover:text-primary-dark"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block w-full rounded-full bg-primary py-2 text-center text-white transition-colors hover:bg-primary-dark"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }
    if ((session.user as { role?: string }).role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (
    status === "loading" ||
    !session?.user ||
    (session.user as { role?: string }).role !== "ADMIN"
  ) {
    return (
      <div className="p-8 text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center gap-6 border-b pb-4">
        <h1 className="text-xl font-bold">Admin</h1>
        <nav className="flex gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-black ${
                pathname === item.href
                  ? "font-semibold text-black"
                  : "text-gray-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

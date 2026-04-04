"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?categoryId=${cat.id}`}
          className="rounded-full bg-beige px-3 py-1 text-sm text-foreground/70 transition-colors hover:bg-primary hover:text-white"
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}

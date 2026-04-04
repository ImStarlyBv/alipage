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
          className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:border-black hover:bg-black hover:text-white transition-colors"
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}

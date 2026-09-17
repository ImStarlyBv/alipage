import ProductCard from "./ProductCard";

interface GridProduct {
  id: string;
  slug: string;
  title: string;
  images: unknown;
  salePrice: unknown;
  stock: number;
}

interface ProductGridProps {
  products: readonly GridProduct[];
  emptyMessage?: string;
}

/**
 * The grid class string, LCP `priority` count and empty state, extracted so
 * `/products` and every collection page render products identically rather
 * than re-deriving "first 4 cards are priority" per caller.
 */
export default function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <p className="mt-12 text-center text-foreground/50">{emptyMessage}</p>;
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}

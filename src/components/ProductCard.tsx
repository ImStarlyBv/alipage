import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    images: unknown;
    salePrice: unknown;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const images = product.images as string[];
  const price = Number(product.salePrice);
  const image = images?.[0] || "";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md hover:shadow-secondary/30"
    >
      <div className="relative aspect-square bg-beige">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground/30">
            No image
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm">
          {product.title}
        </h3>
        <p className="mt-1 text-xs font-bold text-primary-dark sm:text-sm">
          ${price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

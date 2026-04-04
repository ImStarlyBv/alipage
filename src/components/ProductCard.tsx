import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
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
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-white px-2 py-1 text-xs font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium">{product.title}</h3>
        <p className="mt-1 text-sm font-bold">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
}

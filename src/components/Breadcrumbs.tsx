import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

/**
 * The visible trail that backs `BreadcrumbList` schema. Structured data with
 * no matching on-page trail is a violation Google can act on, so one `items`
 * array — passed to this and to `BreadcrumbJsonLd` — drives both.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-4 text-xs text-foreground/50 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.url} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {isLast ? (
                <span className="font-medium text-foreground/70" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="transition-colors hover:text-primary-dark">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

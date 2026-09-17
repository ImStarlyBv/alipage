// PATCH /api/admin/products/[id]/rename — Update a product's title, and
// optionally its URL slug.
//
// A title change never moves the URL: `slug` is stored independently of the
// title, so rewriting copy for SEO leaves the indexed URL exactly where it was.
// That is the whole point of storing it — previously the slug was derived from
// the title on every request, so a rename silently 404'd the old URL.
//
// Moving a product to a different URL is a separate, deliberate act: send
// `slug`. The slug it moves off is recorded in ProductSlugRedirect, so the old
// URL 308s to the new one instead of 404ing.
import { prisma } from "@/lib/models";
import { handleApiError } from "@/lib/utils/api-error";
import { slugifyTitle } from "@/lib/utils/product-slugs";
import { revalidatePath } from "next/cache";

type RenameOutcome =
  | { status: "updated"; product: ProductSummary; movedFrom: string | null }
  | { status: "not-found" }
  | { status: "slug-taken" };

type ProductSummary = {
  id: string;
  title: string;
  slug: string | null;
  aliexpressId: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const title = payload.title;
  const changesSlug = payload.slug !== undefined;

  if (typeof title !== "string" || title.trim().length === 0) {
    return Response.json({ error: "title is required and must be a non-empty string" }, { status: 400 });
  }

  if (changesSlug && typeof payload.slug !== "string") {
    return Response.json({ error: "slug must be a string when provided" }, { status: 400 });
  }

  // Normalised rather than trusted, so a caller can't write a slug that isn't a
  // valid URL path segment.
  const requestedSlug = changesSlug ? slugifyTitle(payload.slug as string) : null;

  try {
    const outcome: RenameOutcome = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });

      if (!product) return { status: "not-found" };

      const isMoving = !!requestedSlug && requestedSlug !== product.slug;
      let movedFrom: string | null = null;

      if (isMoving) {
        // `id` is in the OR because a slug must not shadow another product's id
        // URL — resolveProductId checks both namespaces.
        const clash = await tx.product.findFirst({
          where: {
            OR: [{ slug: requestedSlug }, { id: requestedSlug }],
            NOT: { id },
          },
          select: { id: true },
        });
        if (clash) return { status: "slug-taken" };

        // A redirect already on this slug belongs to another product, whose old
        // URL would be hijacked by claiming it.
        const claimed = await tx.productSlugRedirect.findUnique({
          where: { fromSlug: requestedSlug },
          select: { productId: true },
        });
        if (claimed && claimed.productId !== id) return { status: "slug-taken" };

        if (product.slug) {
          await tx.productSlugRedirect.upsert({
            where: { fromSlug: product.slug },
            create: { fromSlug: product.slug, productId: id },
            update: { productId: id },
          });
          movedFrom = product.slug;
        }
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          title: title.trim(),
          ...(isMoving ? { slug: requestedSlug } : {}),
        },
        select: { id: true, title: true, slug: true, aliexpressId: true },
      });

      return { status: "updated", product: updated, movedFrom };
    });

    if (outcome.status === "not-found") {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    if (outcome.status === "slug-taken") {
      return Response.json(
        { error: "That slug is already in use by another product" },
        { status: 409 }
      );
    }

    // The home page and PDP are ISR and render product titles/links, so they'd
    // otherwise advertise the old copy — and, after a move, the old URL.
    revalidatePath("/");
    const currentSlug = outcome.product.slug ?? outcome.product.id;
    revalidatePath(`/products/${currentSlug}`);
    if (outcome.movedFrom) {
      revalidatePath(`/products/${outcome.movedFrom}`);
    }
    // A single call against the dynamic segment's own pattern invalidates
    // every collection page at once — no need to derive which of the 4 (8
    // after Phase 2) collections this product actually sits in. `type` is
    // required here because the path is the route's literal pattern, not a
    // resolved URL.
    revalidatePath("/[collection]", "page");

    return Response.json({
      product: outcome.product,
      movedFrom: outcome.movedFrom,
    });
  } catch (err) {
    return handleApiError(err, `PATCH /api/admin/products/${id}/rename`);
  }
}

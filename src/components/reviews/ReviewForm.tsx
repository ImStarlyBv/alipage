"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

/**
 * Review submission form. Shown on the product page. The server enforces the
 * verified-purchase rule — this is the convenience UI for buyers.
 */
export default function ReviewForm({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <p className="text-sm text-foreground/60">
        <Link
          href={`/auth/login?callbackUrl=/products/${slug}`}
          className="font-medium text-primary-dark hover:underline"
        >
          Sign in
        </Link>{" "}
        to review this product. Only verified buyers can leave a review.
      </p>
    );
  }

  if (done) {
    return (
      <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary-dark">
        Thanks! Your review has been posted.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, title: title || undefined, body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not submit your review.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-secondary/30 bg-white p-4">
      <p className="font-heading text-base font-semibold text-foreground">
        Write a review
      </p>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={rating === n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`text-2xl leading-none transition-colors ${
              n <= (hover || rating) ? "text-amber-500" : "text-secondary/40"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder="Title (optional)"
        className="w-full rounded-lg border border-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        minLength={10}
        maxLength={2000}
        rows={4}
        placeholder="How did this fit your cat? What did you think of the fabric and warmth?"
        className="w-full rounded-lg border border-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}

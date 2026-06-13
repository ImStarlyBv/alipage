// Custom next/image loader.
//
// AliExpress (alicdn) images are huge originals, and in `output: "standalone"`
// every <Image> would otherwise be proxied through our Node server's runtime
// optimizer (download original from alicdn → re-encode with sharp on each cold
// request) — slow on a small host with no persistent image cache.
//
// alicdn's own CDN resizes on demand: appending `_<w>x<h>.jpg` to the image URL
// returns a correctly-sized image (served as WebP via content negotiation)
// straight from Alibaba's global CDN. So for alicdn we build that URL directly
// and skip our server entirely. Everything else is returned untouched.

const ALICDN_RE = /(^https?:\/\/[^?]*?\.(?:jpe?g|png|webp|gif))/i;

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (/alicdn\.com|aliexpress\.com/i.test(src)) {
    // Strip any pre-existing `_NxN.jpg_.webp` resize tail / query string, then
    // append the size token for the width next/image asked for.
    const match = src.match(ALICDN_RE);
    const base = match ? match[1] : src;
    return `${base}_${width}x${width}.jpg`;
  }

  // Non-alicdn (e.g. images.kittycontrol.shop): serve as-is.
  return src;
}

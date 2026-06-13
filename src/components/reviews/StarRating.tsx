/** Presentational star rating. Renders accessible filled/empty stars. */
export default function StarRating({
  value,
  size = "text-base",
}: {
  value: number;
  size?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={`inline-flex text-amber-500 ${size}`}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={n <= rounded ? "" : "text-secondary/40"}>
          ★
        </span>
      ))}
    </span>
  );
}

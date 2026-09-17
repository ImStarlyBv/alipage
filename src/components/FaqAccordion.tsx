export interface FaqAccordionItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: readonly FaqAccordionItem[];
  /** Groups the accordion so opening one closes the others. Omit for independent items. */
  name?: string;
}

/**
 * Native `<details>` accordion, extracted from the homepage FAQ section so
 * collection pages can reuse the exact same markup/behaviour rather than a
 * second hand-rolled copy.
 */
export default function FaqAccordion({ items, name }: FaqAccordionProps) {
  return (
    <div className="mt-8 space-y-4">
      {items.map((item, i) => (
        <details
          key={i}
          name={name}
          className="group rounded-xl border border-secondary/30 bg-white p-5 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-3 font-heading text-base font-semibold text-foreground sm:text-lg">
            {item.question}
            <span
              aria-hidden="true"
              className="text-primary-dark transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-foreground/60 sm:text-base">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";

interface DescriptionGalleryProps {
  html: string;
}

export default function DescriptionGallery({ html }: DescriptionGalleryProps) {
  const { images, textHtml } = useMemo(() => {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const extractedImages: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      extractedImages.push(match[1]);
    }

    // Remove img tags from HTML to get text-only content
    const cleanedHtml = html
      .replace(/<img[^>]*>/gi, "")
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "<br/>")
      .trim();

    const sanitized = DOMPurify.sanitize(cleanedHtml, {
      ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "ul", "ol", "li", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "a", "table", "tr", "td", "th", "tbody", "thead"],
      ALLOWED_ATTR: ["href", "target", "rel", "style"],
    });

    return { images: extractedImages, textHtml: sanitized };
  }, [html]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Text content */}
      {textHtml && textHtml.replace(/<[^>]*>/g, "").trim().length > 0 && (
        <div
          className="prose prose-sm max-w-none overflow-hidden break-words text-foreground/70 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />
      )}

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg bg-beige shadow-sm sm:rounded-xl"
            >
              <Image
                src={src}
                alt={`Product detail ${i + 1}`}
                width={600}
                height={600}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

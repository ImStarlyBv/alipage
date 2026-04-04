"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-beige text-foreground/30">
        No image
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-xl bg-beige">
        <Image
          src={images[activeIndex]}
          alt={`${alt} ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={activeIndex === 0}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Next image"
            >
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === activeIndex
                    ? "bg-primary w-4"
                    : "bg-white/70 hover:bg-white"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                i === activeIndex
                  ? "ring-2 ring-primary ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Chevron } from "./layout";

/**
 * One slide at a time, with dots and arrows.
 *
 * The track is a real scroller rather than a transform, so a trackpad swipe
 * works without any of its own gesture handling, and scroll-snap does the
 * settling. The arrows just scroll it — which keeps the button state and the
 * scroll position from ever disagreeing about which slide is showing.
 */
export function Carousel({
  slides,
  label,
}: {
  slides: ReactNode[];
  /** Names the region for screen readers, e.g. the section heading. */
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const id = useId();

  const go = (next: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    // Measure a real slide rather than assuming the track width: the gap
    // between slides means the two are never the same number.
    const slide = el.children[clamped] as HTMLElement | undefined;
    if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft });
    setIndex(clamped);
  };

  /** Whichever slide is nearest the left edge is the one being read. */
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    let nearest = 0;
    let best = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const distance = Math.abs(
        (child as HTMLElement).offsetLeft - el.offsetLeft - el.scrollLeft,
      );
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setIndex(nearest);
  };

  return (
    <section aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            id={`${id}-slide-${i}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className="w-full shrink-0 snap-start"
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              aria-controls={`${id}-slide-${i}`}
              onClick={() => go(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                i === index
                  ? "w-4 bg-neutral-900"
                  : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Arrow
            label="Previous slide"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            back
          />
          <Arrow
            label="Next slide"
            disabled={index === slides.length - 1}
            onClick={() => go(index + 1)}
          />
        </div>
      </div>
    </section>
  );
}

function Arrow({
  label,
  onClick,
  disabled,
  back = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  back?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#ebebeb] bg-white text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-default disabled:text-neutral-200 disabled:hover:text-neutral-200"
    >
      <Chevron className={`h-3 w-3 ${back ? "rotate-180" : ""}`} />
    </button>
  );
}

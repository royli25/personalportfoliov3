"use client";

import { useEffect, useState } from "react";

/**
 * The section rail: a table of contents drawn as tick marks down the right
 * edge. The tick for the section you're reading grows and darkens, and its
 * label sits beside it; the rest of the labels stay hidden until you hover the
 * rail, so the contents never compete with the prose for attention.
 */
export function SectionRail({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      // The section that most recently crossed the upper third of the viewport
      // is the one being read. Measuring against the very top instead would
      // advance the marker a beat before the heading is even legible.
      const line = window.innerHeight / 3;
      let next = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) next = i;
      });
      setActive(next);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Deliberately not a synchronous first measure: on a reload the browser
    // restores scroll position *after* mount and without firing a scroll
    // event, so measuring now would mark section one active halfway down the
    // page. Wait for paint, and keep `load` as a backstop for a late restore.
    onScroll();
    /*
      Captured on the document rather than bound to the window: the study
      scrolls the window on its own route, but an inner element inside the
      case-study panel. Scroll events don't bubble, so a window listener never
      hears the panel — the capture phase hears both, with no wiring either way.
    */
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", onScroll);
    // A hidden page runs no animation frames, so a tab restored part-way down
    // would keep showing whichever tick was current when it was backgrounded.
    document.addEventListener("visibilitychange", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
      document.removeEventListener("visibilitychange", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  // One tick is not a table of contents.
  if (items.length < 2) return null;

  /**
   * Ticks taper in length and weight with their distance from the section
   * you're in, so the rail reads as a wave cresting at your place in the page
   * rather than as a list with one item ticked. Both settle onto a floor a few
   * steps out — a linear run to zero would leave the far ends invisible.
   */
  const tick = (distance: number) => ({
    width: `${Math.max(14, 32 - distance * 4)}px`,
    opacity: distance === 0 ? 1 : Math.max(0.22, 0.42 - distance * 0.045),
  });

  return (
    <nav
      aria-label="Sections"
      /*
        Mounted outside the reveal tree on purpose: `.reveal` animates
        transform, which would make it the containing block for anything fixed
        inside it and pin the rail to the section instead of the viewport.
        Hidden below xl, where the labels would run into the reading column.
      */
      className="group fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 flex-col items-start gap-2.5 xl:flex"
    >
      {items.map((item, i) => {
        const current = i === active;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={current ? "true" : undefined}
            // Smooth scrolling is set on <html>, and dropped there under
            // prefers-reduced-motion — so this inherits that preference.
            onClick={() => document.getElementById(item.id)?.scrollIntoView()}
            className="group/tick flex cursor-pointer items-center gap-2.5 leading-none"
          >
            {/* Fixed slot: the ticks vary in length, the labels still line up. */}
            <span aria-hidden="true" className="flex w-8">
              <span
                style={tick(Math.abs(i - active))}
                className="h-0.5 rounded-full bg-neutral-900 transition-all duration-300 group-hover/tick:opacity-100"
              />
            </span>
            <span
              className={`font-sans text-[10px] leading-none tracking-wide whitespace-nowrap uppercase transition-all duration-300 group-hover:opacity-100 group-hover/tick:text-neutral-900 ${
                current
                  ? "text-neutral-900 opacity-100"
                  : "text-neutral-400 opacity-0"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

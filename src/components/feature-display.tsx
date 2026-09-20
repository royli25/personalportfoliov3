"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * One full-size display with the descriptors laid out beneath it.
 *
 * Replaces the old carousel: rather than paging the media, all three
 * descriptors stay on screen and selecting one swaps what the display shows.
 * The reader can compare the three without operating anything, which is the
 * whole reason the carousel went — a toggle hid two thirds of the section.
 *
 * Descriptors are real tabs, so arrow keys move between them and the display
 * is the panel they control.
 */
export function FeatureDisplay({
  items,
  label,
}: {
  items: { title: string; body: string; media: ReactNode }[];
  /** Names the region for screen readers, e.g. the section heading. */
  label: string;
}) {
  const [active, setActive] = useState(0);
  const id = useId();

  /** Arrow keys wrap, which is what the tab pattern specifies. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + items.length) % items.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <section aria-label={label}>
      {/*
        Every panel stays mounted and inactive ones are hidden, so switching
        never re-requests an image that was already loaded.
      */}
      {items.map((item, i) => (
        <div
          key={item.title}
          id={`${id}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
        >
          {item.media}
        </div>
      ))}

      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="mt-5 flex flex-col gap-4 md:flex-row"
      >
        {items.map((item, i) => (
          <button
            key={item.title}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`flex-1 cursor-pointer border-t pt-4 text-left transition-opacity duration-200 ${
              i === active
                ? "border-neutral-300 opacity-100"
                : "border-neutral-200 opacity-65 hover:opacity-100"
            }`}
          >
            <span className="block font-sans text-h2 text-neutral-900">
              {item.title}
            </span>
            <span className="mt-2 block text-p1 text-neutral-900/65">
              {item.body}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

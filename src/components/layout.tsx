"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Badge } from "./ink";
import { CONTENT_PADDING, CONTENT_SHELL, SHELL_WIDTHS, SUBTEXT } from "./tokens";

/**
 * Layout primitives.
 *
 * The page is one 920px column (`max-w-[920px]`, dead centre). Text and media
 * share the same width so headings line up with cards and screenshots below.
 */


/**
 * Fades its children up the first time they cross into view.
 *
 * Visibility is React state, not a classList mutation — an unrelated re-render
 * would otherwise reconcile a manually added class straight back off and
 * strand the section at opacity 0.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer support, or the visitor prefers less motion: show at once.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** The reading column: badge, serif heading, one paragraph of body copy. */
export function Intro({
  badge,
  badgeTone = "neutral",
  title,
  children,
  id,
}: {
  badge: string;
  badgeTone?: "neutral" | "green";
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <Reveal className="w-full">
      <div id={id} className={`${CONTENT_SHELL} scroll-mt-24`}>
        <div className="relative mt-24">
          <Badge tone={badgeTone} className="-top-7 -left-1 -rotate-3">
            {badge}
          </Badge>
          <h2 className="font-sans text-[30px] leading-9 tracking-[-0.02em] text-neutral-900">
            {title}
          </h2>
        </div>
        {children && (
          <div className={`mt-4 ${SUBTEXT}`}>
            {children}
          </div>
        )}
      </div>
    </Reveal>
  );
}

/** A media row that breaks out past the reading column. */
export function Showcase({
  children,
  className = "",
  width = "mid",
  spacing = "normal",
}: {
  children: ReactNode;
  className?: string;
  width?: "wide" | "mid" | "narrow";
  /** `media` is the 24px gap between blocks inside a case-study section. */
  spacing?: "normal" | "compact" | "media";
}) {
  const max = SHELL_WIDTHS[width];

  const top = { normal: "mt-6", compact: "mt-4", media: "mt-6" }[spacing];

  return (
    <Reveal className={`${top} w-full`} delay={80}>
      {/* Stacks below md — three 196px phones will not share a 390px viewport. */}
      <div
        className={`mx-auto flex w-full flex-col items-stretch gap-4 ${CONTENT_PADDING} md:flex-row ${max} ${className}`}
      >
        {children}
      </div>
    </Reveal>
  );
}

/** The right-aligned "see more →" affordance under a media row. */
export function MoreLink({
  children,
  href = "#",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <div className={`${CONTENT_SHELL} mt-3 flex justify-end`}>
      <a
        href={href}
        className="group inline-flex items-center gap-1 font-sans text-[11px] text-neutral-400 transition-colors hover:text-neutral-900"
      >
        {children}
        <Chevron className="h-3 w-3" />
      </a>
    </div>
  );
}

export function Chevron({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`transition-transform duration-200 group-hover:translate-x-0.5 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * The hatched card every mock sits inside.
 *
 * Deliberately unopinionated about alignment — the caller owns flex direction
 * and alignment, so the two class lists can never fight over `items-*`.
 */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`hatch flex flex-1 overflow-hidden rounded-card border border-neutral-200/80 bg-white ${className}`}
    >
      {children}
    </div>
  );
}

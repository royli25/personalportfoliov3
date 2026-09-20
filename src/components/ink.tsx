import type { ReactNode } from "react";

/**
 * Hand-drawn ink primitives.
 *
 * Every stroke is a plain SVG path pushed through a fractalNoise +
 * displacementMap filter. That wobble is the whole trick — it reads as pen on
 * paper instead of a border-bottom. The filters are declared once at the page
 * root (<InkDefs />) so each stroke only carries a filter reference.
 */

export function InkDefs() {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true">
      <defs>
        <filter id="rough" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves={2}
            seed={4}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="rough-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves={2}
            seed={11}
            result="n2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n2"
            scale="1.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

type Tone = "cyan" | "emerald" | "amber" | "rose";

const TONE: Record<Tone, string> = {
  cyan: "text-cyan-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

/** A word or phrase with a wobbling stroke swept underneath it. */
export function Underline({
  children,
  tone = "cyan",
  double = false,
}: {
  children: ReactNode;
  tone?: Tone;
  double?: boolean;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap text-neutral-950">
      {children}
      <svg
        className={`pointer-events-none absolute bottom-[-0.3em] left-[-1%] h-[0.5em] w-[102%] ${TONE[tone]}`}
        viewBox="0 0 140 12"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="ink-path"
          style={{ ["--len" as string]: 145 }}
          d="M3,6 C40,3 100,3 137,5"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          filter="url(#rough-soft)"
        />
        {double && (
          <path
            className="ink-path"
            style={{ ["--len" as string]: 140, animationDelay: "0.42s" }}
            d="M6,10 C44,8 96,8 133,9.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            filter="url(#rough)"
          />
        )}
      </svg>
    </span>
  );
}

/**
 * A highlighter swipe behind inline body text.
 *
 * The swipe is a sibling painted first, then the text sits on top via
 * `relative`. No negative z-index — that would drop the swipe behind the page
 * background instead of behind the glyphs.
 */
export function Mark({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden="true"
        className="absolute inset-x-[-3px] top-[4px] bottom-[2px] block bg-amber-200/80"
        style={{ filter: "url(#rough-soft)" }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/** A loose hand-drawn ellipse ringing a word. */
export function Circled({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap text-neutral-950">
      {children}
      <svg
        className="pointer-events-none absolute top-[-14%] left-[-6%] h-[128%] w-[112%] text-rose-300"
        viewBox="0 0 120 44"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="ink-path"
          style={{ ["--len" as string]: 300 }}
          d="M60,3 C96,3 117,11 117,22 C117,33 96,41 60,41 C24,41 3,33 3,22 C3,11 24,3 60,3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#rough)"
        />
      </svg>
    </span>
  );
}

/** The small rotated pill that floats above each section heading. */
export function Badge({
  children,
  tone = "neutral",
  className = "",
  /**
   * Defaults on so the home page keeps its caps. Opting out is a prop rather
   * than a `normal-case` override because both utilities set the same
   * property, and which one wins depends on Tailwind's output order, not on
   * the order they appear in the attribute.
   */
  uppercase = true,
}: {
  children: ReactNode;
  tone?: "neutral" | "green";
  className?: string;
  uppercase?: boolean;
}) {
  return (
    <span
      className={`absolute rounded-full border border-neutral-200 bg-white px-1.5 pt-1 pb-0.5 font-sans text-[10px] leading-none font-medium tracking-tight shadow-sm ${
        uppercase ? "uppercase" : ""
      } ${tone === "green" ? "text-emerald-600" : "text-neutral-500"} ${className}`}
    >
      {children}
    </span>
  );
}

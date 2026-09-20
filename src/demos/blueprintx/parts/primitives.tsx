import type { ReactNode } from "react";

/**
 * BlueprintX — shared primitives.
 *
 * Ported 1:1 from the Figma frame `G1 E7 + Recessed + Normal Text`
 * (file YYbMTsn9jqq4BXdSL4OMZm, node 207:79). Sizes are the canvas values,
 * so the whole set composes at the 1440×900 frame width without scaling.
 *
 * The product palette is deliberately hard-coded rather than routed through
 * the Lab tokens: this is an embedded product mock, and — like the other
 * mocks on the site — it stays light when the page flips to dark.
 *
 * Every glyph is an exported Figma asset under /public/blueprintx. Icons carry
 * their own fills, so they render as <img> and are never recoloured by CSS.
 */

/**
 * Pins the mock to its own light palette.
 *
 * The site's dark mode inverts by remapping `--color-white` and the neutral
 * ramp, which would flip this screen's cards to near-black while its
 * hard-coded product hexes stayed put. Re-declaring the variable on the mock
 * root walls it off — the same exception the other embedded shots get.
 */
export const LIGHT_SCOPE = {
  colorScheme: "light",
  "--color-white": "#ffffff",
} as React.CSSProperties;

/**
 * Electron-shell drag regions. Inert in browsers; in the frameless recording
 * window they make the chrome (sidebar, breadcrumb bar) grabbable like a real
 * title bar. Anything interactive inside a DRAG area must set NO_DRAG or its
 * clicks are eaten by the window manager.
 */
export const DRAG = { WebkitAppRegion: "drag" } as React.CSSProperties;
export const NO_DRAG = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

/** Dot colours pulled from the exported chip SVGs. */
export const TONE = {
  reach: "#a93f38",
  match: "#375c99",
  safety: "#2f7a44",
  program: "#6b4e9b",
  course: "#4c6412",
  live: "#22c55e",
} as const;

export type Tone = keyof typeof TONE;

export type IconName =
  | "logo-mark"
  | "nav-home"
  | "nav-students"
  | "nav-resources"
  | "nav-live"
  | "nav-settings"
  | "act-summarize"
  | "act-catchup"
  | "act-actions"
  | "act-questions"
  | "send"
  | "search"
  | "breadcrumb-back"
  | "chevron";

/**
 * A Figma-exported glyph at an explicit box size.
 *
 * Both axes are set on the wrapper and the image fills it; leaving either on
 * `auto` lets the SVG blow up to its intrinsic size inside a flex row.
 */
export function Icon({
  name,
  size,
  className = "",
}: {
  name: IconName;
  size: number;
  className?: string;
}) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/blueprintx/${name}.svg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
    </span>
  );
}

/** Chevron with a direction — the canvas rotates one glyph rather than shipping two. */
export function Chevron({
  direction = "down",
  size = 14,
  className = "",
}: {
  direction?: "up" | "down";
  size?: number;
  className?: string;
}) {
  return (
    <Icon
      name="chevron"
      size={size}
      className={`transition-transform duration-200 ease-in-out ${
        direction === "up" ? "rotate-180" : ""
      } ${className}`}
    />
  );
}

/**
 * macOS traffic lights. Same hexes the site's `Browser` frame uses.
 *
 * `app-region: drag` is inert in browsers but makes this row the window's
 * drag handle inside the Electron recording shell (which is frameless, so it
 * has no title bar of its own to grab).
 */
export function WindowControls() {
  return (
    <div
      className="flex h-[12px] w-[56px] items-center gap-[8px]"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

/** Status dot. A flat circle on canvas, so it stays CSS rather than an asset. */
export function Dot({ tone, size = 6 }: { tone: Tone; size?: number }) {
  return (
    <span
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, background: TONE[tone] }}
    />
  );
}

/** Stadium pill: dot + label. Used for target schools and insight types. */
export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[6px] rounded-full bg-[#f1f1ef] py-[4px] pr-[10px] pl-[8px]">
      <Dot tone={tone} />
      <span className="text-[11px] leading-[14px] font-medium whitespace-nowrap text-[#3a3a3a]">
        {children}
      </span>
    </span>
  );
}

/** The card shell every panel in the meeting column sits in. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] border border-[#e8e8e8] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Card title bar — a title on the left, whatever you pass on the right. */
export function CardHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#efefef] px-[18px] py-[14px]">
      <p className="text-[14px] leading-[20px] font-medium text-[#1a1a1a]">
        {title}
      </p>
      {children ? (
        <div className="flex items-center gap-[10px]">{children}</div>
      ) : null}
    </div>
  );
}

/** A whole card collapsed to its title row — "Academic Transcript", "Notes". */
export function CollapsedCard({ title }: { title: string }) {
  return (
    <Card className="flex h-[54px] w-full shrink-0 items-center justify-between px-[18px]">
      <p className="text-[14px] leading-[20px] font-medium text-[#1a1a1a]">
        {title}
      </p>
      <Chevron />
    </Card>
  );
}

/** Recording state, top right of the transcript card. */
export function LivePill({ elapsed }: { elapsed: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-[6px] bg-[#edf9f1] py-[5px] pr-[10px] pl-[9px]">
      <Dot tone="live" />
      <span className="text-[12px] leading-[16px] font-medium whitespace-nowrap text-[#2f7a44]">
        Live · {elapsed}
      </span>
    </span>
  );
}

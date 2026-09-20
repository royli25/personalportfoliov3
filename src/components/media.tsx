import type { ReactNode } from "react";

/**
 * Media placeholders and device frames.
 *
 * Every image slot on the page is a <Filler />. Swap one for an <Image /> when
 * you have the real asset — the frames handle their own rounding and cropping,
 * so a raw screenshot dropped in will sit correctly without extra classes.
 */

/** A labelled blank standing in for artwork you haven't dropped in yet. */
export function Filler({
  label,
  ratio,
  className = "",
  rounded = "rounded-card",
  tone = "light",
}: {
  label: string;
  /** e.g. "16 / 10". Omit when the parent already fixes the height. */
  ratio?: string;
  className?: string;
  rounded?: string;
  /** `dark` places the same filler inside the shell's dark panes. */
  tone?: "light" | "dark";
}) {
  const skin =
    tone === "dark"
      ? "border-shell-line bg-shell-raised"
      : "border-neutral-300 bg-neutral-100/70";
  const ink = tone === "dark" ? "text-shell-faint" : "text-neutral-400";

  return (
    <div
      data-filler=""
      className={`flex w-full items-center justify-center border border-dashed ${skin} ${rounded} ${className}`}
      style={{
        aspectRatio: ratio,
        animation: "shimmer 4s ease-in-out infinite",
      }}
    >
      <div className="flex flex-col items-center gap-1.5 px-3 text-center">
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${ink}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.6" />
          <path d="m21 15-4.5-4.5L7 21" />
        </svg>
        <span className={`font-sans text-[9px] tracking-tight ${ink}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * iPhone-style frame. Sits flush to the bottom of its card and crops off,
 * the way the reference does — you never see the chin.
 */
export function Phone({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-[196px] shrink-0 ${className}`}>
      {/* hardware buttons */}
      <div className="absolute -left-[3px] top-[86px] h-9 w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -left-[3px] top-[132px] h-14 w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -right-[3px] top-[112px] h-16 w-[3px] rounded-r-sm bg-neutral-700" />

      {/* titanium band */}
      <div className="rounded-t-[36px] bg-gradient-to-b from-neutral-700 via-neutral-900 to-neutral-800 p-[3px] pb-0 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]">
        <div className="rounded-t-[33px] bg-black p-[6px] pb-0">
          <div className="relative h-[330px] overflow-hidden rounded-t-[28px] bg-white">
            {/* dynamic island */}
            <div className="absolute top-2 left-1/2 z-20 h-[22px] w-[68px] -translate-x-1/2 rounded-full bg-black" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Desktop browser chrome. `tone` swaps the toolbar between light and dark. */
export function Browser({
  url,
  tone = "light",
  children,
  className = "",
}: {
  url: string;
  tone?: "light" | "dark";
  children: ReactNode;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`w-full overflow-hidden rounded-card border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] ${
        dark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-neutral-100"
      } ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex gap-[5px]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#ff5f57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#febc2e]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#28c840]" />
        </div>
        <div
          className={`ml-2 flex-1 truncate rounded-chip px-2.5 py-1 font-sans text-[10px] ${
            dark
              ? "bg-neutral-800 text-neutral-400"
              : "bg-white text-neutral-400 shadow-sm"
          }`}
        >
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

/**
 * Laptop — a wide frame for landscape shots.
 *
 * The base is deliberately wider than the lid and sits under it, which is what
 * sells the silhouette; a lid-width base reads as a picture frame instead.
 */
export function Laptop({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      {/* lid */}
      <div className="mx-auto w-[92%] rounded-t-[10px] bg-gradient-to-b from-neutral-600 to-neutral-800 p-[5px] pb-0 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
        <div className="overflow-hidden rounded-t-[6px] bg-black p-[3px] pb-0">
          <div className="overflow-hidden rounded-t-[4px] bg-white">
            {children}
          </div>
        </div>
      </div>

      {/* base: a thin deck, then the front lip */}
      <div className="relative h-[9px] w-full rounded-b-[6px] bg-gradient-to-b from-neutral-300 to-neutral-400">
        <span className="absolute top-0 left-1/2 h-[3px] w-20 -translate-x-1/2 rounded-b-full bg-neutral-500/50" />
      </div>
      <div className="mx-auto h-[3px] w-[97%] rounded-b-[4px] bg-neutral-400/40" />
    </div>
  );
}

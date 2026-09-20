/**
 * Layout tokens.
 *
 * Plain module on purpose — page.tsx (a Server Component) interpolates these
 * into template literals, and constants exported from a "use client" module
 * arrive there as client-reference proxies that stringify into error text.
 */

export const CONTENT_PADDING = "px-4 md:px-0";

/** Column width variants: case studies = narrow, prose/media = mid, breakout rows = wide. */
export const SHELL_WIDTHS = {
  narrow: "max-w-[760px]",
  mid: "max-w-[920px]",
  wide: "max-w-[1100px]",
} as const;

export function shell(width: keyof typeof SHELL_WIDTHS = "mid") {
  return `mx-auto w-full ${SHELL_WIDTHS[width]} ${CONTENT_PADDING}`;
}

/** Shared page column — matches Showcase `mid`. */
export const CONTENT_SHELL = shell("mid");

/** Body copy under headings — muted, but readable in light and dark. */
export const SUBTEXT = "text-[17px] leading-7 text-neutral-500";

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * Text that resolves out of noise when it changes.
 *
 * The hero swaps with the section beside it, and a straight replacement reads
 * as a page reload. Characters settle left to right while the unsettled ones
 * cycle — the copy arrives rather than appearing.
 *
 * Two rules keep it from being a gimmick:
 *
 * - **The noise is the text's own alphabet.** Random symbols would change the
 *   pixel width of every word and re-wrap the headline on every frame; drawing
 *   from the same characters keeps the words about as wide as they will end up,
 *   so the block holds still. It also stays in the site's voice — this reads as
 *   decoding, not as a terminal.
 * - **Never on the first paint.** The first hero on screen is the seeded page,
 *   not a change the user made, so it renders settled. The shell says when the
 *   page is past that point through `ScrambleReady`, rather than this module
 *   keeping a flag: module state lives across requests on the server, and it
 *   would also be spent by StrictMode's double-invoke in development, so the
 *   effect could never be trusted to run when it mattered.
 */

const FRAME_MS = 34; // ~29fps — cycling at 60 reads as static, not as motion
const FRAMES = 13; // ≈440ms end to end

/**
 * False until the shell has painted once. Provided by home-shell; a hero
 * rendered outside a provider simply never scrambles, which is the safe default
 * for anywhere else this gets used.
 */
export const ScrambleReady = createContext(false);

/** Layout effect on the client, plain effect during SSR (where it can't run). */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function scrambled(chars: string[], alphabet: string, revealAt: number[], frame: number) {
  return chars
    .map((c, i) =>
      frame >= revealAt[i]
        ? c
        : alphabet[Math.floor(Math.random() * alphabet.length)],
    )
    .join("");
}

export function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ready = useContext(ScrambleReady);
  const [shown, setShown] = useState(text);
  const timer = useRef<number>(undefined);

  useIsoLayoutEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = [...text];
    const alphabet = [...new Set(chars)].filter((c) => c.trim()).join("");
    if (!alphabet) return;

    /* Whitespace never scrambles — the word shapes, and so the line breaks,
       stay put. The rest resolves in a left-to-right sweep with a little
       jitter so the edge isn't a ruler. */
    const revealAt = chars.map((c, i) =>
      c.trim()
        ? Math.floor((i / chars.length) * (FRAMES - 4)) +
          1 +
          Math.floor(Math.random() * 3)
        : 0,
    );

    let frame = 1;
    // Paint the first noisy frame now: waiting for the interval would flash
    // the settled text first, which is the exact swap this is here to hide.
    setShown(scrambled(chars, alphabet, revealAt, frame));

    timer.current = window.setInterval(() => {
      frame += 1;
      if (frame >= FRAMES) {
        window.clearInterval(timer.current);
        setShown(text);
        return;
      }
      setShown(scrambled(chars, alphabet, revealAt, frame));
    }, FRAME_MS);

    return () => window.clearInterval(timer.current);
  }, [text, ready]);

  return <span className={className}>{shown}</span>;
}

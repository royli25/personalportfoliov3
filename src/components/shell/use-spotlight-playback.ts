"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * A clip plays only while its card is the one you're reading.
 *
 * The pane already runs a scroll spotlight (`home-shell.tsx`): the
 * `[data-spot]` row nearest the pane's centre keeps full strength and every
 * other row carries `data-dim`. That measure is the site's single answer to
 * "which card is primary", so playback *listens* to it rather than
 * re-deriving proximity here — two measures of the same thing would drift,
 * and a clip playing inside a greyed-out card is exactly how you'd notice.
 *
 * Hence three states, matching what the wall already looks like:
 *
 *   at rest   — dimmed, or scrolled off. Paused and rewound, so arriving at
 *               a card always starts its story from the first beat.
 *   active    — the primary card. Playing.
 *   suspended — the caller has something live on top (the interactive demo).
 *               Paused where it stands: the scene freezes under the glass,
 *               it does not rewind, because you are still on this card.
 *
 * Visibility is ANDed in for the case the spotlight can't cover: a pane that
 * isn't the selected tab stays mounted but hidden, and its measure loop is
 * scoped to the visible panel, so the row it last lit would otherwise keep
 * playing behind a tab you left.
 */
export function useSpotlightPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  boxRef: RefObject<HTMLElement | null>,
  suspended = false,
) {
  const [lit, setLit] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  /* The shell renders no attributes server-side and dims on its first
     measure, so "no data-dim yet" reads as lit — the same optimistic start
     the opacity falloff makes, rather than a wall that begins silent and
     has to be woken. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const row = el.closest("[data-spot]");
    if (!row) {
      setLit(true);
      return;
    }
    const read = () => setLit(!row.hasAttribute("data-dim"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(row, { attributes: true, attributeFilter: ["data-dim"] });
    return () => mo.disconnect();
  }, [boxRef]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [boxRef]);

  const active = lit && onScreen;

  /* `play()` is async, and pausing before it settles makes Chrome reject it
     ("The play() request was interrupted…") and leave the clip stopped at
     frame 0. Chaining the pause onto the last play promise means a fast
     scroll past a card can never strand it that way. */
  const playing = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (active && !suspended) {
      playing.current = v.play().catch(() => {});
      return;
    }

    const rewind = !active;
    const stop = () => {
      v.pause();
      if (rewind) v.currentTime = 0;
    };
    const settled = playing.current;
    if (settled) settled.then(() => stop());
    else stop();
  }, [active, suspended, videoRef]);

  return active;
}

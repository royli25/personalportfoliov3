"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

/**
 * The panel's gesture engine: raw wheel/touch deltas in, at most one stage
 * change out per gesture.
 *
 * A *gesture* is a stream of events with no quiet gap in it. Trackpads keep
 * emitting momentum events long after the fingers leave, so "one flick" is a
 * burst of dozens of events — the quiet gap, not the event count, is where one
 * gesture ends and the next begins.
 *
 * Rules:
 *
 * 1. **Arriving at the top IS the collapse trigger.** While open, the first
 *    upward event that finds the study at its top collapses to peek — whether
 *    that's a deliberate pull or momentum from reading up the whole page.
 *    There is no second pull and no travel budget; the top edge is the
 *    gesture. (An earlier version guarded this behind "a fresh flick at the
 *    top", which read as the collapse only working 25% of the time.)
 * 2. A gesture that has caused a stage change is `consumed` — its remaining
 *    momentum is swallowed. One long flick can therefore collapse the panel
 *    but never chain on into dismissing it: peek is a place you land, and
 *    leaving it costs a fresh gesture.
 * 3. In peek, stage changes need |travel| past a threshold, so a stray tick
 *    of a wheel never opens or dismisses anything.
 *
 * Two things end a gesture: a quiet gap, or — wheel only — a magnitude
 * *spike*. Momentum only ever decays, so a sharp rise in |delta| mid-stream
 * can only be fingers touching down again: a new gesture, however recent the
 * last event. Without this, the flick after a collapse would land inside the
 * previous gesture's still-decaying tail and be swallowed with it. (Touch
 * deltas are position diffs and spike freely within one drag, so touch relies
 * on the quiet gap alone; lifted-finger momentum fires no touchmove anyway.)
 */

export type PanelPhase = "peek" | "open" | "leaving";

/** Accumulated travel (px) that commits a stage change from peek. */
const INTENT = 64;
/** Quiet gap (ms) that ends a gesture. Longer than any inter-event gap in a
    flick's momentum tail, shorter than a human pausing to change their mind. */
const QUIET_MS = 260;
/** A wheel delta this many times the previous one is a new touch-down… */
const SPIKE_RATIO = 3;
/** …but never for deltas this small, so tail jitter can't restart a gesture. */
const SPIKE_FLOOR = 24;

export function usePanelGestures({
  panelRef,
  scrollerRef,
  phaseRef,
  onOpen,
  onCollapse,
  onDismiss,
}: {
  panelRef: RefObject<HTMLElement | null>;
  scrollerRef: RefObject<HTMLElement | null>;
  /** Read through a ref so listeners bind once and never race a gesture. */
  phaseRef: RefObject<PanelPhase>;
  onOpen: () => void;
  onCollapse: () => void;
  onDismiss: () => void;
}) {
  const gesture = useRef({ travel: 0, lastAt: 0, lastMag: 0, consumed: false });

  const feed = useCallback(
    (delta: number, canSpike: boolean) => {
      const g = gesture.current;
      const now = performance.now();
      const mag = Math.abs(delta);

      const quiet = now - g.lastAt > QUIET_MS;
      const spike =
        canSpike && mag >= Math.max(g.lastMag * SPIKE_RATIO, SPIKE_FLOOR);
      if (quiet || spike) {
        g.travel = 0;
        g.consumed = false;
      }
      g.lastAt = now;
      g.lastMag = mag;
      if (g.consumed) return;

      const phase = phaseRef.current;

      if (phase === "open") {
        /* <= 1, not === 0: smooth scrolling and hi-dpi zoom leave fractional
           scrollTops, and a top the code never recognises means a collapse
           that never fires. */
        if (delta < 0 && (scrollerRef.current?.scrollTop ?? 0) <= 1) {
          g.travel = 0;
          g.consumed = true;
          onCollapse();
        }
        return;
      }

      if (phase !== "peek") return;

      g.travel += delta;
      if (g.travel > INTENT) {
        g.travel = 0;
        g.consumed = true;
        onOpen();
      } else if (g.travel < -INTENT) {
        g.travel = 0;
        g.consumed = true;
        onDismiss();
      }
    },
    [phaseRef, scrollerRef, onOpen, onCollapse, onDismiss],
  );

  /* Native, non-passive listeners: React's onWheel registers passive, which
     makes preventDefault a silent no-op — and while peeking, the gesture *is*
     the control, so the page must not scroll under it. */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (phaseRef.current !== "open") e.preventDefault();
      feed(e.deltaY, true);
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (phaseRef.current !== "open") e.preventDefault();
      const y = e.touches[0].clientY;
      feed(touchY - y, false);
      touchY = y;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [panelRef, phaseRef, feed]);
}

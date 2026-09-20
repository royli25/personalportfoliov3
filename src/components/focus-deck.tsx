"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A stack of rows where the one you're reading sits at full strength and the
 * rest drop back. Used by the decision and solution sections.
 *
 * Focus follows the scroll position, never the pointer. The hover-driven
 * version of this skipped rows: the cursor sits still while the page flies
 * past it, and the browser only re-runs `:hover` when the scroll settles, so
 * a fast flick jumped straight from the first row to the third with nothing
 * in between. Reading the geometry every frame means row two always gets its
 * moment, however fast you go — that's the ripple.
 *
 * The springs are integrated here rather than handed to a CSS transition for
 * the same reason: a transition restarts from wherever it was interrupted
 * with a fresh easing curve, so overlapping handoffs stutter. A spring just
 * keeps its velocity and gets redirected.
 */

/**
 * Lifted from the reference implementation (meganphi.com, framer-motion):
 * `{ stiffness: 220, damping: 24, mass: 0.9 }` — a damping ratio of 0.85, so
 * it overshoots by a hair and settles in about 400ms.
 */
const STIFFNESS = 220;
const DAMPING = 24;
const MASS = 0.9;

/** Resting state of every row that isn't the active one — also the reference's. */
const DIM = 0.7;
const SHRINK = 0.96;

/** How far down the viewport the reading line sits. */
const READING_LINE = 0.45;

/** Below this, a spring is close enough to its target to stop the loop. */
const EPSILON = 0.001;

export function FocusDeck({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = Array.from(root.children) as HTMLElement[];
    if (rows.length < 2) return;

    /* Per row: how focused it is (0–1) and how fast that's changing. */
    const focus = rows.map(() => 0);
    const speed = rows.map(() => 0);
    let active = 0;
    let frame = 0;
    let last = 0;

    const draw = (i: number) => {
      const f = focus[i];
      rows[i].style.opacity = `${DIM + (1 - DIM) * f}`;
      rows[i].style.transform = `scale(${SHRINK + (1 - SHRINK) * f})`;
    };

    /* The row whose middle is nearest the reading line. */
    const nearest = () => {
      const line = window.innerHeight * READING_LINE;
      let best = 0;
      let bestGap = Infinity;
      rows.forEach((row, i) => {
        const box = row.getBoundingClientRect();
        const gap = Math.abs(box.top + box.height / 2 - line);
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      });
      return best;
    };

    const step = (now: number) => {
      /* Clamped so a backgrounded tab doesn't hand the spring a 2s frame and
         fling it across the page on the way back. */
      const dt = last ? Math.min(0.032, (now - last) / 1000) : 0.016;
      last = now;

      let moving = false;
      rows.forEach((_, i) => {
        const target = i === active ? 1 : 0;
        const accel =
          (-STIFFNESS * (focus[i] - target) - DAMPING * speed[i]) / MASS;
        speed[i] += accel * dt;
        focus[i] += speed[i] * dt;

        if (
          Math.abs(focus[i] - target) < EPSILON &&
          Math.abs(speed[i]) < EPSILON
        ) {
          focus[i] = target;
          speed[i] = 0;
        } else {
          moving = true;
        }
        draw(i);
      });

      frame = moving ? requestAnimationFrame(step) : 0;
    };

    const run = () => {
      if (frame) return;
      last = 0;
      frame = requestAnimationFrame(step);
    };

    const check = () => {
      const next = nearest();
      if (next === active) return;
      active = next;
      run();
    };

    /* Land on the resting values without animating in — the section already
       has the reveal fade for that. */
    active = nearest();
    rows.forEach((_, i) => {
      focus[i] = i === active ? 1 : 0;
      draw(i);
    });

    /*
      Captured on the document, not bound to the window: the study scrolls the
      window on its own route but an inner scroller inside the case-study
      panel, and scroll events don't bubble — a window listener never hears
      the panel. Capture hears both; the viewport-relative geometry above is
      already correct in either context.
    */
    document.addEventListener("scroll", check, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", check);
    /* Media loading in shifts every row underneath it, which can change which
       row the line is over without a scroll ever happening. */
    const ro = new ResizeObserver(check);
    ro.observe(root);

    return () => {
      document.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
      rows.forEach((row) => {
        row.style.removeProperty("opacity");
        row.style.removeProperty("transform");
      });
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

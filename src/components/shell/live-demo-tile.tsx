"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AskBarShell } from "@/components/askbar/shell";
import { ReadyToAddCard } from "@/components/ready-to-add/ready-to-add";
import { READY_TO_ADD } from "@/components/ready-to-add/demo-data";
import { useSpotlightPlayback } from "@/components/shell/use-spotlight-playback";

/**
 * Gallery tiles with three states, matching what the wall already shows.
 *
 *   at rest   — a card you've scrolled away from. The pane's spotlight has
 *               it greyed back, and its recording is paused at frame 0.
 *   active    — the primary card in the scroll. Full strength, and the
 *               recording plays. Scrolling on rewinds it: these clips are
 *               little narratives, and rejoining one mid-arc reads as noise.
 *   hover     — you've reached for this specific card. The scene freezes
 *               under frosted glass and the real component rises through —
 *               the same file the recording was made from, fully
 *               interactive, with no dwell to wait out.
 *
 * Playing is the *active* card's job, not the hovered one's — see
 * `use-spotlight-playback.ts`, which listens to the same `data-dim` measure
 * that greys the wall. Hover is spent entirely on the demo.
 *
 * Leaving returns the tile to whatever the scroll says it is, except while
 * focus is still inside (or the composition says it is busy) — typing must
 * not die because the cursor drifted off, and a keyboard user can Tab
 * straight in.
 *
 * The live layer is the lab's demo composition on its fixed 800×600 canvas
 * (the harness's Tile viewport), transform-scaled to the tile — scale,
 * never reflow, the DeviceFrame rule. `LiveFrame` owns all of that once;
 * each tile supplies only its composition. Two tiles sharing one frame is
 * the point: the frost racking, the rise through the glass and the playback
 * rules must never drift apart per tile the way band-card once did.
 */

const CANVAS_W = 800;
const CANVAS_H = 600;

function LiveFrame({
  src,
  held = false,
  children,
}: {
  src: string;
  /** The composition says it is busy — stay live wherever the cursor is. */
  held?: boolean;
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const live = hover || focusWithin || held;

  /* Freezes the clip where it stands while the demo is up — no rewind, you
     haven't left the card. */
  useSpotlightPlayback(videoRef, boxRef, live);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / CANVAS_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setFocusWithin(false);
      }}
      className="relative w-full overflow-hidden rounded-shell"
      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
    >
      {/* preload="auto" because a paused first frame is the resting face —
          with no autoplay, a lazier preload rests on a blank tile instead. */}
      <video
        ref={videoRef}
        src={src}
        preload="auto"
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* The live layer, staged as a focus rack rather than a crossfade:
          the frost's blur *radius* animates, so the recorded scene melts
          instead of a pre-blurred pane fading over it, and the component
          rises through the glass a beat later. Exit retreats together and
          faster — asymmetric on purpose. CSS transitions throughout, so a
          grazing cursor retargets mid-flight instead of restarting. The
          layer stays focusable while hidden so a keyboard user can tab
          straight into the component. */}
      <div className={live ? "absolute inset-0" : "pointer-events-none absolute inset-0"}>
        <div
          className={`absolute inset-0 transition-[backdrop-filter] ease-[cubic-bezier(0.23,1,0.32,1)] ${
            live
              ? "backdrop-blur-2xl duration-300"
              : /* blur(0px), not none — `none` is non-interpolable and the
                   radius would jump instead of racking. */
                "backdrop-blur-[0px] duration-200"
          }`}
        />
        {scale > 0 && (
          <div
            className="absolute top-0 left-0 origin-top-left"
            /* Same wall the demos build (LIGHT_SCOPE in blueprintx
               primitives): the site's dark mode remaps --color-white to the
               raised dark surface, which would flip the composition's whites
               to near-black. A product mock stays light. */
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${scale})`,
              colorScheme: "light",
              ["--color-white" as string]: "#ffffff",
            }}
          >
            <div
              className={`h-full w-full transition-[opacity,transform] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                live
                  ? "translate-y-0 opacity-100 delay-[60ms] duration-[240ms]"
                  : "translate-y-2 opacity-0 delay-0 duration-150 motion-reduce:translate-y-0"
              }`}
            >
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Ask Bar ──────────────────────────────────────────────────────────── */

/* A fixed canvas makes the resting lift a constant instead of a
   measurement: (552 inner − 58 bar) / 2. */
const LIFT = (CANVAS_H - 48 - 58) / 2;

const DROP = { type: "spring", stiffness: 380, damping: 42 } as const;

export function AskBarLiveTile({ src }: { src: string }) {
  const reduced = useReducedMotion() ?? false;
  /* Open shell = engaged, wherever the cursor is. */
  const [engaged, setEngaged] = useState(false);

  return (
    <LiveFrame src={src} held={engaged}>
      <div className="flex h-full w-full justify-center p-6">
        <div className="flex h-full w-full max-w-[690px] flex-col justify-end">
          <motion.div
            initial={false}
            animate={{ y: engaged ? 0 : -LIFT }}
            transition={reduced ? { duration: 0 } : DROP}
          >
            <AskBarShell onOpenChange={setEngaged} />
          </motion.div>
        </div>
      </div>
    </LiveFrame>
  );
}

/* ── Ready to Add ─────────────────────────────────────────────────────── */

export function ReadyToAddLiveTile({ src }: { src: string }) {
  /* The card exposes no busy callback — its own timers run the extraction —
     so the frame's focus-within rule is the only hold it needs: the URL
     input, a ledger row or the eligibility editor each keep it live while
     the cursor wanders. */
  return (
    <LiveFrame src={src}>
      {/* Centered like the lab's Tile viewport, which the recording shows —
          the live card must land exactly over its recorded self. */}
      <div className="flex h-full w-full items-center justify-center px-5">
        <ReadyToAddCard
          url={READY_TO_ADD.url}
          tasks={READY_TO_ADD.tasks}
          fields={READY_TO_ADD.fields}
        />
      </div>
    </LiveFrame>
  );
}

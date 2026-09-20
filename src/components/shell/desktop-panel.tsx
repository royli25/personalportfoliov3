"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Desktop } from "@/desktop";

/**
 * The Playground's boot sequence: a peek card that loads itself into a
 * full-screen desktop.
 *
 * Three phases, and only the first two are yours to watch:
 *
 *   boot     the desktop out of focus at peek size, HUD counting 0→100.
 *            At 69% it holds, a confirm crumb asks to fullscreen, and the
 *            ramp only finishes after that click.
 *   open     the blur clears, the card pops to 1:1, the dock lands.
 *   leaving  it drops back toward the card size and goes.
 *
 * The counter is not a decoration on an empty wait. The desktop is mounted
 * from the very first frame — blurred, behind the veil — so the two seconds
 * are spent fetching the app chunks (`Desktop`'s mount effect) and painting a
 * 1440×900 product. What the number covers is real. The pause is the one
 * exception: it waits on a person, not a clock.
 *
 * Nothing else here is a gesture. You click Playground, the sequence runs
 * itself (with that one confirm), and the X in the corner (or Escape) is the
 * way out — the desktop already has its own scroll-free interior, so there's
 * no scroll to overload.
 *
 * Phases are data attributes and the transitions live in CSS
 * (globals.css `.boot-panel`), which keeps them off the main thread while the
 * demo behind them is mounting. The entrance is `@starting-style`, so no JS
 * has to schedule a first frame.
 */

/** How long the counter takes to reach 100, not counting the confirm hold. */
const BOOT_MS = 2000;
/** Freeze here until the user confirms. */
const PAUSE_AT = 0.69;
/** Beat after hitting 69% before the crumb appears — "slightly". */
const HOLD_MS = 380;
/** Ceiling for the exit transition; `transitionend` normally beats it. */
const EXIT_FALLBACK_MS = 320;

type Phase = "boot" | "open" | "leaving";
/** The ramp's inner gate. `hold` is the short pause; `ask` waits on Confirm. */
type Gate = "run" | "hold" | "ask" | "go";

export function DesktopPanel({ onClosed }: { onClosed: () => void }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [count, setCount] = useState(0);
  const [ask, setAsk] = useState(false);
  const panelEl = useRef<HTMLDivElement>(null);

  /* The exit callback and the boot loop both read the phase through a ref, so
     neither can act on a stale render. Kept in step inside the setter. */
  const phaseRef = useRef<Phase>("boot");
  const toPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  /* `gate` is the ramp's private state — the loop reads it every frame, Confirm
     writes it once. A ref so the click doesn't have to restart the rAF. */
  const gateRef = useRef<Gate>("run");

  /* A rAF ramp against the wall clock, not a chain of timers: a throttled tab
     resumes at the number it should be at, and a dropped frame costs a value
     rather than shifting everything after it. Elapsed only advances while the
     gate is `run` or `go` — the hold and the confirm wait on a person. */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let heldAt: number | null = null;

    const tick = (now: number) => {
      if (phaseRef.current !== "boot") return;
      const dt = now - last;
      last = now;
      const gate = gateRef.current;

      if (gate === "run") {
        elapsed += dt;
        const p = Math.min(PAUSE_AT, elapsed / BOOT_MS);
        setCount(Math.round(p * 100));
        if (p >= PAUSE_AT) {
          elapsed = PAUSE_AT * BOOT_MS;
          gateRef.current = "hold";
          heldAt = now;
          setCount(Math.round(PAUSE_AT * 100));
        }
      } else if (gate === "hold") {
        if (now - (heldAt ?? now) >= HOLD_MS) {
          gateRef.current = "ask";
          setAsk(true);
        }
      } else if (gate === "go") {
        elapsed += dt;
        const p = Math.min(1, elapsed / BOOT_MS);
        setCount(Math.round(p * 100));
        if (p >= 1) {
          toPhase("open");
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [toPhase]);

  const confirm = useCallback(() => {
    if (gateRef.current !== "ask") return;
    setAsk(false);
    gateRef.current = "go";
  }, []);

  const dismiss = useCallback(() => {
    if (phaseRef.current === "leaving") return;
    toPhase("leaving");

    /* Hand back control when the exit has actually finished, rather than after
       a constant kept in sync with the CSS by hand. The timer covers the
       transition never firing at all (reduced motion, hidden tab). */
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClosed();
    };
    panelEl.current?.addEventListener("transitionend", finish, { once: true });
    window.setTimeout(finish, EXIT_FALLBACK_MS);
  }, [onClosed, toPhase]);

  /* The shell behind must not scroll while this is up. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* A dialog: focus moves in and back out, so Escape and the dock's own keys
     act on the desktop rather than on the pane behind it. */
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panelEl.current?.focus();
    return () => before?.focus?.();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Playground desktop"
    >
      {/* Heavier than the case study's scrim: the pane behind is a card of
          this same wallpaper, and without the extra weight the boot card reads
          as a second desktop floating over the first rather than as the one
          you're waiting on. */}
      <button
        aria-label="Close the playground"
        onClick={dismiss}
        data-leaving={phase === "leaving"}
        className="panel-scrim absolute inset-0 cursor-default bg-black/75"
      />

      <div
        ref={panelEl}
        data-phase={phase}
        tabIndex={-1}
        className="boot-panel absolute inset-0 overflow-hidden outline-none"
      >
        <div className="boot-stage absolute inset-0">
          {/* Escape belongs to the desktop: it quits a running app first and
              only reaches us once there's nothing left in there to close. */}
          <Desktop booted={phase !== "boot"} onEscape={dismiss} />
        </div>

        {/* Labels sit on the bar, not beside it — the bar is a rule they
            share, and the percent is how far along that rule has got. Half
            the card, centred. The confirm row is absolutely above the HUD
            so the bar doesn't jump when it arrives; `data-ask` dims the
            HUD so the action is the thing you see. */}
        <div className="boot-veil absolute inset-0">
          <div className="boot-stack" data-ask={ask || undefined}>
            {ask && (
              <div className="boot-crumb">
                <p className="boot-crumb-copy">
                  Please fullscreen browser for full experience
                </p>
                <button type="button" className="boot-crumb-go" autoFocus onClick={confirm}>
                  Confirm
                </button>
              </div>
            )}

            <div className="boot-hud" aria-hidden>
              <div className="boot-hud-meta">
                <span className="boot-label">Loading Content</span>
                <span className="boot-count">{count}%</span>
              </div>
              <span className="boot-bar">
                <span
                  className="boot-fill"
                  style={{ transform: `scaleX(${count / 100})` }}
                />
              </span>
            </div>
          </div>

          <span className="sr-only" role="status">
            {ask
              ? "Paused at 69 percent. Confirm to continue."
              : "Loading the desktop"}
          </span>
        </div>

        <button
          onClick={dismiss}
          aria-label="Close the playground"
          className="boot-close absolute top-5 right-5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/70 backdrop-blur-md transition-colors hover:bg-black/55 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

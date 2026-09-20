"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePanelGestures, type PanelPhase } from "./use-panel-gestures";

/**
 * A case study that opens over the shell in two stages.
 *
 * `peek` — the whole page, rendered at real viewport size and scaled down so
 * it reads as a card sitting on the shell. `open` — the same page at 1:1,
 * filling the viewport and scrolling on its own. Scroll down commits peek →
 * open; scroll up at the study's top collapses open → peek; scroll up again
 * dismisses. Leaving is the arriving gesture, reversed.
 *
 * The page is *scaled*, never reflowed: peek and open are one `transform`
 * apart, so nothing re-wraps mid-transition — the same rule `DeviceFrame`
 * follows for the demos. The phases are data attributes; the transitions
 * between them live entirely in CSS (globals.css `.case-panel`), which keeps
 * them off the main thread and interruptible, and the entrance is a
 * `@starting-style` so no JS has to schedule a first frame.
 */

/** Ceiling for the exit transition; `transitionend` normally beats it. */
const EXIT_FALLBACK_MS = 320;

export function CaseStudyPanel({
  children,
  contentKey,
  startAt = "peek",
  onClosed,
  onSwap,
}: {
  children: ReactNode;
  /** Changes when a different study is shown, so the scroll returns to top. */
  contentKey: string;
  /** `open` on a direct load of /work/[slug]; `peek` when clicked into. */
  startAt?: "peek" | "open";
  /** The panel has fully left the screen — unmount and clean up the URL. */
  onClosed: () => void;
  /** A link to another study was followed from inside the panel. */
  onSwap: (slug: string) => void;
}) {
  const [phase, setPhase] = useState<PanelPhase>(startAt);
  const panelEl = useRef<HTMLDivElement>(null);
  const scrollerEl = useRef<HTMLDivElement>(null);

  /* Listeners and callbacks read the phase through a ref so nothing rebinds
     mid-gesture. Kept in step with state inside the setters below. */
  const phaseRef = useRef<PanelPhase>(startAt);

  const toPhase = useCallback((next: PanelPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const dismiss = useCallback(() => {
    if (phaseRef.current === "leaving") return;
    toPhase("leaving");

    /* Hand back control when the exit has actually finished, not after a
       constant that has to be kept in sync with the CSS by hand. The timer is
       a fallback for the transition never firing (reduced motion, hidden tab). */
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClosed();
    };
    panelEl.current?.addEventListener("transitionend", finish, { once: true });
    window.setTimeout(finish, EXIT_FALLBACK_MS);
  }, [onClosed, toPhase]);

  usePanelGestures({
    panelRef: panelEl,
    scrollerRef: scrollerEl,
    phaseRef,
    onOpen: () => toPhase("open"),
    onCollapse: () => {
      toPhase("peek");
      /* A pull can begin partway down the study, so the card would otherwise
         peek at a random mid-scroll slice. Instant, not smooth: the scale-down
         masks the jump, and smooth scrolling stalls in throttled tabs. */
      scrollerEl.current?.scrollTo({ top: 0 });
    },
    onDismiss: dismiss,
  });

  /* A different study starts at its own top. */
  useEffect(() => {
    scrollerEl.current?.scrollTo({ top: 0 });
  }, [contentKey]);

  /* The shell behind must not scroll while this is up — on desktop it already
     can't (h-screen), but mobile scrolls the body. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* This is a dialog: focus moves in on open and back out on close, so Escape
     and the arrow keys act on the study, not on a card behind the scrim. */
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panelEl.current?.focus();
    return () => before?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  /**
   * Links inside the study stay inside the experience. "Back to work" and the
   * footer's home links mean *back to the shell*, which is already behind this
   * panel — they close it. "Next case study" swaps the study in place. All
   * other links (mailto, external) pass through untouched, as do modified
   * clicks — cmd-click on a study link still opens a real tab.
   */
  const onPanelClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const href = (e.target as HTMLElement)
      .closest?.("a[href]")
      ?.getAttribute("href");
    if (!href) return;

    if (href === "/" || href.startsWith("/#")) {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
      return;
    }
    const study = href.match(/^\/work\/([^/#?]+)/);
    if (study) {
      e.preventDefault();
      e.stopPropagation();
      onSwap(study[1]);
    }
  };

  const peeking = phase === "peek";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Scrim: the shell stays visible underneath, just pushed back. */}
      <button
        aria-label="Close case study"
        onClick={dismiss}
        data-leaving={phase === "leaving"}
        className="panel-scrim absolute inset-0 cursor-default bg-black/60"
      />

      <div
        ref={panelEl}
        data-phase={phase}
        tabIndex={-1}
        onClickCapture={onPanelClick}
        className="case-panel absolute inset-0 overflow-hidden outline-none"
      >
        <div
          ref={scrollerEl}
          className={`h-full ${
            phase === "open"
              ? "overflow-y-auto overscroll-contain"
              : "overflow-hidden"
          }`}
        >
          {children}
        </div>

        {/* Nothing else says a scroll — not a click — is what opens this. */}
        <span data-visible={peeking} className="panel-hint">
          Scroll to open
        </span>

        {/* Offered only while peeking: once open, scrolling back up is the way
            out, and a floating button would compete with it. */}
        <button
          onClick={dismiss}
          data-visible={peeking}
          aria-label="Close case study"
          className="panel-close absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/5 text-neutral-500 hover:bg-neutral-900/10 hover:text-neutral-900"
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

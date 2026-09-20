"use client";

import { useEffect, useState } from "react";

/**
 * The "still being built" notice, above the shell.
 *
 * A flex item rather than a fixed overlay: the shell is sized to whatever is
 * left of the viewport, so the bar covers nothing. Fixed would sit exactly on
 * top of the rail's nav pill, which is the first thing in the shell.
 *
 * Dismissal is state, not storage — a reload brings it back, which is the
 * right bias for a notice meant to be read once on arrival. Opening a case
 * study doesn't reload (the panel is pushState), so dismissing it sticks for
 * as long as the visit lasts.
 *
 * Temporary by design: delete this file, its tokens in globals.css, and the
 * one line in home-composition.tsx when the site stops being a work in
 * progress.
 */
export function WipBanner() {
  const [open, setOpen] = useState(true);
  const [leaving, setLeaving] = useState(false);

  /* It leaves on its own after seven seconds — enough to read the two lines
     twice. The × is for anyone who reads faster than that. */
  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 7000);
    return () => clearTimeout(t);
  }, []);

  /* Fallback for the unmount below: a reduced-motion visitor gets a 0ms
     collapse, and a transition that doesn't run never fires transitionend —
     without this the bar stays in the DOM, hidden but still readable aloud. */
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setOpen(false), 400);
    return () => clearTimeout(t);
  }, [leaving]);

  if (!open) return null;

  return (
    <div
      /* Collapse is CSS (globals.css); unmounting waits for it, so the shell
         reflows into the space rather than snapping into it. */
      className="wip-banner shrink-0"
      data-leaving={leaving || undefined}
      onTransitionEnd={(e) => {
        if (leaving && e.propertyName === "grid-template-rows") setOpen(false);
      }}
    >
      <div>
        {/* The message is centred on the viewport, not in the space left over
            beside the button — hence absolute, not a flex sibling.

            Phones only get the padding that clears the button, and read the
            line ragged-right: centring it there costs a third line and leaves
            "meantime." alone on it. */}
        <div className="relative bg-shell-note py-2.5 pr-11 pl-4 lg:px-12 lg:text-center">
          <p className="text-[13px] leading-5 text-shell-note-ink">
            My portfolio is still a work in progress, so you may encounter a
            few small bugs. Have fun in the meantime.
          </p>

          <button
            type="button"
            onClick={() => setLeaving(true)}
            aria-label="Dismiss this notice"
            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-shell-note-ink/75 transition-colors hover:bg-shell-note-ink/15 hover:text-shell-note-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
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
    </div>
  );
}

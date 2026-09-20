"use client";

import { useState } from "react";
import type { DesktopApp } from "./registry";

/**
 * The dock — the desktop's only control. It sits along the bottom, the way
 * the machine this is a picture of actually works.
 *
 * It used to run down the left: the window was height-constrained then, and a
 * bottom dock spent ~100px of the scarce axis. Height is the slack axis now
 * (~0.95 against the ~0.90 width sets), so the band lives where the leftover
 * is, and the width the left dock was taking goes back to the product.
 *
 * Icons come from the registry, so this file never learns an app's name.
 * Clicking launches, and clicking the running app closes it: the demo draws
 * its own traffic lights but they're painted chrome inside the mock, not
 * buttons, so the dock is the way out. The running dot is what says so.
 *
 * No magnification. macOS can afford a 1.3× swell because its dock holds
 * twenty icons and the lift is how you tell which one you're on; with four,
 * position already tells you that, and the same amplitude just throws the
 * grid — the hovered tile eats the left pad and the gap beside it. The
 * tooltip is the hover, not a zoom.
 *
 * The hover name is the macOS tooltip: an opaque chip above the tile, white
 * ink, a caret pointing at the icon. A translucent label on this wallpaper
 * disappears; the site's dark ramp also remaps `white` to charcoal, so the
 * dock pins `--color-white` back to actual white or the chip would print
 * dark-on-dark — the exact bug the left-hand label had.
 */

/**
 * Vertical band the dock reserves along the foot of the desktop. Taller than
 * the plate on purpose: the tooltip sits above the tiles over the wallpaper,
 * and this is the clearance that keeps the plate off the window's edge.
 * Every pixel given back here is a pixel the product gets.
 */
export const DOCK_RESERVE = 96;

const SIZE = 54;
const GAP = 12;
/** Equal inset on every side of the plate — a pill with more pad on the
    right than the left is the dock looking like it's listing. */
const PAD = 10;

export function Dock({
  apps,
  openId,
  onLaunch,
}: {
  apps: DesktopApp[];
  openId: string | null;
  /** `rect` is the icon's viewport box — the window launches out of it. */
  onLaunch: (id: string, rect: DOMRect) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-center"
      style={{
        height: DOCK_RESERVE,
        /* The site remaps `--color-white` to a dark surface. The dock is a
           picture of macOS chrome sitting on a photograph, so white has to
           mean white or the tooltip, the plate edge and the running dot all
           print as charcoal on the wallpaper. */
        ["--color-white" as string]: "#ffffff",
      }}
    >
      <div
        className="pointer-events-auto mb-2.5 rounded-[22px] border border-white/20 bg-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
        style={{ padding: PAD }}
      >
        <div
          className="flex"
          style={{ gap: GAP }}
          onMouseLeave={() => setHovered(null)}
        >
          {apps.map((app) => {
            const running = app.id === openId;
            /* No program = a reserved slot. It draws like the rest, and
               does nothing when you click it. */
            const installed = Boolean(app.program);
            const active = hovered === app.id;
            return (
              <div
                key={app.id}
                className="relative shrink-0"
                style={{ width: SIZE, height: SIZE }}
              >
                {/* The name sits above the tile, the way a bottom dock labels
                    one. Opaque on purpose: this wallpaper eats translucency,
                    and a caret is how you tell which icon the chip belongs
                    to when neighbours are a few pixels away. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-[calc(100%+26px)] left-1/2 z-20 -translate-x-1/2 rounded-[6px] bg-[#1d1d1f] px-2.5 py-[5px] text-[12px] leading-none font-medium tracking-[-0.01em] text-white shadow-[0_4px_18px_rgba(0,0,0,0.4)] transition-opacity duration-100 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {app.name}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1d1d1f]" />
                </span>

                <button
                  type="button"
                  /* A reserved slot's name already says what it is — a
                     verb in front of it would promise an action it hasn't
                     got. */
                  aria-label={
                    installed ? (running ? `Quit ${app.name}` : `Open ${app.name}`) : app.name
                  }
                  aria-pressed={installed ? running : undefined}
                  aria-disabled={installed ? undefined : true}
                  onMouseEnter={() => setHovered(app.id)}
                  onClick={(e) => {
                    if (!installed) return;
                    onLaunch(app.id, e.currentTarget.getBoundingClientRect());
                  }}
                  className={`block p-0 ${installed ? "" : "cursor-default"}`}
                  style={{
                    width: SIZE,
                    height: SIZE,
                  }}
                >
                  {app.icon}
                </button>

                {/* Absolute, so the indicator sits in the plate's own
                    padding instead of pushing every icon up — the same
                    place macOS puts it. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -bottom-[7px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-white transition-opacity duration-200 ${
                    running ? "opacity-90" : "opacity-0"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

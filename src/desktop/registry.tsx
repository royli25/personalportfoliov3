"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { FRAME } from "@/demos/blueprintx/frame";

/**
 * The desktop's installed apps — one array, and everything derives from it.
 *
 * The dock, the window layer and the menu bar's app name all read this list,
 * so a new project is one more entry and nothing else: no dock edit, no
 * menu-bar edit, no second window component. (Same rule as
 * `demos/blueprintx/data/resources.ts` feeding the grid, the list, the drawer
 * and the rail's counts — a registry that only one surface reads is a
 * registry that will drift.)
 *
 * `program` is what separates a real app from a reserved slot, and it's one
 * field rather than four optional ones on purpose: an entry either has a
 * canvas, a renderer and a loader, or it has none of them. There is no
 * half-installed state to handle downstream.
 *
 * Apps arrive through `next/dynamic`, `ssr: false`. A statically imported
 * BlueprintX would ship in the main bundle for every visitor, including the
 * ones who never open Playground — the pane is always mounted, only hidden.
 * `load()` is the escape hatch: the desktop calls it the first time it
 * becomes visible, so the chunk is already in the module cache by the time
 * anyone finds the dock. Lazy for the bundle, eager for the click.
 */

const BlueprintX = dynamic(
  () => import("@/demos/blueprintx").then((m) => m.BlueprintXDemo),
  { ssr: false, loading: () => null },
);

export type DesktopApp = {
  id: string;
  /** The dock's hover label. */
  name: string;
  icon: ReactNode;
  /** Absent = a reserved slot: it draws and magnifies, it doesn't launch. */
  program?: {
    /** The authored canvas. Scaled into the desktop, never reflowed. */
    canvas: { width: number; height: number };
    /**
     * Rendered on launch, at native canvas size. `chrome` stays off and no
     * scale is passed: the window owns the fit transform, so the app tree
     * never re-renders while the rail is folding. See `window.tsx`.
     */
    render: () => ReactNode;
    /** Warms the chunk. Called on first visibility, not on click. */
    load: () => Promise<unknown>;
  };
};

export const APPS: DesktopApp[] = [
  {
    id: "blueprintx",
    name: "BlueprintX",
    icon: <BlueprintIcon />,
    program: {
      canvas: FRAME,
      /* autoplay: an embed has no transport to press, so the meeting has to
         start itself or its transcript sits empty. The recording stage leaves
         it off — a take starts on space, not on navigation. */
      render: () => <BlueprintX scale={1} chrome={false} autoplay />,
      load: () => import("@/demos/blueprintx"),
    },
  },
  /* Reserved slots. Locked fillers, never invented products — a dock of
     plausible-looking app icons is a portfolio claiming work that doesn't
     exist. Each one becomes real by growing a `program`. */
  { id: "slot-2", name: "Coming soon", icon: <LockedSlotIcon /> },
  { id: "slot-3", name: "Coming soon", icon: <LockedSlotIcon /> },
  { id: "slot-4", name: "Coming soon", icon: <LockedSlotIcon /> },
];

/**
 * A dock tile in the macOS idiom: a rounded-square plate carrying the
 * product's own mark. Built in JSX rather than exported as an asset so a
 * future app needs a mark, not a whole icon composition.
 */
function BlueprintIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[22%] bg-linear-to-b from-[#fdfdfc] to-[#dededa] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.35)]">
      <svg
        viewBox="0 0 24 24"
        className="h-[52%] w-[52%]"
        fill="#1a1a1a"
        aria-hidden
      >
        <path d="M3.83 15.63 7.454 12 3.83 8.376 1.66 6.206 0 0v24l1.66-6.202z" />
        <path d="M12 7.459 15.624 3.835 17.794 1.661 24 0H0l6.202 1.661z" />
        <path d="M22.339 6.206 20.165 8.376 16.541 12l5.798 5.798L24 24V0z" />
        <path d="M15.624 20.17 12 16.546l-3.629 3.624-2.17 2.17L0 24h24l-6.206-1.661z" />
      </svg>
    </div>
  );
}

/**
 * A locked tile — the same plate silhouette as an installed app, but recessed
 * rather than raised, with a lock in it. The recess and the inset shadow are
 * what keep it legible over a light wallpaper (a pale outline on white/5
 * disappears entirely); the lock is what stops a blank socket reading as an
 * app that failed to load rather than one that isn't there yet.
 *
 * Same geometry as the lock in `components/shell/coming-soon.tsx` — one lock
 * in this codebase, drawn at two sizes, not two locks that drift.
 */
function LockedSlotIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[22%] bg-black/25 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
      <svg
        viewBox="0 0 14 14"
        className="h-[42%] w-[42%] text-white/55"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="2.25" y="6" width="9.5" height="6.25" rx="1.75" />
        <path d="M4.6 6V4.4a2.4 2.4 0 0 1 4.8 0V6" />
      </svg>
    </div>
  );
}

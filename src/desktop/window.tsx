"use client";

import { useMemo } from "react";
import type { DesktopApp } from "./registry";

/**
 * One application window on the desktop.
 *
 * The app is authored at a fixed canvas and *transform*-scaled to fit — the
 * DeviceFrame rule, applied one level up. Two nested transforms on purpose:
 *
 *   outer  the launch/quit animation (and the frame: radius, shadow, clip)
 *   inner  the fit scale
 *
 * Keeping them apart is what makes the rail's 300ms fold cheap. The fit scale
 * changes on every frame of that fold, and it lands on an inline style on the
 * inner div only — `content` is memoised on the app, so the whole application
 * tree below it never re-renders while the rail is moving.
 *
 * No title bar here: the mock draws its own traffic lights (see
 * `demos/blueprintx/parts/primitives.tsx`), exactly as a real frameless macOS
 * app does. The desktop owes it radius, shadow and position — nothing else.
 */
export function AppWindow({
  program,
  /** The desktop's content box — menu bar and dock already subtracted. */
  availWidth,
  availHeight,
  phase,
  /** Vector from the window's centre to the dock icon it flies out of. */
  launch,
  onExited,
}: {
  program: NonNullable<DesktopApp["program"]>;
  availWidth: number;
  availHeight: number;
  phase: "open" | "closing";
  launch: { dx: number; dy: number };
  onExited: () => void;
}) {
  const { width, height } = program.canvas;

  /* Never above 1: a 1440px canvas blown up past native turns a crisp mock
     into a soft one, and there is no detail up there to win. */
  const scale = Math.min(availWidth / width, availHeight / height, 1);

  /* The application itself, pinned to the app identity. Scale is deliberately
     not a dependency — see the note above. */
  const content = useMemo(() => program.render(), [program]);

  return (
    <div
      className="desktop-window relative overflow-hidden rounded-[10px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.55),0_2px_10px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.14)]"
      data-phase={phase}
      style={{
        width: width * scale,
        height: height * scale,
        ["--launch-dx" as string]: `${launch.dx}px`,
        ["--launch-dy" as string]: `${launch.dy}px`,
        /* Demos pin their own light palette; the frame it sits in has to as
           well, or the site's dark ramp remaps the window's own white. */
        colorScheme: "light",
      }}
      onTransitionEnd={(e) => {
        if (phase === "closing" && e.propertyName === "transform") onExited();
      }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {content}
      </div>
    </div>
  );
}

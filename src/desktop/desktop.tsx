"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DesktopBackdrop } from "./backdrop";
import { AppWindow } from "./window";
import { Dock, DOCK_RESERVE } from "./dock";
import { APPS } from "./registry";
import { StickyNote } from "./sticky-note";

/**
 * The Playground: a desktop, with the products running on it as real
 * applications.
 *
 * It lives inside `shell/desktop-panel.tsx`, which boots it to full screen
 * over the shell. That's what buys the window enough width for its own type
 * to stay legible — the whole viewport rather than a pane, ~0.89 against the
 * ~0.85 the folded-rail stage used to manage.
 *
 * Fluid desktop, fixed window: the wallpaper and dock size to whatever box
 * they're given, while each app stays on its authored canvas and scales into
 * the middle. So the desktop uses every pixel available and the product never
 * reflows into a layout it was never designed at.
 *
 * The dock sits along the bottom. Height is the slack axis here, so that's
 * the band that can spend pixels — see the note in dock.tsx.
 *
 * Nothing is running when you arrive. You launch from the dock, and the same
 * icon quits — the mock's traffic lights are painted chrome, not buttons, so
 * the dock (and Escape) is the way back out.
 *
 * The menu bar shares its wallpaper framing and clock with the corner peek.
 */

/** Breathing room between the window and the edges of its band. */
const INSET = 24;

export function Desktop({
  /** False while the panel is still counting itself in — wallpaper only. */
  booted = true,
  /** Escape with no app running: there's nothing left here to close. */
  onEscape,
  /**
   * Prefetch app chunks on mount. The parked poster leaves this off — that
   * pane is always in the tree, and warming it would pull BlueprintX for
   * everyone who never opens Playground.
   */
  warm = true,
  backToPortfolio = false,
  onReady,
}: {
  booted?: boolean;
  onEscape?: () => void;
  warm?: boolean;
  backToPortfolio?: boolean;
  onReady?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  const [avail, setAvail] = useState({ width: 0, height: 0 });
  const [openId, setOpenId] = useState<string | null>(null);
  /** Held through the quit animation so the window can fly back to the dock. */
  const [closingId, setClosingId] = useState<string | null>(null);
  const [launch, setLaunch] = useState({ dx: 0, dy: 0 });

  /* Mounting *is* the launch — the panel only renders this once you've asked
     for the desktop — so the app chunks start fetching now rather than riding
     in everyone's main bundle. This is what the boot counter is covering: by
     the time it reaches 100 the modules are cached and the dock opens them
     instantly. */
  useEffect(() => {
    if (!warm) return;
    APPS.forEach((app) => void app.program?.load());
  }, [warm]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    /* `clientWidth`, not the bounding rect: the panel scales itself in with a
       transform, and the desktop is laid out at full size throughout — the
       DeviceFrame rule. A rect would report the boot card's 80% and resize the
       window mid-animation. A zero measurement means no box yet, so the last
       real one stands. */
    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 0 && height > 0) setAvail({ width, height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const quit = useCallback(() => {
    setOpenId((id) => {
      if (id) setClosingId(id);
      return null;
    });
  }, []);

  const onLaunch = useCallback(
    (id: string, iconRect: DOMRect) => {
      if (id === openId) {
        quit();
        return;
      }
      if (!APPS.find((a) => a.id === id)?.program) return;
      const box = boxRef.current?.getBoundingClientRect();
      if (box) {
        setLaunch({
          dx: iconRect.left + iconRect.width / 2 - (box.left + box.width / 2),
          dy: iconRect.top + iconRect.height / 2 - (box.top + box.height / 2),
        });
      }
      setClosingId(null);
      setOpenId(id);
    },
    [openId, quit],
  );

  /* Escape quits, the way it leaves anything else on this site — and with
     nothing running it leaves the desktop itself. One owner for the key, so
     the innermost thing always wins; two listeners racing on `window` would
     close the panel out from under the app you meant to quit. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openId) quit();
      else onEscape?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, quit, onEscape]);

  const showingId = openId ?? closingId;
  const showing = APPS.find((a) => a.id === showingId);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b0b0b]">
      <DesktopBackdrop backToPortfolio={backToPortfolio} onReady={onReady} />

      <div className="relative z-10 flex-1">
        {/* Furniture is the room, including while the boot card is still
            blurred — hiding it made the loading plate a still of the
            wallpaper, the same lie the parked poster used to tell.
            `inert` until the blur clears, so a dock click can't launch
            an app from underneath the HUD. */}
        <div className="absolute inset-0" inert={!booted || undefined}>
          <StickyNote topInset={backToPortfolio ? 200 : 40} />
        </div>

        {/* pointer-events stay off the band so an empty desktop does not
            swallow the sticky. Only the window itself receives clicks. */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            paddingTop: INSET + 28,
            paddingRight: INSET,
            paddingBottom: DOCK_RESERVE,
            paddingLeft: INSET,
          }}
        >
          <div
            ref={boxRef}
            className="flex h-full w-full items-center justify-center"
          >
            {showing?.program && avail.width > 0 && (
              <div className="pointer-events-auto">
                <AppWindow
                  key={showing.id}
                  program={showing.program}
                  availWidth={avail.width}
                  availHeight={avail.height}
                  phase={openId === showing.id ? "open" : "closing"}
                  launch={launch}
                  onExited={() => setClosingId(null)}
                />
              </div>
            )}
          </div>
        </div>

        <div inert={!booted || undefined}>
          <Dock apps={APPS} openId={openId} onLaunch={onLaunch} />
        </div>
      </div>
    </div>
  );
}

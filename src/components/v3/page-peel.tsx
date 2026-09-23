"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Desktop } from "@/desktop/desktop";

type PeelOrigin = { width: number; baseWidth: number; height: number; top: number; right: number; shade: number };
const PagePeelContext = createContext<((origin: PeelOrigin) => void) | null>(null);
const PagePeelReadyContext = createContext<(() => void) | undefined>(undefined);
export function usePagePeel() { return useContext(PagePeelContext); }
export function usePagePeelReady() { return useContext(PagePeelReadyContext); }

/** Keep the outgoing fold and the destination in the same viewport coordinates. */
export function PagePeelProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [origin, setOrigin] = useState<PeelOrigin | null>(null);
  const [destinationReady, setDestinationReady] = useState(false);
  const reveal = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const ready = useCallback(() => setDestinationReady(true), []);

  useEffect(() => {
    // Hold the finished frame until the actual desktop has decoded its wallpaper.
    if ((pathname === "/playground" && destinationReady) || (pathname !== "/" && pathname !== "/playground")) {
      setOrigin(null);
      busy.current = false;
    }
  }, [pathname, destinationReady]);

  useLayoutEffect(() => {
    if (!origin || !reveal.current || !paper.current || !scene.current) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const width = window.innerWidth;
    const height = window.innerHeight;
    const slope = origin.width / origin.height;
    const end = width + (height - origin.top) * slope + 64;
    const point = (x: number, y: number) => `${x}px ${y}px`;
    const triangle = (distance: number) => `polygon(${point(origin.right - distance, origin.top)}, ${point(origin.right, origin.top)}, ${point(origin.right, origin.top + distance / slope)})`;
    const options: KeyframeAnimationOptions = {
      duration: 700,
      easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-drawer").trim(),
      fill: "forwards",
    };
    // The first frame is the actual hover geometry, even on a fast click mid-hover.
    // Layout effect installs it before hiding the original corner can paint a gap.
    const opening = reveal.current.animate([
      { clipPath: triangle(origin.width) }, { clipPath: triangle(end) },
    ], options);
    const turning = paper.current.animate([
      { transform: `scale(${origin.width / origin.baseWidth}, 1)` },
      { transform: `scale(${end / origin.baseWidth}, ${end / origin.width})` },
    ], options);
    const settling = scene.current.animate([
      { transform: `translateY(${origin.top}px)` }, { transform: "translateY(0px)" },
    ], options);
    let cancelled = false;
    opening.finished.then(() => {
      if (!cancelled) router.push("/playground", { scroll: false });
    }).catch(() => {});
    return () => {
      cancelled = true;
      opening.cancel();
      turning.cancel();
      settling.cancel();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [origin, router]);

  function open(next: PeelOrigin) {
    if (busy.current) return;
    busy.current = true;
    setDestinationReady(false);
    router.prefetch("/playground");
    setOrigin(next);
  }

  return <PagePeelContext.Provider value={open}>
    <PagePeelReadyContext.Provider value={ready}>
      <div data-page-peeling={origin ? "true" : undefined} inert={origin ? true : undefined}>{children}</div>
      {origin && <div className="v3-page-peel" aria-hidden="true" inert>
        <div className="v3-page-peel-reveal" ref={reveal}>
          <div className="v3-page-peel-scene" ref={scene}>
            <Desktop backToPortfolio warm={false} />
          </div>
        </div>
        <div className="v3-page-peel-shadow">
          <div className="v3-page-peel-paper" ref={paper} style={{
            width: origin.baseWidth, height: origin.height,
            left: origin.right - origin.baseWidth, top: origin.top,
          }}>
            <div className="v3-page-peel-shade" style={{ opacity: origin.shade }} />
          </div>
        </div>
      </div>}
    </PagePeelReadyContext.Provider>
  </PagePeelContext.Provider>;
}

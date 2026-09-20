"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Desktop } from "@/desktop/desktop";

type PeelOrigin = { width: number; height: number; expanded: boolean };
const PagePeelContext = createContext<((origin: PeelOrigin) => void) | null>(null);
export function usePagePeel() { return useContext(PagePeelContext); }

/** Keep the reveal mounted across routing, until the real playground is ready. */
export function PagePeelProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [origin, setOrigin] = useState<PeelOrigin | null>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (pathname === "/playground") {
      setOrigin(null);
      busy.current = false;
    }
  }, [pathname]);

  useEffect(() => {
    if (!origin || !reveal.current || !paper.current) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const width = window.innerWidth;
    const height = window.innerHeight;
    const initial = origin.width * (origin.expanded ? 1.35 : 1);
    const slope = initial / origin.height;
    const end = width + height * slope + 140;
    const triangle = (distance: number) => `polygon(${width - distance}px 0px, ${width}px 0px, ${width}px ${distance / slope}px)`;
    const fold = (distance: number, thickness: number) => `polygon(${width - distance}px 0px, ${width}px ${distance / slope}px, ${width}px ${(distance + thickness) / slope}px, ${width - distance - thickness}px 0px)`;
    const options: KeyframeAnimationOptions = { duration: 850, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards" };
    const opening = reveal.current.animate([
      { clipPath: triangle(initial) }, { clipPath: triangle(end) },
    ], options);
    const turning = paper.current.animate([
      { clipPath: fold(initial, 0), opacity: 0 },
      { clipPath: fold(initial + (end - initial) * .18, 100), opacity: 1, offset: .18 },
      { clipPath: fold(end, 100), opacity: 1 },
    ], options);
    let cancelled = false;
    opening.finished.then(() => {
      if (!cancelled) router.push("/playground");
    }).catch(() => {});
    return () => {
      cancelled = true;
      opening.cancel(); turning.cancel();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [origin, router]);

  function open(next: PeelOrigin) {
    if (busy.current) return;
    busy.current = true;
    router.prefetch("/playground");
    setOrigin(next);
  }

  return <PagePeelContext.Provider value={open}>
    <div data-page-peeling={origin ? "true" : undefined} inert={origin ? true : undefined}>{children}</div>
    {origin && <div className="v3-page-peel" aria-hidden="true" inert>
      <div className="v3-page-peel-reveal" ref={reveal}>
        <Desktop />
        <span className="v3-playground-back">← Back to portfolio</span>
      </div>
      <div className="v3-page-peel-paper" ref={paper} />
    </div>}
  </PagePeelContext.Provider>;
}

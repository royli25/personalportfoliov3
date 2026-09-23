"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type Transition = { from: string; to: string; direction: "in" | "out" };

/** Reveal a study in tiles; remove those same tiles in reverse when returning. */
export function CaseStudyTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const content = useRef<HTMLDivElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const snapshot = useRef<HTMLElement | null>(null);
  const scrollPositions = useRef<{ index: number; left: number; top: number }[]>([]);
  const [transition, setTransition] = useState<Transition | null>(null);
  const busy = useRef(false);

  function open(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || url.pathname === pathname) return;
    const entering = url.pathname.startsWith("/work/");
    const leaving = pathname.startsWith("/work/") && url.pathname === "/";
    if (!entering && !leaving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    event.stopPropagation();
    if (busy.current || !content.current) return;
    busy.current = true;
    const source = content.current;
    const copy = source.cloneNode(true) as HTMLElement;
    scrollPositions.current = Array.from(source.querySelectorAll<HTMLElement>("*")).flatMap((element, index) =>
      element.scrollLeft || element.scrollTop ? [{ index, left: element.scrollLeft, top: element.scrollTop }] : []);
    const originals = source.querySelectorAll("canvas");
    copy.querySelectorAll("canvas").forEach((canvas, index) => {
      const original = originals[index];
      if (original?.width && original.height) canvas.getContext("2d")?.drawImage(original, 0, 0);
    });
    // Preserve viewport-pinned navigation when the page snapshot is translated
    // by its scroll offset. Otherwise its fixed children would jump offscreen.
    const sourceElements = source.querySelectorAll<HTMLElement>("*");
    copy.querySelectorAll<HTMLElement>("*").forEach((element, index) => {
      const original = sourceElements[index];
      if (getComputedStyle(original).position !== "fixed") return;
      const rect = original.getBoundingClientRect();
      Object.assign(element.style, {
        position: "absolute", top: `${rect.top + window.scrollY}px`, left: `${rect.left}px`,
        right: "auto", bottom: "auto", width: `${rect.width}px`, height: `${rect.height}px`, transform: "none",
      });
    });
    copy.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
    copy.querySelectorAll("img").forEach(img => { img.loading = "eager"; });
    copy.style.cssText = `position:absolute;left:0;top:0;width:${source.clientWidth}px;transform:translateY(-${window.scrollY}px);pointer-events:none;`;
    snapshot.current = copy;
    setTransition({ from: pathname, to: url.pathname, direction: leaving ? "out" : "in" });
    router.push(url.pathname + url.search + url.hash);
  }

  useLayoutEffect(() => {
    if (!transition) return;
    background.current?.replaceChildren(...(snapshot.current ? [snapshot.current] : []));
    const copiedElements = snapshot.current?.querySelectorAll<HTMLElement>("*");
    for (const position of scrollPositions.current) {
      const element = copiedElements?.[position.index];
      if (element) { element.scrollLeft = position.left; element.scrollTop = position.top; }
    }
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      if (content.current) content.current.style.clipPath = "";
      if (background.current) background.current.style.clipPath = "";
      snapshot.current = null;
      busy.current = false;
      setTransition(null);
    };
    const preference = () => { if (reduced.matches) finish(); };
    reduced.addEventListener("change", preference);
    // Uncover normal navigation if it is redirected or fails to arrive.
    const timeout = window.setTimeout(finish, 8000);
    if (pathname !== transition.from && pathname !== transition.to) finish();
    else if (pathname === transition.to) {
      const start = performance.now();
      const paint = (now: number) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cell = 64;
        const columns = Math.ceil(width / cell);
        const rows = Math.ceil(height / cell);
        const progress = Math.max(0, Math.min(1, (now - start) / 1000));
        const coverage = transition.direction === "out" ? 1 - progress : progress;
        const count = Math.floor(coverage * columns * rows);
        const row = Math.floor(count / columns);
        const x = Math.min(width, count % columns * cell);
        const y = Math.min(height, row * cell);
        const nextY = Math.min(height, (row + 1) * cell);
        const surface = transition.direction === "out" ? background.current : content.current;
        if (surface) surface.style.clipPath = `polygon(0 0, ${width}px 0, ${width}px ${y}px, ${x}px ${y}px, ${x}px ${nextY}px, 0 ${nextY}px)`;
        if (progress < 1) frame = requestAnimationFrame(paint);
        else finish();
      };
      frame = requestAnimationFrame(paint);
    }
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      reduced.removeEventListener("change", preference);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [transition, pathname]);

  return <div className="v3-route-stage" data-revealing={transition ? "true" : undefined} data-direction={transition?.direction}>
    <div ref={content} className="v3-route-content" onClickCapture={open} inert={transition ? true : undefined}
      style={transition?.direction === "in" ? { clipPath: "inset(0 100% 100% 0)" } : undefined}>{children}</div>
    {transition && <div className="v3-route-background" ref={background} aria-hidden="true" inert />}
  </div>;
}

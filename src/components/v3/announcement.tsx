"use client";

import { useEffect, useRef } from "react";

const announcement = "Currently looking for internship opportunities. Bullish on prediction markets agentic commerce jev instinct & muse (personal AI) design environment tools (paper design, noon, rivet, etc.)";

export function Announcement() {
  const viewport = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = viewport.current!;
    const content = text.current!;
    const banner = container.parentElement!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let animation: Animation | undefined;
    let hovered = false;
    let focused = false;
    const sync = () => {
      if (hovered || focused || document.hidden) animation?.pause();
      else animation?.play();
    };
    const build = () => {
      animation?.cancel();
      animation = undefined;
      const distance = Math.max(0, content.scrollWidth - container.clientWidth);
      if (reduced.matches || distance === 0) return;
      container.scrollLeft = 0;
      const travel = distance / 40 * 1000;
      const duration = travel + 4000;
      animation = content.animate([
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: 2000 / duration },
        { transform: `translateX(-${distance}px)`, offset: (2000 + travel) / duration },
        { transform: `translateX(-${distance}px)`, offset: 1 },
      ], { duration, iterations: Infinity, easing: "linear" });
      sync();
    };
    const enter = () => { hovered = finePointer.matches; sync(); };
    const leave = () => { hovered = false; sync(); };
    const focus = () => { focused = true; sync(); };
    const blur = () => { focused = false; sync(); };
    const observer = new ResizeObserver(build);
    observer.observe(container);
    observer.observe(content);
    reduced.addEventListener("change", build);
    banner.addEventListener("pointerenter", enter);
    banner.addEventListener("pointerleave", leave);
    container.addEventListener("focus", focus);
    container.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", sync);
    build();
    return () => {
      animation?.cancel();
      observer.disconnect();
      reduced.removeEventListener("change", build);
      banner.removeEventListener("pointerenter", enter);
      banner.removeEventListener("pointerleave", leave);
      container.removeEventListener("focus", focus);
      container.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <div className="v3-announcement">
    <div className="v3-announcement-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Internship availability and interests">
      <span ref={text} className="v3-announcement-text">{announcement}</span>
    </div>
  </div>;
}

"use client";
import { useEffect, useRef, useState } from "react";
import { Portfolio } from "@/components/v3/portfolio";
import { Desktop } from "@/desktop/desktop";
import { DesktopBackdrop } from "@/desktop/backdrop";
import type { Tile } from "@/data/site";
export type SceneProps = { visuals: Tile[]; components: Tile[] };
type Mode = "weighted" | "hinge" | "drop";

export function PhysicsScene({ mode, ...props }: SceneProps & { mode: Mode }) {
  const root = useRef<HTMLDivElement>(null);
  const fold = useRef<HTMLSpanElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const inverse = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const open = useRef(false);
  const [done, setDone] = useState(false);
  const [opening, setOpening] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reduced.current = media.matches; };
    update(); media.addEventListener("change", update);
    let frame = 0, last = 0, x = 0, velocity = 0, tilt = 0, tiltV = 0;
    let travel = 0, travelV = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30); last = now;
      // Semi-implicit integration with substeps preserves momentum on reversals.
      const steps = 4, h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const stiffness = mode === "hinge" ? 240 : mode === "drop" ? 310 : 390;
        const damping = mode === "hinge" ? 16 : mode === "drop" ? 25 : 31;
        velocity += ((target.current - x) * stiffness - velocity * damping) * h;
        x += velocity * h;
        const sag = mode === "hinge" ? 11 : mode === "drop" ? 7 : 3;
        tiltV += ((x * sag + pointer.current.y * x * 3 - tilt) * 160 - tiltV * 13) * h;
        tilt += tiltV * h;
        if (open.current) {
          // Downward acceleration plus air resistance; hinge releases after a small tug.
          travelV += (mode === "weighted" ? 7.5 : mode === "hinge" ? 8.8 : 11) * h;
          travelV *= Math.exp(-0.5 * h);
          travel += travelV * h;
        }
      }
      if (reduced.current) { x = target.current; tilt = 0; if (open.current) travel = 3; }
      const width = innerWidth, height = innerHeight;
      const base = width <= 700 ? 112 : 161;
      const pull = 1 + x * (mode === "hinge" ? .38 : .28) + pointer.current.x * x * .06;
      const fall = 1 + x * (mode === "weighted" ? .12 : .22);
      const expand = open.current && mode === "weighted" ? travel * (width + height) / base : 0;
      const sx = pull + expand, sy = fall + expand * 1.18;
      if (fold.current) fold.current.style.transform = `translateY(${open.current && mode !== "weighted" ? travel * 25 : 0}px) scale(${sx}, ${sy}) skewY(${-tilt * (open.current ? Math.max(0, 1 - travel) : 1)}deg)`;
      // The reveal mask transforms; the inverse transform keeps the wallpaper stationary.
      if (reveal.current) reveal.current.style.transform = `scale(${sx}, ${sy})`;
      if (inverse.current) inverse.current.style.transform = `scale(${1 / sx}, ${1 / sy})`;
      if (sheet.current && open.current && mode !== "weighted") {
        const angle = mode === "hinge" ? -travel * 44 : -travel * 13;
        const dx = mode === "hinge" ? -travel * width * .3 : -travel * width * .09;
        sheet.current.style.transform = `translate(${dx}px, ${travel * height}px) rotate(${angle}deg)`;
      }
      const finished = open.current && (mode === "weighted" ? base * sx > width + height : travel > 1.8);
      if (finished) { setDone(true); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", update); };
  }, [mode]);

  function release() {
    if (open.current) return;
    open.current = true; setOpening(true); target.current = 1;
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return <div className="gravity-scene" ref={root} data-mode={mode} data-opening={opening || undefined}>
    {opening && <div className="gravity-destination" inert={!done}><Desktop backToPortfolio={false} warm={false} /></div>}
    {!done && <div className="gravity-sheet" ref={sheet} inert={opening}>
      <Portfolio {...props} />
      <div className="gravity-corner">
        <div className="gravity-reveal" ref={reveal}><div className="gravity-inverse" ref={inverse}><DesktopBackdrop /></div></div>
        <span className="gravity-fold" ref={fold} aria-hidden="true"><img src="/figma/fold.svg" alt="" /></span>
        <button className="gravity-hit" aria-label="Peel corner to open playground"
          onPointerEnter={() => { target.current = 1; }} onPointerLeave={() => { if (!open.current) { target.current = 0; pointer.current = {x: 0, y: 0}; } }}
          onPointerMove={event => { const r = event.currentTarget.getBoundingClientRect(); pointer.current = { x: (r.right - event.clientX) / r.width, y: (event.clientY - r.top) / r.height }; }}
          onFocus={() => { target.current = 1; }} onBlur={() => { if (!open.current) target.current = 0; }} onClick={release} />
      </div>
    </div>}
    <p className="gravity-hint">{done ? "R to fold the page back" : "Hover corner · click to release"}</p>
  </div>;
}

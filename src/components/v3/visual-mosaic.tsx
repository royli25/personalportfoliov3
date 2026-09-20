"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Tile } from "@/data/site";

export function VisualMosaic({ tiles, onPreview }: { tiles: Tile[]; onPreview: (tile: Tile) => void }) {
  const [start, setStart] = useState(0);
  const [perRow, setPerRow] = useState(4);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = Math.min(perRow * 2, tiles.length);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReducedMotion(media.matches);
    const visibility = () => setHidden(document.hidden);
    preference(); visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    const resize = new ResizeObserver(([entry]) => {
      setPerRow(entry.contentRect.width <= 600 ? 3 : 4);
    });
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    if (root.current) { resize.observe(root.current); observer.observe(root.current); }
    return () => { resize.disconnect(); observer.disconnect(); media.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || !visible || reducedMotion || hidden || tiles.length <= count) return;
    const timer = window.setInterval(() => setStart(value => (value + count) % tiles.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, visible, reducedMotion, hidden, count, tiles.length]);

  if (!tiles.length) return null;
  const current = Array.from({ length: count }, (_, i) => tiles[(start + i) % tiles.length]);
  const split = Math.ceil(current.length / 2);
  const rows = [current.slice(0, split), current.slice(split)].filter(row => row.length);

  return <div className="v3-mosaic" ref={root} aria-label="Visuals mosaic" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="v3-mosaic-controls">
      <span>Prop 1.1 Visuals</span>
    </div>
    <MosaicTrack key={`${start}-${perRow}`} rows={rows} onPreview={onPreview} onInteract={() => setPaused(true)} />
  </div>;
}

function MosaicTrack({ rows, onPreview, onInteract }: { rows: Tile[][]; onPreview: (tile: Tile) => void; onInteract: () => void }) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  function updateEdges() {
    const element = viewport.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    element.querySelectorAll<HTMLButtonElement>(".v3-mosaic-tile").forEach(tile => {
      const rect = tile.getBoundingClientRect();
      tile.classList.toggle("v3-mosaic-tile-edge", rect.left < bounds.left - 1 || rect.right > bounds.right + 1);
    });
  }

  useLayoutEffect(() => {
    const element = viewport.current!;
    const center = () => {
      element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
      updateEdges();
    };
    center();
    const resize = new ResizeObserver(center);
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  function finishDrag() {
    drag.current = null;
    setDragging(false);
  }

  return <div className={`v3-mosaic-stage${dragging ? " is-dragging" : ""}`} ref={viewport}
    onScroll={updateEdges} onWheel={onInteract}
    onPointerDown={event => {
      suppressClick.current = false;
      onInteract();
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { id: event.pointerId, x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
    }}
    onPointerMove={event => {
      const gesture = drag.current;
      if (!gesture || gesture.id !== event.pointerId) return;
      const distance = event.clientX - gesture.x;
      if (!gesture.moved && Math.abs(distance) < 6) return;
      if (!gesture.moved) {
        gesture.moved = true;
        suppressClick.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }
      event.preventDefault();
      event.currentTarget.scrollLeft = gesture.scroll - distance;
    }}
    onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
    onPointerLeave={() => { if (!drag.current?.moved) finishDrag(); }}
    onClickCapture={event => {
      if (suppressClick.current && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }
    }}>
    {rows.map((tiles, index) => <div className="v3-mosaic-row" key={index}>
      <div className="v3-mosaic-row-inner">
      {tiles.map(tile => <button className="v3-tile v3-mosaic-tile" key={tile.src} onClick={() => onPreview(tile)} aria-label={`Preview ${tile.alt}`}>
        <img src={tile.src} alt={tile.alt ?? ""} width={tile.width} height={tile.height} loading="lazy" draggable={false} />
      </button>)}
      </div>
    </div>)}
  </div>;
}

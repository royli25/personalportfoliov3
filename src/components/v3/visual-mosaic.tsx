"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Tile } from "@/data/site";

export function VisualMosaic({ tiles, onPreview }: { tiles: Tile[]; onPreview: (tile: Tile) => void }) {
  if (!tiles.length) return null;
  const split = Math.ceil(tiles.length / 2);
  const rows = [tiles.slice(0, split), tiles.slice(split)].filter(row => row.length);

  return <div className="v3-mosaic" aria-label="Visuals mosaic">
    <div className="v3-mosaic-controls">
      <span>Prop 1.1 Visuals</span>
    </div>
    <MosaicTrack rows={rows} onPreview={onPreview} />
  </div>;
}

function MosaicTrack({ rows, onPreview }: { rows: Tile[][]; onPreview: (tile: Tile) => void }) {
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
    onScroll={updateEdges}
    onPointerDown={event => {
      suppressClick.current = false;
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

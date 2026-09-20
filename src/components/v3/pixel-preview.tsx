"use client";

import { useLayoutEffect, useRef } from "react";
import type { Tile } from "@/data/site";

export function PixelPreview({ tile }: { tile: Tile }) {
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const img = image.current!;
    const output = canvas.current!;
    const container = wrapper.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let finished = false;
    let started = false;
    let lastWidth = 0;
    let lastHeight = 0;

    const reveal = () => {
      if (!img.complete || !img.naturalWidth) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      if (started && width === lastWidth && height === lastHeight && !reduced.matches) return;
      lastWidth = width;
      lastHeight = height;
      cancelAnimationFrame(frame);
      if (finished || reduced.matches) {
        container.dataset.complete = "true";
        finished = true;
        return;
      }
      const context = output.getContext("2d");
      if (!context) { container.dataset.complete = "true"; return; }
      started = true;
      const ratio = window.devicePixelRatio || 1;
      output.width = Math.round(width * ratio);
      output.height = Math.round(height * ratio);
      // Render the source once, then copy contiguous integer-sized cells.
      // This avoids independently animated masks restarting and leaving holes.
      const buffer = document.createElement("canvas");
      buffer.width = output.width;
      buffer.height = output.height;
      const source = buffer.getContext("2d")!;
      const scale = Math.min(buffer.width / img.naturalWidth, buffer.height / img.naturalHeight);
      const imageWidth = Math.round(img.naturalWidth * scale);
      const imageHeight = Math.round(img.naturalHeight * scale);
      const left = Math.round((buffer.width - imageWidth) / 2);
      const top = Math.round((buffer.height - imageHeight) / 2);
      source.drawImage(img, left, top, imageWidth, imageHeight);
      const cell = Math.max(1, Math.round(32 * ratio));
      const columns = Math.ceil(imageWidth / cell);
      const rows = Math.ceil(imageHeight / cell);
      const total = columns * rows;
      let drawn = 0;
      const start = performance.now() + 500;
      const paint = (now: number) => {
        const progress = Math.max(0, Math.min(1, (now - start) / 1000));
        const target = Math.floor(progress * total);
        while (drawn < target) {
          const column = Math.floor(drawn / rows);
          const position = drawn % rows;
          const row = column % 2 === 0 ? position : rows - 1 - position;
          const x = left + column * cell;
          const y = top + row * cell;
          const w = Math.min(cell, left + imageWidth - x);
          const h = Math.min(cell, top + imageHeight - y);
          context.drawImage(buffer, x, y, w, h, x, y, w, h);
          drawn++;
        }
        if (progress < 1) frame = requestAnimationFrame(paint);
        else { finished = true; container.dataset.complete = "true"; }
      };
      frame = requestAnimationFrame(paint);
    };
    const fail = () => { cancelAnimationFrame(frame); container.dataset.complete = "true"; };
    const resize = new ResizeObserver(reveal);
    resize.observe(container);
    img.addEventListener("load", reveal);
    img.addEventListener("error", fail);
    reduced.addEventListener("change", reveal);
    reveal();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      img.removeEventListener("load", reveal);
      img.removeEventListener("error", fail);
      reduced.removeEventListener("change", reveal);
    };
  }, []);

  return <div className="v3-pixel-preview" ref={wrapper}>
    <img ref={image} src={tile.src} alt={tile.alt ?? ""} width={tile.width} height={tile.height} />
    <canvas ref={canvas} aria-hidden="true" />
  </div>;
}

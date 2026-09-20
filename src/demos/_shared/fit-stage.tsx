"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Scales a fixed-canvas demo to fill whatever viewport it's given, preserving
 * aspect. This is what makes the Electron recording shell resizable: the
 * window keeps the canvas aspect (main.js pins it), and this fills the window
 * with the whole product at any size. In a mismatched-aspect browser window
 * it letterboxes on the page background instead.
 */
export function FitStage({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(r.width / width, r.height / height));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  return (
    <div
      ref={ref}
      className="flex h-screen w-screen items-center justify-center overflow-hidden"
    >
      {/* First paint waits for the measurement — a wrong-scale flash reads as a glitch. */}
      {scale !== null && (
        <div style={{ width: width * scale, height: height * scale }}>
          <div
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

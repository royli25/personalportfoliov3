import type { ReactNode } from "react";

/**
 * Demos — shared frame.
 *
 * Every demo is authored at one fixed canvas size and *transform*-scaled into
 * whatever column it's dropped into. Scaling instead of reflowing keeps every
 * measurement in the design honest — the mock never rearranges into a layout
 * the canvas never had. The outer box reserves the scaled footprint so the
 * page doesn't collapse around it.
 *
 * Demos pin their own light palette (see each demo's LIGHT_SCOPE): they are
 * product mocks, and stay light when the site flips to dark.
 */
export function DeviceFrame({
  children,
  width,
  height,
  scale,
  chrome = true,
  className = "",
}: {
  children: ReactNode;
  width: number;
  height: number;
  /** 1 = canvas size. 0.5 renders a 1440 canvas in a 720px column. */
  scale: number;
  /** Border + shadow shell. Turn off when the page provides its own stage. */
  chrome?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden ${
        chrome
          ? "rounded-[12px] border border-[#e3e3e3] bg-white shadow-[0_4px_14.4px_0_rgba(0,0,0,0.25)]"
          : ""
      } ${className}`}
      style={{
        colorScheme: "light",
        width: width * scale,
        height: height * scale,
      }}
    >
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
  );
}

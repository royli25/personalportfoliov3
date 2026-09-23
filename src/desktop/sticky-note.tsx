"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * A Stickies pad on the wallpaper — furniture, not an app.
 *
 * Chrome follows Apple's Stickies window: a yellow square, a title strip
 * that exists only while the note is key, a hairline border. Unselected it
 * is just paper. Selected, you can drag it, pull an edge, and type — the
 * same three things the real pad does.
 *
 * It is not in the registry on purpose. A dock icon would promise a
 * product; this is a note left on the desktop. Windows cover it the way
 * a real window covers a Stickies pad.
 *
 * Colours are raw hex. The site's dark ramp remaps `white` / `neutral-*`,
 * and a yellow pad drawn through those tokens would print as charcoal.
 *
 * Drag and resize write the frame onto the node during the gesture (1:1
 * with the pointer, grab offset respected) and commit to React on release.
 * A setState on every move would be a render between the hand and the pad.
 */

const SIZE = 240;
const MIN = 160;
const HIT = 6;
const BANNER = 18;
const THRESHOLD = 4;

const YELLOW = "#fff6a3";
const BANNER_TOP = "#f3d34c";
const BANNER_BOT = "#e4c22e";
const INK = "#1d1d1f";

const SEED = [
  "Exit Here ----------->",
  "",
  "Gentle Reminder: Fullscreen for the full experience.",
  "",
  "This playground is still in progress, but it's an opportunity to click around and play with live coded demo's of products I've designed.",
].join("\n");

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type Frame = { left: number; top: number; width: number; height: number };

type Gesture =
  | { kind: "move"; ox: number; oy: number; start: Frame; dragged: boolean }
  | { kind: "resize"; edge: Edge; origin: { x: number; y: number }; start: Frame };

const EDGES: { edge: Edge; cursor: string; style: CSSProperties }[] = [
  { edge: "n", cursor: "ns-resize", style: { top: 0, left: HIT, right: HIT, height: HIT } },
  { edge: "s", cursor: "ns-resize", style: { bottom: 0, left: HIT, right: HIT, height: HIT } },
  { edge: "e", cursor: "ew-resize", style: { top: HIT, right: 0, bottom: HIT, width: HIT } },
  { edge: "w", cursor: "ew-resize", style: { top: HIT, left: 0, bottom: HIT, width: HIT } },
  { edge: "nw", cursor: "nwse-resize", style: { top: 0, left: 0, width: HIT * 2, height: HIT * 2 } },
  { edge: "ne", cursor: "nesw-resize", style: { top: 0, right: 0, width: HIT * 2, height: HIT * 2 } },
  { edge: "sw", cursor: "nesw-resize", style: { bottom: 0, left: 0, width: HIT * 2, height: HIT * 2 } },
  { edge: "se", cursor: "nwse-resize", style: { bottom: 0, right: 0, width: HIT * 2, height: HIT * 2 } },
];

function localPoint(e: PointerEvent, layer: HTMLElement) {
  const r = layer.getBoundingClientRect();
  const sx = r.width / layer.clientWidth || 1;
  const sy = r.height / layer.clientHeight || 1;
  return { x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sy };
}

function clampFrame(next: Frame, layer: HTMLElement): Frame {
  const maxL = Math.max(0, layer.clientWidth - 48);
  const maxT = Math.max(0, layer.clientHeight - 48);
  return {
    ...next,
    left: Math.min(Math.max(next.left, 48 - next.width), maxL),
    top: Math.min(Math.max(next.top, 0), maxT),
    width: Math.max(MIN, next.width),
    height: Math.max(MIN, next.height),
  };
}

function moved(start: Frame, edge: Edge, dx: number, dy: number): Frame {
  let { left, top, width, height } = start;
  if (edge.includes("e")) width = start.width + dx;
  if (edge.includes("s")) height = start.height + dy;
  if (edge.includes("w")) {
    width = start.width - dx;
    left = start.left + dx;
  }
  if (edge.includes("n")) {
    height = start.height - dy;
    top = start.top + dy;
  }
  if (width < MIN) {
    if (edge.includes("w")) left = start.left + start.width - MIN;
    width = MIN;
  }
  if (height < MIN) {
    if (edge.includes("n")) top = start.top + start.height - MIN;
    height = MIN;
  }
  return { left, top, width, height };
}

export function StickyNote({ topInset = 40 }: { topInset?: number }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const frameRef = useRef<Frame>({ left: 40, top: 40, width: SIZE, height: SIZE });
  /* The parked poster mounts while its pane is `hidden` (width 0). Keep
     pinning top-right until the person moves it, so revealing the pane
     doesn't leave the note at the 40,40 fallback. */
  const pinned = useRef(true);

  const [selected, setSelected] = useState(false);
  const [frame, setFrame] = useState<Frame>(frameRef.current);
  const [text, setText] = useState(SEED);

  /* Default sits top-right so "Exit Here ----------->" points at the
     panel's close. */
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const pin = () => {
      if (!pinned.current || layer.clientWidth <= 0) return;
      const next: Frame = {
        left: Math.max(40, layer.clientWidth - SIZE - 64),
        top: topInset,
        width: SIZE,
        height: SIZE,
      };
      frameRef.current = next;
      setFrame(next);
    };
    pin();
    const ro = new ResizeObserver(pin);
    ro.observe(layer);
    return () => ro.disconnect();
  }, [topInset]);

  const paint = useCallback((next: Frame) => {
    const layer = layerRef.current;
    const el = noteRef.current;
    if (!layer || !el) return;
    const clamped = clampFrame(next, layer);
    frameRef.current = clamped;
    el.style.left = `${clamped.left}px`;
    el.style.top = `${clamped.top}px`;
    el.style.width = `${clamped.width}px`;
    el.style.height = `${clamped.height}px`;
  }, []);

  const commit = useCallback(() => {
    setFrame(frameRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !selected) return;
      /* Capture, so the desktop's Escape (quit / leave) does not fire
         while this is the key window — one owner, innermost wins. */
      e.stopImmediatePropagation();
      setSelected(false);
      fieldRef.current?.blur();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [selected]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const note = noteRef.current;
      if (!note || note.contains(e.target as Node)) return;
      setSelected(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const g = gesture.current;
      const layer = layerRef.current;
      if (!g || !layer) return;
      const p = localPoint(e, layer);
      if (g.kind === "move") {
        const dx = p.x - g.ox;
        const dy = p.y - g.oy;
        if (!g.dragged && dx * dx + dy * dy < THRESHOLD * THRESHOLD) return;
        g.dragged = true;
        paint({
          ...g.start,
          left: g.start.left + dx,
          top: g.start.top + dy,
        });
      } else {
        paint(moved(g.start, g.edge, p.x - g.origin.x, p.y - g.origin.y));
      }
    };

    const onUp = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      const el = noteRef.current;
      if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      const wasDrag = g.kind === "resize" || g.dragged;
      gesture.current = null;
      if (wasDrag) pinned.current = false;
      commit();
      if (!wasDrag) fieldRef.current?.focus();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [commit, paint]);

  const beginMove = (e: ReactPointerEvent) => {
    const layer = layerRef.current;
    if (!layer) return;
    const p = localPoint(e.nativeEvent, layer);
    gesture.current = {
      kind: "move",
      ox: p.x,
      oy: p.y,
      start: { ...frameRef.current },
      dragged: false,
    };
    try {
      noteRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* Lost or synthetic pointers — window listeners still drive the gesture. */
    }
  };

  const beginResize = (e: ReactPointerEvent, edge: Edge) => {
    const layer = layerRef.current;
    if (!layer) return;
    e.preventDefault();
    e.stopPropagation();
    const p = localPoint(e.nativeEvent, layer);
    gesture.current = {
      kind: "resize",
      edge,
      origin: p,
      start: { ...frameRef.current },
    };
    try {
      noteRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* Same as beginMove — the gesture does not depend on capture. */
    }
  };

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      <aside
        ref={noteRef}
        aria-label="Desktop sticky note"
        data-selected={selected || undefined}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const was = selected;
          setSelected(true);
          const target = e.target as HTMLElement;
          if (target.closest("[data-edge]")) return;
          if (target.closest("[data-banner]") || !was) beginMove(e);
        }}
        className="pointer-events-auto absolute overflow-hidden text-[#1d1d1f]"
        style={{
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
          background: YELLOW,
          boxShadow: selected
            ? "0 10px 28px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(40,32,8,0.45)"
            : "0 6px 18px rgba(0,0,0,0.16), 0 1px 1px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(40,32,8,0.4)",
          colorScheme: "light",
          touchAction: "none",
        }}
      >
        <div
          data-banner
          aria-hidden
          className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[6px] ${
            selected ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{
            height: BANNER,
            background: `linear-gradient(180deg, ${BANNER_TOP} 0%, ${BANNER_BOT} 100%)`,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(40,32,8,0.18)",
            transition: "opacity 120ms var(--ease-out-strong)",
          }}
        >
          <span className="ml-[2px] h-[7px] w-[7px] border border-white/90" />
          <span className="flex items-center gap-[5px]">
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderBottom: "5px solid rgba(255,255,255,0.92)",
              }}
            />
            <span className="relative h-[7px] w-[8px] border border-white/90">
              <span className="absolute top-[1.5px] right-0 left-0 h-px bg-white/90" />
            </span>
          </span>
        </div>

        <textarea
          ref={fieldRef}
          aria-label="Sticky note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck
          className="h-full w-full resize-none bg-transparent px-[14px] pb-[12px] text-[13.5px] leading-[1.45] tracking-[-0.01em] outline-none"
          style={{
            color: INK,
            paddingTop: selected ? BANNER + 8 : 14,
            caretColor: INK,
          }}
        />

        {selected &&
          EDGES.map(({ edge, cursor, style }) => (
            <span
              key={edge}
              data-edge={edge}
              aria-hidden
              onPointerDown={(e) => beginResize(e, edge)}
              className="absolute z-20"
              style={{ ...style, cursor }}
            />
          ))}
      </aside>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./landing-splash.css";

const WORD = "royli.design";
const SEEN_KEY = "royli:intro-seen:v2";
let seenThisVisit = false;

/** The portfolio loads underneath; blue tiles uncover it along a rising snake path. */
export function LandingSplash({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"checking" | "playing" | "done">("checking");
  const cover = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    const intro = new URLSearchParams(location.search).get("intro");
    const slow = process.env.NODE_ENV === "development" && intro === "slow";
    const replay = intro === "replay" || slow;
    const timeScale = slow ? 3 : 1;
    let seen = seenThisVisit;
    try { seen ||= sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* Storage is optional. */ }
    if ((!replay && seen) || location.hash || new URLSearchParams(location.search).has("view") || window.scrollY > 0) {
      setPhase("done");
      return;
    }
    if (!cover.current || !content.current || !word.current || !cursor.current || !grid.current) {
      setPhase("done");
      return;
    }

    setPhase("playing");
    const screen = cover.current;
    const page = content.current;
    const title = word.current;
    const caret = cursor.current;
    const tiles = grid.current;
    const animations: Animation[] = [];
    const timers: number[] = [];
    let cancelled = false;
    let complete = false;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const easeOut = getComputedStyle(root).getPropertyValue("--ease-out-strong").trim() || "cubic-bezier(0.23, 1, 0.32, 1)";

    const play = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = element.animate(frames, { fill: "forwards", ...options, duration: Number(options.duration) * timeScale, delay: (options.delay ?? 0) * timeScale });
      animations.push(animation);
      return animation;
    };
    const later = (callback: () => void, delay: number) => {
      timers.push(window.setTimeout(() => {
        if (cancelled || complete) return;
        try { callback(); }
        catch (error) { console.error("Portfolio intro could not continue", error); end(); }
      }, delay * timeScale));
    };
    const end = () => {
      if (cancelled || complete) return;
      complete = true;
      seenThisVisit = true;
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* No persistence needed to enter. */ }
      const restoreFocus = document.activeElement === skip.current;
      page.inert = false;
      screen.style.display = "none";
      root.style.overflow = previousOverflow;
      timers.forEach(clearTimeout);
      animations.forEach(animation => animation.cancel());
      setPhase("done");
      if (restoreFocus) {
        const heading = page.querySelector<HTMLElement>("h1");
        heading?.setAttribute("tabindex", "-1");
        heading?.focus({ preventScroll: true });
      }
    };
    finish.current = end;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") end(); };
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", end);
    reduce.addEventListener("change", end);

    const start = () => {
      if (cancelled || complete) return;
      screen.dataset.stage = "typing";
      const letters = Array.from(title.querySelectorAll<HTMLElement>("[data-letter]"));
      if (reduce.matches) {
        letters.forEach(letter => { letter.style.opacity = "1"; });
        later(() => {
          play(screen, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: easeOut });
          later(end, 180);
        }, 240);
        return;
      }
      const titleBox = title.getBoundingClientRect();
      const offsets = letters.map(letter => letter.getBoundingClientRect().right - titleBox.left);
      // Uneven keystrokes give the short wordmark a human cadence.
      let elapsed = 220;
      const strokes = letters.map((letter, i) => {
        if (i > 0) elapsed += letter.textContent === "." || letters[i - 1].textContent === "." ? 160 : 85;
        return elapsed;
      });
      const typingDuration = strokes[strokes.length - 1];
      const revealAt = typingDuration + 290;
      play(caret, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: easeOut });
      // Typing is a discrete state change. Move the cursor and show its letter
      // in the same callback, so tiny delayed animations cannot drift apart.
      letters.forEach((letter, i) => later(() => {
        letter.style.opacity = "1";
        caret.style.transform = `translateX(${offsets[i]}px)`;
      }, strokes[i]));
      const reveal = async () => {
        try {
          // Keep tile dimensions close to square on phones and large monitors.
          const columns = Math.max(3, Math.min(12, Math.ceil(window.innerWidth / 220)));
          const rows = Math.max(3, Math.ceil(window.innerHeight / (window.innerWidth / columns)));
          tiles.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
          tiles.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
          tiles.replaceChildren();
          const path: { tile: HTMLDivElement; order: number; turn: boolean }[] = [];
          for (let row = 0; row < rows; row++) {
            const rowFromBottom = rows - 1 - row;
            const leftToRight = rowFromBottom % 2 === 0;
            for (let col = 0; col < columns; col++) {
              const cell = document.createElement("div");
              cell.className = "landing-snake-cell";
              const tile = document.createElement("div");
              tile.className = "landing-snake-tile";
              const across = leftToRight ? col : columns - 1 - col;
              const order = rowFromBottom * columns + across;
              const turn = across === columns - 1;
              tile.style.transformOrigin = turn ? "center top" : leftToRight ? "right center" : "left center";
              tile.dataset.order = String(order);
              cell.appendChild(tile);
              tiles.appendChild(cell);
              path.push({ tile, order, turn });
            }
          }
          // The tiles now provide the blue field, allowing each cleared cell
          // to expose the actual portfolio underneath without a duplicate page.
          screen.dataset.stage = "reveal";
          screen.style.background = "transparent";
          await play(title, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: easeOut }).finished;
          if (cancelled || complete) return;
          const stagger = Math.min(65, 1100 / Math.max(1, path.length - 1));
          await Promise.all(path.map(({ tile, order, turn }) => play(tile, [
            { transform: "scale(1, 1)" },
            { transform: turn ? "scale(1, 0)" : "scale(0, 1)" },
          ], { duration: 180, delay: order * stagger, easing: easeOut }).finished.then(() => { tile.dataset.revealed = "true"; })));
          end();
        } catch (error) {
          if (cancelled || complete) return;
          console.error("Portfolio intro could not complete", error);
          end();
        }
      };
      later(() => { void reveal(); }, revealAt);
    };
    // Wait for the pixel font before measuring character positions, with a fallback.
    let started = false;
    const startOnce = () => {
      if (started || cancelled || complete) return;
      started = true;
      try { start(); }
      catch (error) { console.error("Portfolio intro could not start", error); end(); }
    };
    document.fonts.ready.then(startOnce, startOnce);
    later(startOnce, 700);
    later(end, 6000); // A stalled animation must never block the portfolio.
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      animations.forEach(animation => animation.cancel());
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", end);
      reduce.removeEventListener("change", end);
      root.style.overflow = previousOverflow;
      tiles.replaceChildren();
      screen.style.background = "";
    };
  }, []);

  return <>
    <div ref={content} className="landing-content" inert={phase === "playing" ? true : undefined}>{children}</div>
    {phase !== "done" && <div ref={cover} className="landing-splash" role="region" aria-label="Roy Li introduction">
      <span className="sr-only">Roy Li — designing and building.</span>
      <div ref={grid} className="landing-snake-grid" aria-hidden="true" />
      <div className="landing-splash-word" ref={word} aria-hidden="true">
        {[...WORD].map((letter, i) => <span className={i >= 6 ? "landing-letter-orange" : undefined} data-letter key={i}>{letter}</span>)}
        <span className="landing-typing-cursor" ref={cursor}>
          <span className="landing-caret" />
          <svg className="landing-pointer" width="30" height="36" viewBox="0 0 30 36" fill="none">
            <path d="M3 2V28L10 21L16 33L22 30L16 19H27L3 2Z" fill="white" stroke="#0073ff" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <button ref={skip} className="landing-skip" onClick={() => finish.current()}>Skip intro <span aria-hidden="true">↗</span></button>
    </div>}
  </>;
}

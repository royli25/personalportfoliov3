"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Weighted from "./weighted";
import Hinge from "./hinge";
import Drop from "./drop";
import type { SceneProps } from "./scene";
import "./prototype.css";
const names = ["Weighted", "Hinge", "Freefall"];
const variants = [Weighted, Hinge, Drop];
export function Harness(props: SceneProps) {
  const [current, setCurrent] = useState(0);
  const [replay, setReplay] = useState(0);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const value = Number(new URLSearchParams(location.search).get("v"));
    if (value >= 1 && value <= 3) setCurrent(value - 1);
    const a = requestAnimationFrame(() => { const b = requestAnimationFrame(() => picker.current?.setAttribute("data-ready", "")); second = b; });
    let second = 0;
    return () => { cancelAnimationFrame(a); cancelAnimationFrame(second); };
  }, []);
  function select(i: number) {
    setCurrent(i); setReplay(n => n + 1);
    const url = new URL(location.href); url.searchParams.set("v", String(i + 1)); history.replaceState(null, "", url);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 3) select(n - 1);
      else if (e.key === "ArrowRight") { e.preventDefault(); select((current + 1) % 3); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); select((current + 2) % 3); }
      else if (e.key.toLowerCase() === "r") setReplay(n => n + 1);
    };
    document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key);
  }, [current]);
  useLayoutEffect(() => {
    const move = () => {
      const item = picker.current?.querySelectorAll<HTMLButtonElement>(".proto-picker-item")[current];
      if (item && highlight.current) { highlight.current.style.width = `${item.offsetWidth}px`; highlight.current.style.transform = `translateX(${item.offsetLeft}px)`; }
    };
    move(); window.addEventListener("resize", move); return () => window.removeEventListener("resize", move);
  }, [current]);
  const Variant = variants[current];
  return <><Variant key={`${current}-${replay}`} {...props} /><nav className="proto-picker" aria-label="Prototype variants" ref={picker}>
    <span className="proto-picker-highlight" aria-hidden="true" ref={highlight} />
    {names.map((name, i) => <button key={name} className="proto-picker-item" data-active={i === current ? "" : undefined} aria-current={i === current ? "true" : undefined} onClick={() => select(i)}>{name}</button>)}
    <span className="proto-picker-divider" aria-hidden="true" />
    <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setReplay(n => n + 1)}>↻</button>
  </nav></>;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A seekable playback clock for scripted demos.
 *
 * Deliberately NOT a chain of setTimeouts. Recording a flow takes a dozen
 * takes, and the difference between "re-shoot the last eight seconds" and
 * "re-shoot the whole thing" is whether the timeline can be scrubbed. One
 * rAF loop advancing a single number gives play / pause / seek / reset for
 * free, and makes every take frame-comparable.
 */
export type Clock = {
  /** Seconds since start. */
  time: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Absolute seek, clamped to [0, duration]. */
  seek: (seconds: number) => void;
  /** Relative seek — what the arrow keys use. */
  nudge: (delta: number) => void;
  reset: () => void;
};

export function useClock({
  duration,
  autoplay = false,
}: {
  duration: number;
  autoplay?: boolean;
}): Clock {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(autoplay);

  // The clock's real position lives in a ref so the rAF loop can advance it
  // without re-subscribing on every frame; state is the render mirror.
  const t = useRef(0);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    let raf = 0;
    const step = (now: number) => {
      if (last.current === null) last.current = now;
      // Clamped: browsers stop firing rAF for a backgrounded window, so the
      // first frame after you tab back reports a multi-second delta and the
      // take would lurch forward. Capping it costs nothing at 60fps and turns
      // an alt-tab mid-recording into a pause instead of a skip.
      const dt = Math.min((now - last.current) / 1000, 1 / 15);
      last.current = now;
      t.current = Math.min(t.current + dt, duration);
      setTime(t.current);
      if (t.current >= duration) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  const seek = useCallback(
    (seconds: number) => {
      t.current = Math.min(Math.max(seconds, 0), duration);
      last.current = null;
      setTime(t.current);
    },
    [duration],
  );

  return {
    time,
    playing,
    play: useCallback(() => setPlaying(true), []),
    pause: useCallback(() => setPlaying(false), []),
    toggle: useCallback(() => setPlaying((p) => !p), []),
    seek,
    nudge: useCallback((d: number) => seek(t.current + d), [seek]),
    reset: useCallback(() => {
      setPlaying(false);
      seek(0);
    }, [seek]),
  };
}

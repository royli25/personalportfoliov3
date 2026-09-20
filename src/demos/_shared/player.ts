"use client";

import { useEffect, useRef } from "react";

/** One scripted event: dispatch `do` once the clock passes `at` (seconds). */
export type Beat<A> = { at: number; do: A };

/**
 * Replays a beat list against a reducer as a clock advances.
 *
 * Seeking works because the actions are pure: rewinding dispatches a reset and
 * then fast-forwards every beat up to the new time in one synchronous pass, so
 * scrubbing to 0:40 lands on exactly the state playing to 0:40 would have. No
 * beat can ever fire twice, and none can be skipped by a dropped frame.
 */
export function useScript<A>({
  script,
  time,
  dispatch,
  reset,
}: {
  /** Must be sorted by `at`. */
  script: Beat<A>[];
  time: number;
  dispatch: (action: A) => void;
  /** Dispatched before a rewind replay. */
  reset: A;
}) {
  const cursor = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    // Rewound: rebuild from scratch rather than trying to invert actions.
    if (time < lastTime.current) {
      dispatch(reset);
      cursor.current = 0;
    }
    lastTime.current = time;

    while (cursor.current < script.length && script[cursor.current].at <= time) {
      dispatch(script[cursor.current].do);
      cursor.current += 1;
    }
  }, [time, script, dispatch, reset]);
}

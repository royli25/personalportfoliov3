"use client";

import { useCallback, useEffect, useReducer } from "react";
import { DeviceFrame } from "../_shared/device-frame";
import { useClock } from "../_shared/clock";
import { useScript } from "../_shared/player";
import { FRAME } from "./frame";
import { reducer } from "./state/reducer";
import { INITIAL_STATE } from "./state/types";
import type { DemoAction } from "./state/actions";
import { StudentDatabase } from "./screens/student-database";
import { StudentProfile } from "./screens/student-profile";
import { LiveMeeting } from "./screens/live-meeting";
import { ResourceKit } from "./screens/resource-kit";
import { MEETING_DURATION, MEETING_SCRIPT } from "./script/meeting-script";
import { EXTRACT_DURATION, EXTRACT_SCRIPT } from "./script/extract-script";

const MEETING_RESET: DemoAction = { type: "MEETING_RESET" };
const EXTRACT_RESET: DemoAction = { type: "EXTRACT_RESET" };

/**
 * BlueprintX, assembled.
 *
 * Two drivers, one reducer. The database and profile screens are hand-driven
 * (real typing, real clicks — that's the flow). The live meeting is
 * time-driven: a conversation happens *to* the advisor, so a script player
 * dispatches the same actions on a clock. Both compose — you can click
 * "Add to notes" on a card mid-playback and the script keeps running.
 *
 * You move between screens the way a user does — the sidebar. There is no
 * second entry point: one app, one route.
 *
 * Recording transport (only on the demo stage, never in an embed):
 *   space  play/pause      ← →  seek ±5s      R  reset
 */
export function BlueprintXDemo({
  scale = 1,
  chrome = false,
  /** Hidden keyboard transport — on for recording, off for case-study embeds. */
  controls = false,
  /**
   * Start the meeting the moment it opens, instead of waiting for the
   * transport. An embed has no transport to wait for — without this the
   * script's own screen sits at 0 with an empty transcript, which reads as a
   * broken product rather than a paused one. The recording stage leaves it
   * off: a take starts when you press space, not when you navigate.
   */
  autoplay = false,
}: {
  scale?: number;
  chrome?: boolean;
  controls?: boolean;
  autoplay?: boolean;
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const clock = useClock({ duration: MEETING_DURATION });
  const meetingLive = state.screen === "meeting";

  useScript({
    script: MEETING_SCRIPT,
    // A paused clock at 0 on another screen simply never fires a beat.
    time: meetingLive ? clock.time : 0,
    dispatch,
    reset: MEETING_RESET,
  });

  // Opening the meeting rewinds the take; leaving it stops the clock.
  const { reset: resetClock, play: playClock, pause } = clock;
  useEffect(() => {
    if (!meetingLive) {
      pause();
      return;
    }
    resetClock();
    if (autoplay) playClock();
  }, [meetingLive, autoplay, resetClock, playClock, pause]);

  // Flow C's extraction pass runs on its own small clock — same seekable
  // machinery, scoped to the modal's extracting stage. Entering the stage
  // rewinds and plays; leaving it (finished, dismissed, navigated away)
  // stops the loop.
  const extractClock = useClock({ duration: EXTRACT_DURATION });
  const extracting = state.resources.modal?.stage === "extracting";

  useScript({
    script: EXTRACT_SCRIPT,
    time: extracting ? extractClock.time : 0,
    dispatch,
    reset: EXTRACT_RESET,
  });

  const {
    reset: resetExtract,
    play: playExtract,
    pause: pauseExtract,
  } = extractClock;
  useEffect(() => {
    if (extracting) {
      resetExtract();
      playExtract();
    } else {
      pauseExtract();
    }
  }, [extracting, resetExtract, playExtract, pauseExtract]);

  const { toggle, nudge, reset } = clock;
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      // Never steal keys while a field has focus — the database screen's
      // search box lives one screen away and space/arrows are its job there.
      const el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        nudge(5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        nudge(-5);
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    },
    [toggle, nudge, reset],
  );

  useEffect(() => {
    if (!controls) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [controls, onKey]);

  return (
    <DeviceFrame
      width={FRAME.width}
      height={FRAME.height}
      scale={scale}
      chrome={chrome}
    >
      {state.screen === "database" && (
        <StudentDatabase state={state} dispatch={dispatch} />
      )}
      {state.screen === "profile" && (
        <StudentProfile state={state} dispatch={dispatch} />
      )}
      {state.screen === "meeting" && (
        <LiveMeeting state={state} dispatch={dispatch} elapsed={clock.time} />
      )}
      {state.screen === "resources" && (
        <ResourceKit state={state} dispatch={dispatch} />
      )}
    </DeviceFrame>
  );
}

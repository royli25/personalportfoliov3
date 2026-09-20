import type { Beat } from "../../_shared/player";
import type { DemoAction } from "../state/actions";
import { EXTRACTION } from "../data/resources";

/**
 * Flow C's extraction pass, as beats on the shared clock.
 *
 * Same contract as the meeting script: sorted `Beat[]`, seekable, no
 * setTimeout chains — re-shooting the add-resource take means scrubbing,
 * not re-clicking through the modal. The clock for this script lives in
 * app.tsx and runs only while the modal is on its extracting stage.
 *
 * Timing derives from the content: each step's read time is proportional to
 * what it claims to be doing. Reading a page is quick; pulling fields and
 * matching students are the "thinking" beats, so they hold longest. Total
 * ≈ 3.4s — long enough to read the checklist, short enough to never drag
 * in a 30-second cut.
 */
const LEAD_IN = 0.5;
const STEP_TIMES = [0.7, 0.5, 1.2, 0.8]; // seconds per EXTRACTION.steps entry
const SETTLE = 0.2; // pause on the finished checklist before review swaps in

function build(): Beat<DemoAction>[] {
  const beats: Beat<DemoAction>[] = [];
  let t = LEAD_IN;
  EXTRACTION.steps.forEach((_, i) => {
    t += STEP_TIMES[i];
    beats.push({ at: t, do: { type: "EXTRACT_ADVANCED", step: i + 1 } });
  });
  beats.push({ at: t + SETTLE, do: { type: "EXTRACT_FINISHED" } });
  return beats;
}

export const EXTRACT_SCRIPT: Beat<DemoAction>[] = build();

export const EXTRACT_DURATION =
  EXTRACT_SCRIPT[EXTRACT_SCRIPT.length - 1].at + 0.1;

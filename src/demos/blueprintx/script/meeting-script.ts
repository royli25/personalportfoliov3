import type { Beat } from "../../_shared/player";
import { MEETING_INSIGHTS, TRANSCRIPT } from "../data/meeting";
import type { DemoAction } from "../state/actions";

/**
 * The Live Meeting timeline, derived from the transcript rather than
 * hand-typed. Editing a line re-times everything after it automatically,
 * which is the only way the script survives rewriting the conversation.
 *
 * Everything here is a pure function of the content — no Math.random, no
 * Date.now. Two takes are frame-identical, which is what makes them cuttable
 * together in Screen Studio.
 */

/**
 * Embed pacing — roughly 1.7× real speech. A 30-second loop has to move, and
 * a viewer reading a transcript tolerates a faster reveal than a listener
 * would. Raise WPS to compress, not the gaps: the pauses are what make the
 * turns legible as separate people talking.
 */
/** Words per second of transcription reveal. */
const WPS = 5.0;
/** Words revealed per streaming beat — transcription emits phrases, not letters. */
const CHUNK = 2;
/** Beat between one speaker finishing and the next starting. */
const TURN_GAP = 0.25;
/** How long after a line settles before the assistant shows it's working. */
const THINK_DELAY = 0.2;
/** How long the processing state holds before the card lands. */
const PROCESS_TIME = 0.6;
/** Dead air before the first word, so the loop has a breath at the top. */
const LEAD_IN = 0.6;
/** Hold on the finished state before the loop's end. */
const TAIL = 2.0;

function build(): { beats: Beat<DemoAction>[]; duration: number } {
  const beats: Beat<DemoAction>[] = [];
  const byCause = new Map(MEETING_INSIGHTS.map((i) => [i.becauseOf, i]));
  let t = LEAD_IN;

  for (const u of TRANSCRIPT) {
    const words = u.text.split(" ").length;
    const spoken = words / WPS;

    // Stream the line in phrase chunks across its speaking time.
    for (let shown = CHUNK; shown < words; shown += CHUNK) {
      beats.push({
        at: round(t + (shown / words) * spoken),
        do: { type: "UTTERANCE_STREAMED", id: u.id, speaker: u.speaker, words: shown },
      });
    }
    beats.push({
      at: round(t + spoken),
      do: { type: "UTTERANCE_STREAMED", id: u.id, speaker: u.speaker, words },
    });
    // Interim text firms up a beat after the last word — the tell that this
    // is a live transcription and not a pre-written script being replayed.
    beats.push({ at: round(t + spoken + 0.2), do: { type: "UTTERANCE_SETTLED", id: u.id } });

    // A card this line causes surfaces while the next speaker is starting,
    // so it reads as the assistant keeping up rather than interrupting.
    const insight = byCause.get(u.id);
    if (insight) {
      beats.push({ at: round(t + spoken + THINK_DELAY), do: { type: "INSIGHT_PROCESSING" } });
      beats.push({
        at: round(t + spoken + THINK_DELAY + PROCESS_TIME),
        do: { type: "INSIGHT_SURFACED", id: insight.id },
      });
    }

    t += spoken + TURN_GAP;
  }

  beats.sort((a, b) => a.at - b.at);
  return { beats, duration: round(t - TURN_GAP + TAIL) };
}

const built = build();

export const MEETING_SCRIPT = built.beats;
export const MEETING_DURATION = built.duration;

function round(n: number) {
  return Math.round(n * 100) / 100;
}

"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  CardHeader,
  Chevron,
  CollapsedCard,
  DRAG,
  Dot,
  Icon,
  LIGHT_SCOPE,
  LivePill,
  NO_DRAG,
  Pill,
  TONE,
} from "../parts/primitives";
import { Sidebar } from "../parts/sidebar";
import { ActionChips, StudentCard } from "../parts/meeting";
import { FRAME } from "../frame";
import {
  MEETING_CLOCK_OFFSET,
  MEETING_INSIGHTS,
  MEETING_STUDENT,
  TRANSCRIPT,
  type MeetingInsight,
} from "../data/meeting";
import { NAV } from "../data/students";
import type { DemoAction } from "../state/actions";
import type { DemoState } from "../state/types";

export { FRAME } from "../frame";

/**
 * BlueprintX — Live Meeting.
 *
 * A pure render of `state.meeting` plus the clock's `elapsed` (which is
 * playback position, not demo state — the reducer would need a beat per frame
 * to hold it, and a frozen timer during a conversation reads as a bug).
 *
 * The gutter is the whole idea: speech and surfaced insights hang off one dot
 * rail, so an insight reads as something that happened *in* the meeting rather
 * than a notification stapled beside it.
 */

export function LiveMeeting({
  state,
  dispatch,
  elapsed,
}: {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
  /** Seconds of playback — rendered as the Live pill's clock. */
  elapsed: number;
}) {
  const m = state.meeting;
  const visible = MEETING_INSIGHTS.filter(
    (i) => m.surfaced.includes(i.id) && !m.dismissed.includes(i.id),
  ).sort((a, b) => m.surfaced.indexOf(a.id) - m.surfaced.indexOf(b.id));

  return (
    <div
      className="flex items-start overflow-hidden bg-white font-sans"
      style={{ ...LIGHT_SCOPE, width: FRAME.width, height: FRAME.height }}
    >
      <Sidebar
        groups={NAV}
        active="Live Meeting"
        onSelect={(screen) => dispatch({ type: "NAV_SELECTED", screen })}
      />

      <div className="flex h-full min-w-px flex-1 flex-col bg-[#f2f2f0] pr-[10px] pb-[10px]">
        <div
          className="flex h-[48px] w-full shrink-0 items-center bg-[#f2f2f0] px-[20px] py-[10px]"
          style={DRAG}
        >
          <div className="flex items-center gap-[12.5px]">
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "NAV_SELECTED", screen: "database" })
              }
              className="flex items-center"
              style={NO_DRAG}
            >
              <Icon name="breadcrumb-back" size={18} />
            </button>
            <div className="flex items-center gap-[8px] text-[13px] leading-[19px] whitespace-nowrap">
              <span className="text-[#6b6b6b]">Live Meeting</span>
              <span className="text-[#c9c9c9]">/</span>
              <span className="font-medium text-black">
                {MEETING_STUDENT.name}
              </span>
            </div>
          </div>
        </div>

        {/* Recessed body — inset panel, one step darker than the chrome. */}
        <div className="flex min-h-px w-full flex-1 items-start overflow-hidden rounded-[16px] border border-[#dfdfdf] bg-[#fafafa]">
          {/* Same pattern as the profile column: the stack scrolls and the ask
              bar floats over a scrim, so nothing in it ever gets compressed to
              make room. Every child is shrink-0 for the same reason. */}
          <div className="relative h-full min-w-px flex-1 bg-white/30">
            <div className="absolute inset-0 overflow-y-auto overscroll-contain p-[20px] pb-[110px] [scrollbar-width:none]">
              <div className="flex w-full flex-col gap-[10px]">
                <StudentCard student={MEETING_STUDENT} />
                <ActionChips
                  actions={[
                    { label: "Summarize so far", icon: "act-summarize" },
                    { label: "Catch up", icon: "act-catchup" },
                    { label: "Action items", icon: "act-actions" },
                    { label: "Suggest questions", icon: "act-questions" },
                  ]}
                />
                <Transcript state={state} elapsed={elapsed} />
                <CollapsedCard title="Academic Transcript" />
                <CollapsedCard title="Notes" />
              </div>
            </div>

            {/* Runs to the panel edge, not just to the top of the ask bar:
                the 20px strip *below* the bar is uncovered otherwise, and
                scrolled content peeks through it. Opaque before the bar's top
                edge so nothing shows around it. */}
            <div
              className="pointer-events-none absolute right-[20px] bottom-0 left-[20px] h-[150px]"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(250,250,250,0) 0%, rgba(250,250,250,0.62) 25%, rgba(250,250,250,1) 45%)",
              }}
            />
            <div className="absolute right-[20px] bottom-[20px] left-[20px] flex items-center gap-[10px] rounded-[35px] border border-[#e4e4e4] bg-white py-[10px] pr-[12px] pl-[18px] shadow-[0_2px_8px_0_rgba(0,0,0,0.05)]">
              <p className="min-w-px flex-1 text-[13px] leading-[18px] text-[rgba(0,0,0,0.6)]">
                Ask anything about this meeting…
              </p>
              <button
                type="button"
                className="flex items-center gap-[8px] rounded-[20px] border border-[#e4e4e4] bg-white px-[13px] py-[8px]"
              >
                <Icon name="send" size={12} />
                <span className="text-[12px] leading-[17px] font-medium whitespace-nowrap text-[rgba(0,0,0,0.6)]">
                  Ask
                </span>
              </button>
            </div>
          </div>

          <InsightsRail
            processing={m.processing}
            insights={visible}
            captured={m.captured}
            dispatch={dispatch}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- transcript */

function Transcript({ state, elapsed }: { state: DemoState; elapsed: number }) {
  const m = state.meeting;
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  // Follow the newest line, but stop following the moment you scroll up —
  // fighting the user for the scroll position is worse than losing the tail.
  useEffect(() => {
    const el = scroller.current;
    if (!el || !pinned.current) return;
    el.scrollTop = el.scrollHeight;
  }, [m.utterances, m.surfaced]);

  const rows: React.ReactNode[] = [];
  for (const u of m.utterances) {
    const source = TRANSCRIPT.find((t) => t.id === u.id);
    if (!source) continue;
    const words = source.text.split(" ");
    rows.push(
      <Row key={u.id} dot={u.speaker === "advisor" ? "#31507f" : "#b9b9b3"}>
        <p
          className={`min-w-px flex-1 text-[15px] leading-[22px] transition-colors duration-300 ${
            u.settled ? "text-[#1a1a1a]" : "text-[#8a8a85] italic"
          }`}
        >
          {words.slice(0, u.words).join(" ")}
        </p>
      </Row>,
    );

    // The docked row lands right under the line that caused it.
    const insight = MEETING_INSIGHTS.find(
      (i) => i.becauseOf === u.id && m.surfaced.includes(i.id),
    );
    if (insight) {
      rows.push(
        <Row key={`${u.id}-dock`} dot={TONE[insight.tone]}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-w-px flex-1 items-center gap-[9px] rounded-[10px] py-[9px] pr-[13px] pl-[11px]"
            style={{ background: mix(TONE[insight.tone], 0.92) }}
          >
            <p className="text-[12px] leading-[16px] font-medium whitespace-nowrap text-black">
              {insight.dockLabel}
            </p>
            <p className="text-[12px] leading-[16px] font-medium whitespace-nowrap text-[rgba(26,26,26,0.6)]">
              {insight.dockDetail}
            </p>
            <p className="min-w-px flex-1 text-right text-[10px] leading-[14px] text-[rgba(0,0,0,0.6)]">
              now
            </p>
          </motion.div>
        </Row>,
      );
    }
  }

  return (
    <Card className="flex w-full shrink-0 flex-col">
      <CardHeader title="Meeting Transcript">
        <LivePill elapsed={formatElapsed(elapsed)} />
        <Chevron direction="up" />
      </CardHeader>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinned.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        // Bounded rather than flex-1: an empty transcript shouldn't be a huge
        // blank box before playback, and a full one shouldn't push the cards
        // below it off the column.
        className="flex max-h-[430px] min-h-[300px] w-full flex-col gap-[10px] overflow-y-auto bg-[#fafafa] px-[18px] py-[16px] [scrollbar-width:none]"
      >
        {rows}
      </div>
    </Card>
  );
}

function Row({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full shrink-0 items-start">
      <div className="flex w-[20px] shrink-0 flex-col items-start self-stretch">
        <div className="flex min-h-[16px] w-[20px] flex-1 items-center">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ background: dot }}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- rail */

function InsightsRail({
  processing,
  insights,
  captured,
  dispatch,
}: {
  processing: boolean;
  insights: MeetingInsight[];
  captured: string[];
  dispatch: (action: DemoAction) => void;
}) {
  return (
    // No bottom padding on the rail itself: it would stop the scroll area
    // short of the panel edge, slicing the last card at an invisible line with
    // dead space under it. The breathing room moves inside the scroller.
    <div className="flex h-full w-[440px] shrink-0 flex-col gap-[12px] border-l border-[#ebebe7] bg-[#fafafa] px-[20px] pt-[22px]">
      <div className="flex w-full items-center justify-between whitespace-nowrap">
        <p className="text-[13px] leading-[16px] font-medium text-[#9b9b9b]">
          Surfacing Insights
        </p>
        <p className="text-[11px] leading-[16px] font-medium text-[#b0b0b0]">
          {insights.length}
        </p>
      </div>

      {/* Newest-first, so the top of the scroll is always the card that just
          landed — five of these overflow the rail, and the oldest scrolling
          out of view is the right thing to lose. */}
      <div className="flex min-h-px w-full flex-1 flex-col gap-[10px] overflow-y-auto pb-[22px] [scrollbar-width:none]">
        <AnimatePresence initial={false}>
          {processing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex w-[400px] shrink-0 items-center gap-[9px] rounded-[14px] border border-[#ececec] bg-white px-[16px] py-[14px]"
            >
              <Pulse />
              <span className="text-[12px] leading-[16px] text-[#9b9b9b]">
                Listening for something useful…
              </span>
            </motion.div>
          )}

          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              captured={captured.includes(insight.id)}
              dispatch={dispatch}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  captured,
  dispatch,
}: {
  insight: MeetingInsight;
  captured: boolean;
  dispatch: (action: DemoAction) => void;
}) {
  const ink = TONE[insight.tone];
  return (
    <motion.div
      layout
      // Pops in place, paired with its docked transcript row — never a
      // scroll-in, which reads as a list re-rendering rather than a find.
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      // shrink-0 is load-bearing: as a flex child this card would otherwise be
      // squashed by the column before the column ever scrolls, so a full rail
      // would compress every card instead of overflowing.
      className="w-[400px] shrink-0 overflow-hidden rounded-[14px] border border-[#e8e8e8] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)]"
    >
      {/* Tinted band carries the type; actions go neutral because the colour
          is already spent on the label. */}
      <div
        className="flex h-[44px] items-center justify-between px-[16px]"
        style={{ background: mix(ink, 0.9) }}
      >
        <span
          className="text-[14px] leading-[14px] font-medium"
          style={{ color: ink }}
        >
          {insight.type}
        </span>
        <div className="flex items-center gap-[14px] text-[12px] leading-[16px]">
          <button
            type="button"
            onClick={() => dispatch({ type: "INSIGHT_CAPTURED", id: insight.id })}
            className={`font-medium ${captured ? "text-[#2f7a44]" : "text-[#3a3a3a]"}`}
          >
            {captured ? "Added ✓" : "Add to notes"}
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "INSIGHT_DISMISSED", id: insight.id })
            }
            className="text-[#9b9b96]"
          >
            Dismiss
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[10px] px-[16px] pt-[14px] pb-[15px]">
        <p className="text-[15px] leading-[20px] font-semibold whitespace-nowrap text-[#1a1a1a]">
          {insight.title}
        </p>
        <p className="text-[13px] leading-[18px] whitespace-nowrap text-[#6b6b6b]">
          {insight.subtitle}
        </p>
        <div className="h-px w-full bg-[#efefef]" />
        <p className="text-[12px] leading-[16px] whitespace-nowrap text-[#9a9a9a]">
          {insight.facts}
        </p>
      </div>
    </motion.div>
  );
}

/** Three dots cycling — the assistant is working, without a spinner. */
function Pulse() {
  return (
    <span className="flex shrink-0 items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-[#c4c4c0]"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.16,
          }}
        />
      ))}
    </span>
  );
}

/* ----------------------------------------------------------------- helpers */

function formatElapsed(seconds: number) {
  // Offset so the pill reads as a moment inside a real session rather than a
  // 30-second meeting (see MEETING_CLOCK_OFFSET).
  const s = Math.max(0, Math.floor(seconds)) + MEETING_CLOCK_OFFSET;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Mix a hex toward white by `amount` (0 = the hex, 1 = white). */
function mix(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const t = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${t(r)}, ${t(g)}, ${t(b)})`;
}

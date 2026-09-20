"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  Chevron,
  DRAG,
  Icon,
  LIGHT_SCOPE,
  NO_DRAG,
} from "../parts/primitives";
import { Sidebar } from "../parts/sidebar";
import { ActionChips } from "../parts/meeting";
import { Monogram } from "./student-database";
import {
  NAV,
  FIT_TONE,
  getProfile,
  STUDENTS,
  type Note,
  type StudentRecord,
} from "../data/students";
import type { DemoAction } from "../state/actions";
import type { DemoState } from "../state/types";

/**
 * BlueprintX — Student Profile (canonical Figma frame `02 — Student Profile`,
 * 535:13019). Left: student card → action chips → 5-Minute Summary →
 * collapsed cards, in a scroll region whose content disappears *under* a
 * scrim + floating ask bar (the agreed pattern — never a hard clip).
 * Right: the Notes rail with a live composer.
 *
 * The collapsed card shows 4 school chips + "+11 more"; expanding renders all
 * 15 with a "Show less" chip — a `motion` layout animation, the transition the
 * film version had to fake with a cross-dissolve.
 */

export function StudentProfile({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}) {
  const record =
    STUDENTS.find((s) => s.id === state.openStudentId) ?? STUDENTS[0];
  const profile = getProfile(record.id);
  const added = state.addedNotes[record.id] ?? [];
  const notes: Note[] = [...added, ...profile.notes];

  return (
    <div
      className="flex items-start overflow-hidden bg-white font-sans"
      style={{ ...LIGHT_SCOPE, width: 1440, height: 900 }}
    >
      <Sidebar
        groups={NAV}
        active="Student Database"
        onSelect={(screen) => dispatch({ type: "NAV_SELECTED", screen })}
      />

      <div className="flex h-full min-w-px flex-1 flex-col bg-[#f2f2f0] pr-[10px] pb-[10px]">
        <ProfileBreadcrumb
          name={record.name}
          onBack={() => dispatch({ type: "BACKED_TO_DATABASE" })}
        />

        <div className="flex min-h-px w-full flex-1 items-start overflow-hidden rounded-[16px] border border-[#dfdfdf] bg-[#fafafa]">
          {/* ------------------------------------------------ section cards */}
          <div className="relative h-full min-w-px flex-1 bg-white/30">
            <div className="absolute inset-0 overflow-y-auto overscroll-contain p-[20px] pb-[150px] [scrollbar-width:none]">
              <div className="flex w-full flex-col gap-[10px]">
                <StudentIdentityCard
                  record={record}
                  stats={profile.stats}
                  targets={profile.targets}
                  expanded={state.schoolsExpanded}
                  onToggle={() => dispatch({ type: "SCHOOLS_TOGGLED" })}
                />

                <ActionChips
                  actions={[
                    { label: "5-min summary", icon: "act-summarize" },
                    { label: "Recap email", icon: "act-catchup" },
                    { label: "Book meeting", icon: "act-actions" },
                    { label: "Action items", icon: "act-questions" },
                  ]}
                />

                <SummaryCard
                  profile={profile}
                  open={state.summaryOpen}
                  onToggle={() => dispatch({ type: "SUMMARY_TOGGLED" })}
                />

                <CollapsedRow title="Academic Transcript" />
                <CollapsedRow
                  title="Meeting History"
                  count={profile.meetingHistoryCount}
                />
              </div>
            </div>

            {/* Content slides under this scrim, and the ask bar floats above
                it. Runs to the panel edge so nothing peeks through the strip
                below the bar. */}
            <div
              className="pointer-events-none absolute right-[20px] bottom-0 left-[20px] h-[150px]"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(250,250,250,0) 0%, rgba(250,250,250,0.62) 25%, rgba(250,250,250,1) 45%)",
              }}
            />
            <div className="absolute right-[20px] bottom-[20px] left-[20px]">
              <AskBar name={record.name.split(" ")[0]} />
            </div>
          </div>

          {/* -------------------------------------------------- notes rail */}
          <div className="flex h-full w-[440px] shrink-0 flex-col gap-[12px] border-l border-[#ebebe7] bg-[#fafafa] px-[20px] py-[22px]">
            <div className="flex w-full items-center gap-[10px]">
              <span className="text-[12px] leading-[16px] font-medium text-[#6b6b6b]">
                Notes
              </span>
              <span className="inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#ededea] px-[7px] text-[11px] leading-none text-[#6b6b66]">
                {profile.noteTotal + added.length}
              </span>
              <span className="min-w-px flex-1" />
              <span className="text-[11px] leading-[15px] text-[#9b9b9b]">
                All time
              </span>
            </div>

            <div className="flex min-h-px w-full flex-1 flex-col gap-[10px] overflow-y-auto [scrollbar-width:none]">
              <Composer
                name={record.name.split(" ")[0]}
                draft={state.noteDraft}
                dispatch={dispatch}
              />
              {notes.map((note, i) => (
                <NoteItem key={`${note.date}-${i}`} note={note} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- breadcrumb */

function ProfileBreadcrumb({
  name,
  onBack,
}: {
  name: string;
  onBack: () => void;
}) {
  return (
    // Drag surface in the Electron shell; the two navigation controls opt out
    // so their clicks aren't eaten by the window manager.
    <div
      className="flex h-[48px] w-full shrink-0 items-center bg-[#f2f2f0] px-[20px] py-[10px]"
      style={DRAG}
    >
      <div className="flex items-center gap-[12.5px]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center"
          style={NO_DRAG}
        >
          <Icon name="breadcrumb-back" size={18} />
        </button>
        <div className="flex items-center gap-[8px] text-[13px] leading-[19px] whitespace-nowrap">
          <button
            type="button"
            onClick={onBack}
            className="text-[#6b6b6b]"
            style={NO_DRAG}
          >
            Student Database
          </button>
          <span className="text-[#c9c9c9]">/</span>
          <span className="font-medium text-black">{name}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- identity card */

/** The one easing this product uses — matches the film's EASE_IN_AND_OUT. */
const EASE = [0.42, 0, 0.58, 1] as const;

/**
 * Expand/collapse by animating REAL height (0 → auto), never Motion's
 * `layout` scaling: height reflows the document every frame, so the cards
 * below ride down smoothly and no text ever stretches mid-tween.
 */
function Reveal({
  open,
  duration = 0.28,
  children,
}: {
  open: boolean;
  duration?: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration, ease: EASE }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StudentIdentityCard({
  record,
  stats,
  targets,
  expanded,
  onToggle,
}: {
  record: StudentRecord;
  stats: string;
  targets: { name: string; fit: keyof typeof FIT_TONE }[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const first = targets.slice(0, 4);
  const rest = targets.slice(4);

  return (
    <Card className="w-full">
      <div className="flex items-center border-b border-[#ebebe8] bg-[#f5f5f3] px-[16px] py-[13px]">
        <div className="flex items-center gap-[12px]">
          <Monogram student={record} size={40} />
          <div className="flex flex-col gap-[2px] whitespace-nowrap">
            <p className="text-[17px] leading-[22px] font-semibold text-[#1a1a1a]">
              {record.name}
            </p>
            <p className="text-[13px] leading-[18px] text-[#6b6b6b]">
              {record.grade} · {record.school}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-[16px] pt-[14px] pb-[16px]">
        <p className="pb-[12px] text-[13px] leading-[18px] whitespace-nowrap text-[#4a4a4a]">
          {stats}
        </p>
        {targets.length > 0 && (
          <>
            <div className="flex w-full flex-wrap items-start gap-[6px]">
              {first.map((school) => (
                <TargetChip key={school.name} name={school.name} fit={school.fit} />
              ))}
              {!expanded && rest.length > 0 && (
                <MoreChip onClick={onToggle}>+{rest.length} more</MoreChip>
              )}
            </div>
            <Reveal open={expanded}>
              <div className="flex w-full flex-wrap items-start gap-[6px] pt-[6px]">
                {rest.map((school) => (
                  <TargetChip key={school.name} name={school.name} fit={school.fit} />
                ))}
                <MoreChip onClick={onToggle}>Show less</MoreChip>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </Card>
  );
}

function MoreChip({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[22px] shrink-0 items-center rounded-full bg-[#f1f1ef] px-[10px] text-[11px] leading-none font-medium text-[#6b6b6b]"
    >
      {children}
    </button>
  );
}

function TargetChip({
  name,
  fit,
}: {
  name: string;
  fit: keyof typeof FIT_TONE;
}) {
  const tone = FIT_TONE[fit];
  return (
    <span
      className="inline-flex h-[22px] shrink-0 items-center gap-[6px] rounded-full pr-[10px] pl-[8px]"
      style={{ background: tone.bg }}
    >
      <span
        className="h-[6px] w-[6px] shrink-0 rounded-full"
        style={{ background: tone.ink }}
      />
      <span
        className="text-[11px] leading-none font-medium whitespace-nowrap"
        style={{ color: tone.ink }}
      >
        {name} · {fit}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------ summary card */

function SummaryCard({
  profile,
  open,
  onToggle,
}: {
  profile: ReturnType<typeof getProfile>;
  open: boolean;
  onToggle: () => void;
}) {
  const s = profile.summary;
  return (
    <Card className="w-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-[18px] py-[14px] text-left"
      >
        <span className="flex flex-col gap-[3px]">
          <span className="text-[14px] leading-[20px] font-medium text-[#1a1a1a]">
            5-Minute Summary
          </span>
          <span className="text-[11px] leading-[15px] text-[#9b9b9b]">
            {s.synthesised}
          </span>
        </span>
        <Chevron direction={open ? "up" : "down"} />
      </button>

      <Reveal open={open} duration={0.34}>
        {/* The header's divider lives up here so it slides out with the body. */}
        <div className="mx-[18px] h-px bg-[#efefef]" />
        <div className="flex flex-col gap-[14px] px-[18px] pt-[14px] pb-[18px]">
          <SummarySection title="Student summary:">
            <p className="text-[13px] leading-[20px] text-[#3a3a3a]">
              {s.studentSummary}
            </p>
          </SummarySection>

          <Hairline />
          <SummarySection title="Summer programs to apply to:">
            <ul className="flex flex-col gap-[8px]">
              {s.programs.map((p) => (
                <SummaryPoint key={p} text={p} />
              ))}
            </ul>
          </SummarySection>

          <Hairline />
          <SummarySection title="Last meeting discussion:">
            <p className="text-[13px] leading-[20px] text-[#3a3a3a]">
              {s.discussion}
            </p>
          </SummarySection>

          {s.concerns.length > 0 && (
            <>
              <Hairline />
              <SummarySection title="Concerns:">
                <ul className="flex flex-col gap-[8px]">
                  {s.concerns.map((c) => (
                    <SummaryPoint key={c} text={c} />
                  ))}
                </ul>
              </SummarySection>
            </>
          )}
        </div>
      </Reveal>
    </Card>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[13px] leading-[18px] font-medium text-[#1a1a1a]">
        {title}
      </p>
      {children}
    </div>
  );
}

/** Bullet with a bold lead — "Name — detail" splits at the first em dash. */
function SummaryPoint({ text }: { text: string }) {
  const split = text.indexOf(" — ");
  const lead = split === -1 ? text : text.slice(0, split);
  const rest = split === -1 ? "" : text.slice(split);
  return (
    <li className="flex items-start gap-[9px]">
      <span className="mt-[8px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#b9b9b3]" />
      <span className="text-[13px] leading-[20px] text-[#3a3a3a]">
        <span className="font-medium text-[#1a1a1a]">{lead}</span>
        {rest}
      </span>
    </li>
  );
}

function Hairline() {
  return <div className="h-px w-full bg-[#efefef]" />;
}

function CollapsedRow({ title, count }: { title: string; count?: number }) {
  return (
    <Card className="flex h-[54px] w-full shrink-0 items-center justify-between px-[18px]">
      <span className="flex items-center gap-[10px]">
        <span className="text-[14px] leading-[20px] font-medium text-[#1a1a1a]">
          {title}
        </span>
        {count !== undefined && (
          <span className="inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#ededea] px-[7px] text-[11px] leading-none text-[#6b6b66]">
            {count}
          </span>
        )}
      </span>
      <Chevron />
    </Card>
  );
}

/* ---------------------------------------------------------------- ask bar */

function AskBar({ name }: { name: string }) {
  return (
    <div className="flex w-full items-center gap-[10px] rounded-[35px] border border-[#e4e4e4] bg-white py-[10px] pr-[12px] pl-[18px] shadow-[0_2px_8px_0_rgba(0,0,0,0.05)]">
      <p className="min-w-px flex-1 text-[13px] leading-[18px] text-[rgba(0,0,0,0.6)]">
        Ask anything about {name}…
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
  );
}

/* --------------------------------------------------------------- composer */

function Composer({
  name,
  draft,
  dispatch,
}: {
  name: string;
  draft: string;
  dispatch: (action: DemoAction) => void;
}) {
  const ready = draft.trim().length > 0;
  return (
    <div className="flex w-full shrink-0 flex-col gap-[10px] rounded-[12px] border border-[#e8e8e8] bg-white p-[14px] shadow-[0_2px_6px_0_rgba(0,0,0,0.03)]">
      <textarea
        value={draft}
        onChange={(e) => dispatch({ type: "NOTE_DRAFTED", text: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            dispatch({ type: "NOTE_SAVED" });
          }
        }}
        placeholder={`Write a note about ${name}…`}
        rows={draft ? 2 : 1}
        className="w-full resize-none bg-transparent text-[13px] leading-[19px] text-[#1a1a1a] outline-none placeholder:text-[#9b9b9b]"
      />

      {/* One row of chip-height (23px) controls — nothing here exceeds it. */}
      <div className="flex w-full items-center gap-[6px]">
        <button
          type="button"
          className="inline-flex h-[23px] items-center gap-[5px] rounded-full bg-[#f1f1ef] px-[10px] text-[11.5px] leading-none font-medium text-[#3a3a3a]"
        >
          Meeting note
          <Chevron size={10} />
        </button>
        <button
          type="button"
          className="inline-flex h-[23px] w-[31px] items-center justify-center rounded-full border border-[#e0e0dc] text-[13px] leading-none text-[#6b6b6b]"
        >
          +
        </button>
        <span className="min-w-px flex-1" />
        <button
          type="button"
          onClick={() => dispatch({ type: "NOTE_SAVED" })}
          disabled={!ready}
          className={`inline-flex h-[23px] items-center gap-[6px] rounded-full px-[9px] transition-opacity ${
            ready ? "bg-[#e8e8e4] opacity-100" : "bg-[#f1f1ef] opacity-60"
          }`}
        >
          <span className="text-[11.5px] leading-none font-medium text-[#3a3a3a]">
            Save note
          </span>
          <span className="inline-flex h-[15px] items-center rounded-[3px] bg-white px-[4px] text-[9.5px] leading-none text-[#6b6b6b] shadow-[0_1px_1px_0_rgba(0,0,0,0.06)]">
            ⌘↵
          </span>
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- note item */

function NoteItem({ note }: { note: Note }) {
  // Only a note saved this session earns the entrance — the seeded list must
  // render settled on first paint (an entrance on mount also freezes half-lit
  // in rAF-throttled webviews).
  const isNew = note.date === "Just now";
  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
      className="flex w-full shrink-0 flex-col gap-[7px] rounded-[12px] border border-[#e8e8e8] bg-white p-[14px]"
    >
      <div className="flex w-full items-center justify-between">
        <span
          className="text-[11.5px] leading-[15px] font-medium"
          style={{ color: note.fromInsight ? "#256b3b" : "#6b6b6b" }}
        >
          {note.kind}
        </span>
        <span className="text-[11px] leading-[15px] text-[#9b9b9b]">
          {note.date}
        </span>
      </div>
      <p className="text-[13px] leading-[19px] text-[#3a3a3a]">{note.body}</p>
    </motion.div>
  );
}

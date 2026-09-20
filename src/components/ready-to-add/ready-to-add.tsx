"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotionConfig } from "motion/react";
import { Chevron, Cross, Pencil } from "./icons";

/* A two-panel extraction flow. The card starts empty; pasting a link runs the
   agent, whose ledger ticks through its tasks on the left while the record it
   reads streams into the right panel. The state model:

     phase      : 'idle' | 'working' | 'review'
     doneCount  : number              — tasks completed so far; the task at
                                        index doneCount is the active one
     openTaskId : string | null      — which row's reasoning is unfolded. A
                                        plain single-open accordion
     filled     : Record<label, string> — committed answers for fields the
                                        agent could not read off the page
     editing    : string | null      — the needs-input field currently an input
     added      : boolean            — the record has been committed to the kit

   The ledger never hides a row and the card never changes size. Every task is
   always listed; an opened row's reasoning takes only the height its text
   needs, pushing the rows below down just that far — never further — and when
   the text wants more room than the panel has, the body is clamped at the
   panel's bottom edge and scrolls internally. No "+N more", no folding.

   The run is a deterministic timer sequence (the Lab has no model behind it):
   every task icon walks pending → active → done, and each completion releases
   a proportional slice of the fields. Everything the right panel gates on
   derives from `filled`: "Add to kit" earns its ink only when no needs-input
   field is missing an answer, and pressing it early opens the first
   unanswered field instead of erroring.

   Sizing: the Figma frame (1160×614) is a 2x presentation render, not product
   truth. Everything here is authored at product scale — 760px card, 13px
   body, 18px title — so the dialog sits in a real viewport instead of
   filling it. */

export type AgentTask = {
  id: string;
  label: string;
  /** Evidence lifted verbatim from the page. */
  quote?: string;
  /** The agent's reasoning about that evidence. */
  note?: string;
};

export type ExtractedField = {
  label: string;
  value: string;
  /** Full-row fields (title, eligibility); others pair up two per row. */
  wide?: boolean;
  /** The page didn't say — the reader has to. `value` is ignored. */
  needsInput?: boolean;
  /** Placeholder for the inline editor. */
  hint?: string;
};

type Props = {
  /** Sample link — the input's placeholder, adopted on an empty submit. */
  url: string;
  tasks: AgentTask[];
  fields: ExtractedField[];
  onAdd?: (filled: Record<string, string>) => void;
};

type Phase = "idle" | "working" | "review";
type TaskStatus = "pending" | "active" | "done";

const EASE = [0.32, 0.72, 0, 1] as const;
/** Per-task run time; the ledger should read as work, not as a progress bar. */
const STEP_MS = [1100, 1500, 1000, 900];

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c1b18] outline-none";

/* One icon, three lives: an empty ring while the task waits, a revolving arc
   while it runs, and the check drawing itself in when it lands. The circle
   and check are the same elements throughout — the icon changes state, it is
   never swapped. */
function TaskIcon({
  status,
  reduced,
}: {
  status: TaskStatus;
  reduced: boolean;
}) {
  const done = status === "done";
  return (
    <span className="relative size-5 shrink-0">
      <svg viewBox="0 0 28 28" fill="none" className="absolute inset-0 size-full" aria-hidden>
        <motion.circle
          cx="14"
          cy="14"
          r="13.25"
          strokeWidth="1.5"
          initial={false}
          animate={{
            fill: done ? "#E7F2E9" : "rgba(231,242,233,0)",
            stroke: done ? "#8CC2A0" : "#DDDBD1",
          }}
          transition={reduced ? { duration: 0 } : { duration: 0.3 }}
        />
        <motion.path
          d="M8.5 14.3 L12.2 17.8 L19.5 9.8"
          stroke="#1E7A47"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { pathLength: { duration: 0.35, ease: EASE }, opacity: { duration: 0.1 } }
          }
        />
      </svg>
      {status === "active" && (
        <motion.svg
          viewBox="0 0 28 28"
          fill="none"
          className="absolute inset-0 size-full"
          aria-hidden
          animate={reduced ? undefined : { rotate: 360 }}
          transition={
            reduced
              ? undefined
              : { repeat: Infinity, duration: 0.9, ease: "linear" }
          }
        >
          <path
            d="M14 0.75 A 13.25 13.25 0 0 1 27.25 14"
            stroke="#1E7A47"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </motion.svg>
      )}
    </span>
  );
}

export function ReadyToAddCard({ url, tasks, fields, onAdd }: Props) {
  const reduced = useReducedMotionConfig();
  const baseId = useId();

  const [phase, setPhase] = useState<Phase>("idle");
  const [doneCount, setDoneCount] = useState(0);
  const [draftUrl, setDraftUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const timers = useRef<number[]>([]);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const missing = fields.filter((f) => f.needsInput && !filled[f.label]);
  const ready = missing.length === 0;

  /* Fields stream in with the work: each completed task releases its
     proportional slice, so the record grows while the ledger ticks. */
  const revealCount =
    phase === "idle"
      ? 0
      : phase === "review"
        ? fields.length
        : Math.floor((fields.length * doneCount) / tasks.length);

  const grow = reduced ? { duration: 0 } : { duration: 0.36, ease: EASE };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const start = (link: string) => {
    const target = link.trim() || url;
    clearTimers();
    setActiveUrl(target);
    setDraftUrl(target);
    setPhase("working");
    setDoneCount(0);
    setOpenTaskId(null);
    setFilled({});
    setEditing(null);
    setAdded(false);
    let t = 500;
    tasks.forEach((_task, i) => {
      t += STEP_MS[i % STEP_MS.length];
      timers.current.push(
        window.setTimeout(() => {
          setDoneCount(i + 1);
        }, t),
      );
    });
    timers.current.push(window.setTimeout(() => setPhase("review"), t + 700));
  };

  const reset = () => {
    clearTimers();
    setPhase("idle");
    setDoneCount(0);
    setOpenTaskId(null);
    setFilled({});
    setEditing(null);
    setAdded(false);
  };

  const commit = (label: string, value: string) => {
    const v = value.trim();
    setEditing(null);
    if (v) setFilled((prev) => ({ ...prev, [label]: v }));
  };

  const taskStatus = (index: number): TaskStatus =>
    index < doneCount ? "done" : index === doneCount && phase === "working" ? "active" : "pending";

  /* Field rows: wide fields own a row; the rest tile a two-column grid. The
     grid handles both because a wide field just spans it. */
  const fieldCell = (field: ExtractedField, index: number) => {
    const revealed = index < revealCount;
    const value = filled[field.label];
    const isEditing = editing === field.label;
    /* Every cell exists from the first paint; an unread value is a faint bar
       the real one replaces, so the record keeps one silhouette throughout. */
    const body = !revealed ? (
      <span className="flex h-[18px] items-center" aria-hidden>
        <span
          className={`h-[9px] rounded-full bg-[#eceae4] ${field.wide ? "w-44" : "w-20"}`}
        />
      </span>
    ) : !field.needsInput ? (
      <span
        className={`text-[#1c1b18] ${field.wide ? "text-[14px]" : "text-[13px]"}`}
      >
        {field.value}
      </span>
    ) : isEditing ? (
      <input
        autoFocus
        defaultValue={value ?? ""}
        placeholder={field.hint}
        aria-label={field.label}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(field.label, e.currentTarget.value);
          if (e.key === "Escape") setEditing(null);
        }}
        onBlur={(e) => commit(field.label, e.currentTarget.value)}
        className="w-full border-b border-[#d1cfc6] bg-transparent pb-px text-[13px] text-[#1c1b18] caret-[#9a6a1b] outline-none placeholder:text-[#c4c2b8]"
      />
    ) : (
      <button
        type="button"
        onClick={() => setEditing(field.label)}
        className={`w-fit rounded-sm text-left text-[13px] ${ring} ${
          value
            ? "text-[#1c1b18] underline decoration-[#d1cfc6] decoration-dotted underline-offset-4"
            : "text-[#9a6a1b] underline decoration-[#d8c39a] decoration-dotted underline-offset-4"
        }`}
      >
        {value ?? "Needs your input"}
      </button>
    );
    return (
      <div
        key={field.label}
        className={`flex flex-col gap-1.5 ${field.wide ? "col-span-2" : ""}`}
      >
        <span className="text-[11px] text-[#9c9a91]">{field.label}</span>
        {revealed ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={grow}
          >
            {body}
          </motion.div>
        ) : (
          body
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-8px_rgba(0,0,0,0.16)] md:h-[478px] md:flex-row">
      {/* Gloss animations, working phase only. CSS so they stay smooth while
          the "work" runs; linear because the motion is constant; gated by the
          reduced-motion hook at render, not here. */}
      <style>{`
        .rta-shimmer-text {
          background: linear-gradient(90deg, #1c1b18 36%, #c9c7bc 50%, #1c1b18 64%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rta-text-gloss 1.4s linear infinite;
        }
        @keyframes rta-text-gloss {
          from { background-position: 100% 0; }
          to { background-position: 0% 0; }
        }
        .rta-gloss-band {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(105deg, transparent 32%, rgba(255, 255, 255, 0.85) 50%, transparent 68%);
          animation: rta-gloss-sweep 2.6s linear infinite;
        }
        @keyframes rta-gloss-sweep {
          0% { transform: translateX(-100%); }
          55% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      {/* ── Left: what the agent is doing ────────────────────────────── */}
      <section
        aria-label="Agent tasks"
        className="flex min-h-0 flex-col gap-4 bg-[#f7f6f1] p-5 sm:p-7 md:w-[47%] md:shrink-0"
      >
        {/* Static header — the card's name, not a status line. Progress is
            the ledger's job; the header never changes with the content. */}
        <header className="flex shrink-0 flex-col gap-1">
          <h2 className="text-[18px] font-medium leading-tight text-[#1c1b18]">
            Add Resources
          </h2>
          <p className="text-[12.5px] text-[#5c5a53]">
            Paste a link and automatically pull the details
          </p>
        </header>

        <div className="flex w-full shrink-0 items-center justify-between gap-2.5 rounded-[10px] border border-[#e7e5dd] bg-white px-3.5 py-2.5">
          {phase === "idle" ? (
            <>
              {/* Focusing adopts the sample link rather than leaving an
                  empty field behind the placeholder. Nobody trying this out
                  has a resource URL to hand, and "go find one and paste it"
                  is a dead end at the very first step — the flow being
                  demonstrated starts *after* the link. Typing still replaces
                  it; this only decides what an untouched field contains. */}
              <input
                ref={urlInputRef}
                value={draftUrl}
                onFocus={() => {
                  if (!draftUrl) setDraftUrl(url);
                }}
                onChange={(e) => setDraftUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") start(e.currentTarget.value);
                }}
                placeholder={url}
                aria-label="Link to read"
                className="min-w-0 flex-1 bg-transparent text-[12.5px] text-[#1c1b18] caret-[#1c1b18] outline-none placeholder:text-[#b5b3a8]"
              />
              <button
                type="button"
                onClick={() => start(draftUrl)}
                className={`shrink-0 rounded-sm text-[12.5px] font-medium text-[#1c1b18] ${ring}`}
              >
                Read page
              </button>
            </>
          ) : (
            <>
              <span className="truncate text-[12.5px] text-[#1c1b18]">
                {activeUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  requestAnimationFrame(() => urlInputRef.current?.focus());
                }}
                className={`shrink-0 rounded-sm text-[12.5px] text-[#5c5a53] transition-colors hover:text-[#1c1b18] ${ring}`}
              >
                Change
              </button>
            </>
          )}
        </div>

        {/* The ledger. Every row is always present; an open row's reasoning
            pushes the rows below only as far as its text needs, clamped at
            the panel bottom with internal scroll. The card never resizes. */}
        <div className="flex min-h-0 flex-col pt-1 md:flex-1">
          {tasks.map((task, i) => {
            const status = taskStatus(i);
            const hasBody = Boolean(task.quote || task.note) && status === "done";
            const open = openTaskId === task.id && hasBody;
            const bodyId = `${baseId}-${task.id}`;
            return (
              <Fragment key={task.id}>
                <button
                  type="button"
                  disabled={!hasBody}
                  aria-expanded={hasBody ? open : undefined}
                  aria-controls={hasBody ? bodyId : undefined}
                  onClick={() => setOpenTaskId(open ? null : task.id)}
                  className={`flex w-full shrink-0 items-center justify-between gap-2.5 rounded-md pb-4 text-left ${ring}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <TaskIcon status={status} reduced={reduced ?? false} />
                    <span
                      className={`text-[13px] font-medium transition-colors duration-300 ${
                        status === "active" && !reduced
                          ? "rta-shimmer-text"
                          : status === "pending"
                            ? "text-[#a3a199]"
                            : "text-[#1c1b18]"
                      }`}
                    >
                      {task.label}
                    </span>
                  </span>
                  {hasBody && (
                    <motion.span
                      className="shrink-0"
                      initial={false}
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={grow}
                    >
                      <Chevron className="size-3.5" />
                    </motion.span>
                  )}
                </button>
                {/* Natural height, bounded: the body takes only the room its
                    text needs; the fixed frame shrinks it (min-h-0) and the
                    interior scrolls when the text wants more than there is. */}
                <motion.div
                  id={bodyId}
                  className="min-h-0 overflow-hidden"
                  initial={false}
                  animate={{
                    height: open ? "auto" : 0,
                    opacity: open ? 1 : 0,
                  }}
                  transition={grow}
                  inert={!open}
                >
                  <div className="h-full max-h-48 overflow-y-auto pb-4 md:max-h-none">
                    <div className="flex flex-col gap-2 pl-8 text-[12.5px] leading-[19px]">
                      {task.quote && (
                        <p className="text-[#4f4d47]">“{task.quote}”</p>
                      )}
                      {task.note && <p className="text-[#908e84]">{task.note}</p>}
                    </div>
                  </div>
                </motion.div>
              </Fragment>
            );
          })}
        </div>

        <span className="sr-only" aria-live="polite">
          {phase === "working"
            ? `${doneCount} of ${tasks.length} tasks complete`
            : phase === "review"
              ? "All tasks complete"
              : ""}
        </span>
      </section>

      {/* ── Right: what the agent has read so far ────────────────────── */}
      <section
        aria-label="Extracted record"
        className="relative flex min-h-0 flex-1 flex-col justify-between gap-6 overflow-hidden border-t border-[#eceae4] p-5 sm:p-7 md:border-l md:border-t-0 md:pl-8"
      >
        {phase === "working" && !reduced && (
          <span aria-hidden className="rta-gloss-band" />
        )}
        <div className="flex min-h-0 flex-col gap-5">
          <div className="flex h-7 shrink-0 items-center justify-between gap-2.5">
            <span className="text-[12.5px] text-[#908e84]">
              Read from the page
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                aria-label="Edit fields"
                disabled={phase !== "review"}
                onClick={() => {
                  const target = missing[0] ?? fields.find((f) => f.needsInput);
                  if (target) setEditing(target.label);
                }}
                className={`relative size-7 rounded-full border border-[#e7e5dd] bg-white transition-opacity duration-300 enabled:hover:bg-[#faf9f6] disabled:opacity-40 ${ring}`}
              >
                <Pencil className="absolute inset-0 size-full" />
              </button>
              <button
                type="button"
                aria-label={phase === "working" ? "Stop reading" : "Dismiss"}
                disabled={phase === "idle"}
                onClick={reset}
                className={`relative size-7 rounded-full bg-[#f0efe9] transition-opacity duration-300 enabled:hover:bg-[#e7e5dd] disabled:opacity-40 ${ring}`}
              >
                <Cross className="absolute inset-0 size-full" />
              </button>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {fields.map(fieldCell)}
          </div>
        </div>

        {/* Present from the first paint, dormant until there is something to
            act on — the card never changes shape, only wakes up. */}
        <div className="flex shrink-0 justify-end gap-2.5">
          <button
            type="button"
            disabled={phase === "idle"}
            onClick={reset}
            className={`rounded-lg border border-[#e7e5dd] bg-white px-4 py-2 text-[12.5px] font-medium transition-colors duration-300 enabled:hover:bg-[#faf9f6] ${ring} ${
              phase === "idle" ? "text-[#b5b3a8]" : "text-[#1c1b18]"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            aria-disabled={phase !== "review" || (!ready && !added)}
            onClick={() => {
              if (phase !== "review" || added) return;
              if (!ready) {
                setEditing(missing[0].label);
                return;
              }
              setAdded(true);
              onAdd?.(filled);
            }}
            className={`rounded-lg border px-4 py-2 text-[12.5px] font-medium transition-colors duration-300 ${ring} ${
              added
                ? "border-[#1e7a47] bg-[#1e7a47] text-white"
                : phase !== "review"
                  ? "border-[#eceae4] bg-white text-[#b5b3a8]"
                  : ready
                    ? "border-[#1c1b18] bg-[#1c1b18] text-white hover:bg-[#33312c]"
                    : "border-[#d1cfc6] bg-white text-[#1c1b18] hover:bg-[#faf9f6]"
            }`}
          >
            {added ? "Added to kit ✓" : "Add to kit"}
          </button>
        </div>
      </section>
    </div>
  );
}

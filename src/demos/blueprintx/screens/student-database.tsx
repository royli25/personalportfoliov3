"use client";

import { useEffect } from "react";
import { LIGHT_SCOPE } from "../parts/primitives";
import { Sidebar } from "../parts/sidebar";
import { Breadcrumb } from "../parts/meeting";
import { Chevron, Icon } from "../parts/primitives";
import {
  NAV,
  getProfile,
  searchStudents,
  STAGE_TONE,
  STATUS_TONE,
  STUDENTS,
  type StudentRecord,
} from "../data/students";
import type { DemoAction } from "../state/actions";
import type { DemoState } from "../state/types";

/**
 * BlueprintX — Student Database (Figma `B2 — stage chips`, 545:4823).
 *
 * Pure render of DemoState. The table is a real scroll container and the
 * search field is a real input — the recording beats (scroll the list, type
 * "Cole", arrow to a result) are the product behaving, not keyframes.
 *
 * Column math is the B-line table: 400/70/180/300/70/54 = 1074 inside a
 * 1106 card (16px side padding). Header and rows share COLS — change once.
 */

const COLS = {
  student: 400,
  grade: 70,
  stage: 180,
  status: 300,
  notes: 70,
  chevron: 54,
} as const;

export function StudentDatabase({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}) {
  const results = searchStudents(state.query);

  // Dropdown keys live on the window, not the input: they keep working even
  // if focus wanders (screen recorders, remote drivers, stray clicks), which
  // is exactly when a dead arrow key would ruin a take.
  useEffect(() => {
    if (!state.searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        dispatch({ type: "ARM_MOVED", delta: 1 });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        dispatch({ type: "ARM_MOVED", delta: -1 });
      } else if (e.key === "Enter") {
        dispatch({ type: "RESULT_COMMITTED" });
      } else if (e.key === "Escape") {
        dispatch({ type: "SEARCH_DISMISSED" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.searchOpen, dispatch]);

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
        <Breadcrumb trail={["Student Database"]} />

        <div className="flex min-h-px w-full flex-1 flex-col overflow-hidden rounded-[16px] border border-[#dfdfdf] bg-[#fafafa] p-[32px]">
          <p className="text-[20px] leading-[27px] font-medium text-[#1a1a1a]">
            Student Database
          </p>

          {/* Toolbar */}
          <div className="mt-[16px] flex w-full items-center gap-[8px]">
            <SearchField state={state} dispatch={dispatch} />
            <div className="min-w-px flex-1" />
            {["All students", "Grade · All", "Status · All"].map((label) => (
              <button
                key={label}
                type="button"
                // r8, not stadium: rectangles are controls, stadiums are data
                // chips — and the stage/status chips live four rows below.
                className="flex h-[34px] items-center gap-[8px] rounded-[8px] border border-[#e4e4e4] bg-white px-[12px]"
              >
                <span className="text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#3a3a3a]">
                  {label}
                </span>
                <Chevron size={14} />
              </button>
            ))}
          </div>

          {/* Table (+ the dropdown overlays its top-left corner, like the mock) */}
          <div className="relative mt-[16px] min-h-px w-full flex-1">
            <div className="h-full w-full overflow-y-auto overscroll-contain rounded-[16px] border border-[#e8e8e8] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)] [scrollbar-width:none]">
              <TableHeader />
              {STUDENTS.map((s) => (
                <Row
                  key={s.id}
                  student={s}
                  onOpen={() => dispatch({ type: "STUDENT_OPENED", id: s.id })}
                />
              ))}
            </div>
            {/* Decorative scroll hint, as on the canvas. */}
            <div className="pointer-events-none absolute top-[48px] right-[9px] h-[150px] w-[4px] rounded-full bg-[#e0e0dc]" />

            {state.searchOpen && (
              <SearchDropdown
                query={state.query}
                results={results}
                armed={state.armed}
                dispatch={dispatch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- search */

function SearchField({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}) {
  return (
    <div className="flex h-[36px] w-[320px] items-center gap-[9px] rounded-[8px] border border-[#e4e4e4] bg-white px-[12px]">
      <Icon name="search" size={14} />
      <input
        value={state.query}
        onChange={(e) =>
          dispatch({ type: "QUERY_CHANGED", query: e.target.value })
        }
        placeholder="Search students, schools, tags…"
        className="min-w-px flex-1 bg-transparent text-[13px] leading-[18px] text-[#1a1a1a] outline-none placeholder:text-[#9b9b9b]"
      />
    </div>
  );
}

function SearchDropdown({
  query,
  results,
  armed,
  dispatch,
}: {
  query: string;
  results: StudentRecord[];
  armed: number;
  dispatch: (action: DemoAction) => void;
}) {
  const preview = results[armed];

  return (
    <div className="absolute top-0 left-0 z-10 flex w-[620px] overflow-hidden rounded-[12px] border border-[#e8e8e8] bg-white shadow-[0_12px_32px_0_rgba(0,0,0,0.10),0_2px_8px_0_rgba(0,0,0,0.06)]">
      {/* List */}
      <div className="flex w-[350px] shrink-0 flex-col">
        {results.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onMouseDown={(e) => e.preventDefault() /* keep input focus */}
            onClick={() => dispatch({ type: "STUDENT_OPENED", id: s.id })}
            className={`flex h-[52px] w-full items-center gap-[10px] px-[14px] text-left ${
              i === armed ? "bg-[#f5f5f3]" : ""
            }`}
          >
            <Monogram student={s} size={26} />
            <div className="flex min-w-px flex-1 flex-col">
              <span className="text-[13px] leading-[18px] font-medium text-[#1a1a1a]">
                {s.name}
              </span>
              <span className="text-[11px] leading-[15px] text-[#6b6b6b]">
                {s.grade} · {s.school}
              </span>
            </div>
            {i === armed && <Keycap>↵</Keycap>}
          </button>
        ))}

        <button
          type="button"
          className="flex h-[44px] w-full items-center gap-[11px] px-[14px] text-left"
        >
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#f1f1ef] text-[14px] leading-none text-[#6b6b6b]">
            +
          </span>
          <span className="text-[13px] leading-[18px] text-[#3a3a3a]">
            Add new student “{query.trim()}”
          </span>
        </button>

        <div className="mx-0 h-px w-full bg-[#efefef]" />
        <div className="flex h-[30px] items-center px-[12px] text-[11px] leading-[15px] whitespace-pre text-[#9b9b9b]">
          {"↑↓  navigate      ↵  open      esc  dismiss"}
        </div>
      </div>

      {/* Preview of the armed result */}
      <div className="flex min-w-px flex-1 flex-col gap-[12px] bg-[#fafafa] p-[16px]">
        {preview && (
          <>
            <Monogram student={preview} size={40} />
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14px] leading-[20px] font-semibold text-[#1a1a1a]">
                {preview.name}
              </span>
              <span className="text-[11.5px] leading-[16px] text-[#6b6b6b]">
                {preview.grade} · {preview.school}
              </span>
            </div>
            <div className="h-px w-full bg-[#e8e8e4]" />
            <div className="flex flex-col gap-[9px]">
              <PreviewStat label="Stage" value={preview.stage} />
              <PreviewStat
                label="Next"
                value={
                  preview.status.kind === "booked" ? preview.status.label : "—"
                }
              />
              <PreviewStat label="Notes" value={String(preview.noteCount)} />
              <PreviewStat
                label="Targets"
                value={
                  getProfile(preview.id).targets.length
                    ? `${getProfile(preview.id).targets.length} schools`
                    : "—"
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] leading-[15px] text-[#9b9b9b]">{label}</span>
      <span className="text-[11.5px] leading-[15px] text-[#3a3a3a]">
        {value}
      </span>
    </div>
  );
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[18px] min-w-[20px] shrink-0 items-center justify-center rounded-[4px] border border-[#e4e4e0] bg-white px-[4px] text-[10px] leading-none text-[#6b6b6b]">
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- table */

function TableHeader() {
  const label = "text-[11px] leading-[15px] font-medium tracking-[0.55px] text-[#9b9b9b] uppercase";
  return (
    <div className="sticky top-0 z-[1] flex h-[40px] w-full items-center border-b border-[#f1f1ef] bg-white px-[16px]">
      <span className={label} style={{ width: COLS.student }}>Student</span>
      <span className={label} style={{ width: COLS.grade }}>Grade</span>
      <span className={label} style={{ width: COLS.stage }}>Stage</span>
      <span className={label} style={{ width: COLS.status }}>Status</span>
      <span className={label} style={{ width: COLS.notes }}>Notes</span>
      <span style={{ width: COLS.chevron }} />
    </div>
  );
}

function Row({
  student,
  onOpen,
}: {
  student: StudentRecord;
  onOpen: () => void;
}) {
  const stage = STAGE_TONE[student.stage];
  const status = STATUS_TONE[student.status.kind];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-[54px] w-full items-center border-b border-[#f5f5f3] px-[16px] text-left transition-colors duration-100 hover:bg-[#fafaf8]"
    >
      <span
        className="flex items-center gap-[12px]"
        style={{ width: COLS.student }}
      >
        <Monogram student={student} size={32} />
        <span className="flex flex-col">
          <span className="text-[13px] leading-[18px] font-medium text-[#1a1a1a]">
            {student.name}
          </span>
          <span className="text-[11px] leading-[15px] text-[#6b6b6b]">
            {student.school}
          </span>
        </span>
      </span>

      <span
        className="text-[13px] leading-[18px] text-[#4a4a4a]"
        style={{ width: COLS.grade }}
      >
        {student.grade}
      </span>

      <span style={{ width: COLS.stage }}>
        <TintChip ink={stage.ink} bg={stage.bg}>{student.stage}</TintChip>
      </span>

      <span style={{ width: COLS.status }}>
        <TintChip ink={status.ink} bg={status.bg}>
          {student.status.label}
        </TintChip>
      </span>

      <span style={{ width: COLS.notes }}>
        <span className="inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#ededea] px-[7px] text-[11px] leading-none text-[#6b6b66]">
          {student.noteCount}
        </span>
      </span>

      <span
        className="flex justify-end pr-[2px]"
        style={{ width: COLS.chevron }}
      >
        <Chevron size={14} className="-rotate-90" />
      </span>
    </button>
  );
}

/** Tinted stadium chip — the stage and status treatment from B2. */
function TintChip({
  ink,
  bg,
  children,
}: {
  ink: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex h-[23px] items-center rounded-full px-[10px] text-[11.5px] leading-none font-medium whitespace-nowrap"
      style={{ color: ink, background: bg }}
    >
      {children}
    </span>
  );
}

/** Monogram avatar — one flat tint, initials owned by the component. Cole gets his photo. */
export function Monogram({
  student,
  size,
}: {
  student: StudentRecord;
  size: number;
}) {
  if (student.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.photo}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[#ededea] font-medium text-[#6b6b66]"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {student.initials}
    </span>
  );
}

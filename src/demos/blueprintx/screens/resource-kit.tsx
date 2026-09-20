"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Breadcrumb } from "../parts/meeting";
import { BandCard, UsageCount } from "../parts/band-card";
import { Chevron, Icon, LIGHT_SCOPE } from "../parts/primitives";
import { Sidebar } from "../parts/sidebar";
import { NAV } from "../data/students";
import { AddResourceModalView } from "../parts/add-resource-modal";
import {
  COLLECTIONS,
  EXTRACTION,
  GRADE_OPTIONS,
  KIT_ADDITION,
  MAINTENANCE,
  RESOURCE_TYPE,
  SUBJECT_OPTIONS,
  collectionCount,
  filterResources,
  getDetail,
  getResource,
  matchesFilter,
  type Collection,
  type ResourceRecord,
} from "../data/resources";
import type { DemoAction } from "../state/actions";
import type { DemoState } from "../state/types";

/**
 * BlueprintX — Resource Kit (Figma V2 `Resource Kit — Flows`: A1c grid,
 * A1b list, A2 filtered, A3 detail drawer).
 *
 * Pure render of DemoState. Everything the flow shows is real: typing filters
 * per keystroke, the rail's counts are derived from the dataset, and the
 * Grid/List toggle switches between two views of the same records.
 *
 * The drawer is the point of the screen. `Why this surfaces` lists the
 * conditions that make a record appear mid-meeting, which is what makes the
 * kit legible as the back end of the Live Meeting rail rather than a folder
 * of bookmarks.
 */

/** List columns — Resource fills, the rest are fixed. 170+130+84+40 = 424. */
const COLS = { type: 170, deadline: 130, grade: 84, chevron: 40 } as const;

/**
 * Motion vocabulary for this screen, chosen by frequency of use:
 *   view swap / drawer / modal / toast → occasional, so they animate;
 *   per-keystroke filtering → many times per take, so it NEVER does.
 * Built-in easings are too weak — these are the strong curves the reference
 * uses everywhere: EASE for enters/exits, DRAWER_EASE is the iOS drawer curve.
 */
const EASE = [0.23, 1, 0.32, 1] as const;
const DRAWER_EASE = [0.32, 0.72, 0, 1] as const;

/** Press feedback for anything clickable — the UI acknowledging the hand. */
const PRESS = "transition-transform duration-150 ease-out active:scale-[0.97]";

export function ResourceKit({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}) {
  const {
    query,
    collection,
    grade,
    subject,
    openMenu,
    view,
    openId,
    modal,
    justAdded,
    toastOpen,
  } = state.resources;
  // The saved addition joins the dataset for real: it filters, counts and
  // opens like every canonical record, just prepended so the take lands on it.
  const base = filterResources(query, collection, grade, subject);
  const showAddition =
    justAdded && matchesFilter(KIT_ADDITION, query, collection, grade, subject);
  const results = showAddition ? [KIT_ADDITION, ...base] : base;
  const filtersActive = !!query.trim() || grade !== null || subject !== null;
  const open = openId ? getResource(openId) : undefined;
  const active = COLLECTIONS.find((c) => c.id === collection);
  const countOf = (c: Collection) =>
    collectionCount(c) +
    (justAdded && (c.type === null || c.type === KIT_ADDITION.type) ? 1 : 0);

  return (
    <div
      className="relative flex items-start overflow-hidden bg-white font-sans"
      style={{ ...LIGHT_SCOPE, width: 1440, height: 900 }}
    >
      <Sidebar
        groups={NAV}
        active="Resource Kit"
        onSelect={(screen) => dispatch({ type: "NAV_SELECTED", screen })}
      />

      <div className="flex h-full min-w-px flex-1 flex-col bg-[#f2f2f0] pr-[10px] pb-[10px]">
        <Breadcrumb
          trail={open ? ["Resource Kit", open.title] : ["Resource Kit"]}
        />

        <div className="relative flex min-h-px w-full flex-1 flex-col gap-[16px] overflow-hidden rounded-[16px] border border-[#dfdfdf] bg-[#fafafa] p-[32px]">
          {/* Header */}
          <div className="flex w-full shrink-0 items-center justify-between">
            <p className="text-[20px] leading-[27px] font-medium text-[#1a1a1a]">
              Resource Kit
            </p>
            <div className="flex items-center gap-[8px]">
              <GhostButton>Edit</GhostButton>
              <PrimaryButton
                onClick={() => dispatch({ type: "ADD_RESOURCE_OPENED" })}
              >
                + Add resource
              </PrimaryButton>
            </div>
          </div>

          {/* Open dropdown dismisses on any outside click. Sits under the
              menus (z-20) but over everything else. */}
          {openMenu ? (
            <button
              type="button"
              aria-label="Dismiss menu"
              onClick={() => dispatch({ type: "FILTER_MENU_DISMISSED" })}
              className="absolute inset-0 z-10 cursor-default"
            />
          ) : null}

          {/* Rail + content column */}
          <div className="flex min-h-px w-full flex-1 gap-[16px] overflow-hidden">
            <CollectionsRail
              collection={collection}
              countOf={countOf}
              onSelect={(id) => dispatch({ type: "COLLECTION_SELECTED", id })}
            />

            <div className="flex min-w-px flex-1 flex-col gap-[16px] overflow-hidden">
              <Toolbar state={state} dispatch={dispatch} />

              {filtersActive ? (
                <div className="flex w-full shrink-0 items-center justify-between text-[13px] leading-[18px]">
                  <span className="text-[#6b6b6b]">
                    {results.length} of {countOf(active ?? COLLECTIONS[0])}{" "}
                    {(active ?? COLLECTIONS[0]).label.toLowerCase()}
                    {query.trim() ? <> · matching “{query.trim()}”</> : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "FILTERS_CLEARED" })}
                    className="font-medium text-[#3a3a3a]"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}

              {/* Keyed by VIEW only: toggling grid↔list crossfades, while
                  filtering re-renders the same key and stays animation-free.
                  Blur rides ONLY on the exit (which unmounts): a resting
                  `filter` forces the subtree onto a rasterized layer, and
                  under DeviceFrame's transform-scale that bitmap resamples —
                  the whole grid went soft in the Electron shell. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.18, ease: EASE },
                  }}
                  exit={{
                    opacity: 0,
                    filter: "blur(4px)",
                    transition: { duration: 0.12, ease: "easeOut" },
                  }}
                  className="flex min-h-px w-full flex-1 flex-col overflow-hidden"
                >
                  {results.length === 0 ? (
                    <Empty query={query} />
                  ) : view === "grid" ? (
                    <Grid
                      results={results}
                      onOpen={(id) => dispatch({ type: "RESOURCE_OPENED", id })}
                    />
                  ) : (
                    <List
                      results={results}
                      onOpen={(id) => dispatch({ type: "RESOURCE_OPENED", id })}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <Drawer
                key="drawer"
                record={open}
                onClose={() => dispatch({ type: "RESOURCE_CLOSED" })}
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {toastOpen ? <Toast key="toast" dispatch={dispatch} /> : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Flow C — scrim + modal cover the whole window, sidebar included. */}
      <AnimatePresence>
        {modal ? (
          <AddResourceModalView key="modal" modal={modal} dispatch={dispatch} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- toast */

/** Figma C4. Persists until dismissed — a hidden timer would be the only
 *  unscripted clock in the demo, so there isn't one. */
function Toast({ dispatch }: { dispatch: (action: DemoAction) => void }) {
  const still = useReducedMotion();
  return (
    <motion.div
      // Rises from below its resting spot, Sonner-cadence; leaves faster than
      // it arrived. x offset lives in style so the y animation can't touch it.
      style={{ x: "-50%" }}
      initial={{ opacity: 0, y: still ? 0 : 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }}
      exit={{
        opacity: 0,
        y: still ? 0 : 12,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      className="absolute bottom-[24px] left-1/2 z-10 flex items-center gap-[12px] rounded-[12px] border border-[#e4e4e4] bg-white py-[12px] pr-[12px] pl-[14px] shadow-[0_8px_24px_0_rgba(0,0,0,0.16)]">
      <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#e9f0eb] text-[11px] text-[#2f7a44]">
        ✓
      </span>
      <span className="flex flex-col gap-px whitespace-nowrap">
        <span className="text-[13px] leading-[18px] font-medium text-[#1a1a1a]">
          {KIT_ADDITION.title} added
        </span>
        <span className="text-[12px] leading-[16px] text-[#8a8a8a]">
          {EXTRACTION.toast}
        </span>
      </span>
      <span className="h-[24px] w-px shrink-0 bg-[#ebebeb]" />
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "RESOURCE_OPENED", id: KIT_ADDITION.id });
          dispatch({ type: "TOAST_DISMISSED" });
        }}
        className="px-[10px] text-[13px] leading-[18px] font-medium text-[#1a1a1a]"
      >
        View
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: "ADDITION_UNDONE" })}
        className="px-[10px] text-[13px] leading-[18px] font-medium text-[#9b9b9b]"
      >
        Undo
      </button>
    </motion.div>
  );
}

/* --------------------------------------------------------------- chrome */

/**
 * The file has no black, grey or recessed buttons: every button is white
 * with a hairline. Hierarchy comes from position and label, not fill.
 */
function PrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[34px] items-center gap-[8px] rounded-[8px] border border-[#e4e4e4] bg-white px-[14px] text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#3a3a3a] ${PRESS}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`flex h-[34px] items-center gap-[8px] rounded-[8px] border border-[#e4e4e4] bg-white px-[14px] text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#3a3a3a] ${PRESS}`}
    >
      {children}
    </button>
  );
}

function CollectionsRail({
  collection,
  countOf,
  onSelect,
}: {
  collection: string;
  countOf: (c: Collection) => number;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col gap-[2px] overflow-hidden rounded-[16px] border border-[#e8e8e8] bg-white px-[8px] py-[12px] shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)]">
      <Eyebrow>Collections</Eyebrow>
      <div className="h-[6px]" />
      {COLLECTIONS.map((c) => (
        <RailRow
          key={c.id}
          label={c.label}
          count={countOf(c)}
          active={c.id === collection}
          onClick={() => onSelect(c.id)}
        />
      ))}
      <div className="h-[10px]" />
      <div className="h-px w-full bg-[#efefef]" />
      <div className="h-[10px]" />
      <Eyebrow>Maintenance</Eyebrow>
      <div className="h-[6px]" />
      {MAINTENANCE.map((m) => (
        <RailRow key={m.id} label={m.label} count={m.count} active={false} />
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="px-[10px] text-[11px] leading-[16px] font-medium tracking-[0.44px] whitespace-nowrap text-[#9b9b9b]">
      {children}
    </p>
  );
}

function RailRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[34px] w-full shrink-0 items-center justify-between rounded-[8px] px-[10px] text-left transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.98] ${
        active ? "bg-[#f1f1ef]" : onClick ? "hover:bg-[#f7f7f5]" : ""
      }`}
    >
      <span
        className={`text-[13px] leading-[18px] whitespace-nowrap ${
          active ? "font-medium text-[#1a1a1a]" : "text-[#4a4a4a]"
        }`}
      >
        {label}
      </span>
      <span className="text-[12px] leading-[16px] text-[#9b9b9b]">{count}</span>
    </button>
  );
}

function Toolbar({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}) {
  const { query, view, collection, grade, subject, openMenu } =
    state.resources;
  const activeCollection = COLLECTIONS.find((c) => c.id === collection);
  const activeType = activeCollection?.type
    ? RESOURCE_TYPE[activeCollection.type].label
    : null;
  return (
    <div className="flex h-[36px] w-full shrink-0 items-center gap-[8px]">
      <div
        className={`flex h-[36px] w-[320px] shrink-0 items-center gap-[9px] rounded-[8px] border bg-white px-[12px] ${
          query ? "border-[#1a1a1a]" : "border-[#e4e4e4]"
        }`}
      >
        <Icon name="search" size={14} />
        <input
          value={query}
          onChange={(e) =>
            dispatch({ type: "RESOURCE_QUERY_CHANGED", query: e.target.value })
          }
          placeholder="Search resources, deadlines, subjects…"
          className="min-w-px flex-1 bg-transparent text-[13px] leading-[18px] text-[#1a1a1a] outline-none placeholder:text-[#9b9b9b]"
        />
      </div>

      <FilterChip
        menu="type"
        label={
          activeType ? `Type · ${activeType}` : "All types"
        }
        engaged={!!activeType}
        open={openMenu === "type"}
        options={[
          { value: "all", label: "All types" },
          ...COLLECTIONS.filter((c) => c.type).map((c) => ({
            value: c.id,
            label: RESOURCE_TYPE[c.type!].label,
          })),
        ]}
        selected={collection}
        onToggle={() => dispatch({ type: "FILTER_MENU_TOGGLED", menu: "type" })}
        onPick={(v) => dispatch({ type: "TYPE_PICKED", collection: v })}
      />
      <FilterChip
        menu="grade"
        label={grade ? `Grade · ${grade}` : "Grade · All"}
        engaged={!!grade}
        open={openMenu === "grade"}
        options={[
          { value: "", label: "All grades" },
          ...GRADE_OPTIONS.map((g) => ({ value: g, label: g })),
        ]}
        selected={grade ?? ""}
        onToggle={() =>
          dispatch({ type: "FILTER_MENU_TOGGLED", menu: "grade" })
        }
        onPick={(v) => dispatch({ type: "GRADE_PICKED", grade: v || null })}
      />
      <FilterChip
        menu="subject"
        label={
          subject
            ? `Subject · ${subject.replace("Science", "Sci")}`
            : "Subject · All"
        }
        engaged={!!subject}
        open={openMenu === "subject"}
        options={[
          { value: "", label: "All subjects" },
          ...SUBJECT_OPTIONS.map((s) => ({ value: s, label: s })),
        ]}
        selected={subject ?? ""}
        onToggle={() =>
          dispatch({ type: "FILTER_MENU_TOGGLED", menu: "subject" })
        }
        onPick={(v) => dispatch({ type: "SUBJECT_PICKED", subject: v || null })}
      />

      <div className="min-w-px flex-1" />

      <div className="flex h-[34px] shrink-0 items-center gap-[2px] rounded-[8px] border border-[#e4e4e4] bg-white p-[3px]">
        {(["grid", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => dispatch({ type: "RESOURCE_VIEW_CHANGED", view: v })}
            className={`flex h-[28px] items-center rounded-[6px] px-[12px] text-[13px] leading-[18px] font-medium capitalize ${PRESS} ${
              view === v ? "bg-[#f1f1ef] text-[#1a1a1a]" : "text-[#8a8a8a]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A toolbar dropdown. Click-initiated and occasional, so it animates — but
 * like a popover, not a modal: it scales from its trigger (origin top-left),
 * from 0.97, in 150ms with the strong curve; exit is faster. Engaged chips
 * swap to the flat primary fill so an applied filter reads at a glance.
 */
function FilterChip({
  menu,
  label,
  engaged,
  open,
  options,
  selected,
  onToggle,
  onPick,
}: {
  menu: string;
  label: string;
  engaged: boolean;
  open: boolean;
  options: { value: string; label: string }[];
  selected: string;
  onToggle: () => void;
  onPick: (value: string) => void;
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-[34px] items-center gap-[8px] rounded-[8px] border pr-[10px] pl-[12px] ${PRESS} ${
          engaged
            ? "border-[#dddddd] bg-[#f3f3f3]"
            : "border-[#e4e4e4] bg-white"
        }`}
      >
        <span className="text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#3a3a3a]">
          {label}
        </span>
        <Chevron size={14} direction={open ? "up" : "down"} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key={menu}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.15, ease: EASE },
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              transition: { duration: 0.1, ease: "easeOut" },
            }}
            style={{ transformOrigin: "top left" }}
            className="absolute top-[40px] left-0 z-20 flex min-w-[200px] flex-col rounded-[10px] border border-[#e8e8e8] bg-white py-[4px] shadow-[0_12px_32px_0_rgba(0,0,0,0.10),0_2px_8px_0_rgba(0,0,0,0.06)]"
          >
            {options.map((o) => {
              const active = o.value === selected;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onPick(o.value)}
                  className="flex h-[32px] w-full items-center justify-between gap-[16px] px-[12px] text-left transition-colors duration-100 hover:bg-[#f7f7f5]"
                >
                  <span
                    className={`text-[13px] leading-[18px] whitespace-nowrap ${
                      active
                        ? "font-medium text-[#1a1a1a]"
                        : "text-[#3a3a3a]"
                    }`}
                  >
                    {o.label}
                  </span>
                  {active ? (
                    <span className="text-[11px] text-[#1a1a1a]">✓</span>
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- views */

function Grid({
  results,
  onOpen,
}: {
  results: ResourceRecord[];
  onOpen: (id: string) => void;
}) {
  const rows: ResourceRecord[][] = [];
  for (let i = 0; i < results.length; i += 2) rows.push(results.slice(i, i + 2));

  return (
    <div className="flex min-h-px w-full flex-1 flex-col gap-[16px] overflow-y-auto overscroll-contain [scrollbar-width:none]">
      {rows.map((row, i) => (
        <div key={i} className="flex w-full shrink-0 gap-[16px]">
          {row.map((r) => (
            <BandCard
              key={r.id}
              type={r.type}
              title={r.title}
              subtitle={r.sub}
              facts={r.facts}
              trailing={<UsageCount uses={r.uses} />}
              onOpen={() => onOpen(r.id)}
              className="min-w-px flex-1"
            />
          ))}
          {/* Keeps a lone card on the last row at column width. */}
          {row.length === 1 ? <div className="min-w-px flex-1" /> : null}
        </div>
      ))}
    </div>
  );
}

function List({
  results,
  onOpen,
}: {
  results: ResourceRecord[];
  onOpen: (id: string) => void;
}) {
  const label =
    "text-[11px] leading-[16px] font-medium tracking-[0.44px] text-[#9b9b9b]";

  return (
    <div className="min-h-px w-full flex-1 overflow-y-auto overscroll-contain rounded-[16px] border border-[#e8e8e8] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)] [scrollbar-width:none]">
      <div className="sticky top-0 z-[1] flex h-[40px] w-full items-center border-b border-[#ebebe8] bg-[#f7f7f5] px-[16px]">
        <span className={`min-w-px flex-1 ${label}`}>Resource</span>
        <span className={label} style={{ width: COLS.type }}>Type</span>
        <span className={label} style={{ width: COLS.deadline }}>Deadline</span>
        <span className={label} style={{ width: COLS.grade }}>Grade</span>
        <span style={{ width: COLS.chevron }} />
      </div>

      {results.map((r) => {
        const band = RESOURCE_TYPE[r.type];
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpen(r.id)}
            className="flex h-[56px] w-full items-center border-b border-[#efefef] px-[16px] text-left transition-colors duration-100 hover:bg-[#fafaf8]"
          >
            <span className="flex min-w-px flex-1 flex-col gap-px pr-[16px]">
              <span className="truncate text-[13px] leading-[18px] font-medium text-[#1a1a1a]">
                {r.title}
              </span>
              <span className="truncate text-[12px] leading-[16px] text-[#8a8a8a]">
                {r.facts}
              </span>
            </span>

            <span style={{ width: COLS.type }}>
              <span
                className="inline-flex items-center gap-[6px] rounded-full py-[4px] pr-[10px] pl-[8px] text-[11px] leading-[14px] font-medium whitespace-nowrap"
                style={{ background: band.bg, color: band.ink }}
              >
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ background: band.ink }}
                />
                {band.label}
              </span>
            </span>

            <span
              className="text-[13px] leading-[18px]"
              style={{
                width: COLS.deadline,
                color: r.deadline === "—" ? "#c4c4c4" : "#3a3a3a",
              }}
            >
              {r.deadline}
            </span>
            <span
              className="text-[13px] leading-[18px]"
              style={{
                width: COLS.grade,
                color: r.grade === "—" ? "#c4c4c4" : "#4a4a4a",
              }}
            >
              {r.grade}
            </span>
            <span
              className="flex justify-end"
              style={{ width: COLS.chevron }}
            >
              <Chevron size={14} className="-rotate-90" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Empty({ query }: { query: string }) {
  return (
    <div className="flex min-h-px w-full flex-1 flex-col items-center justify-center gap-[6px] rounded-[16px] border border-dashed border-[#dcdcdc]">
      <p className="text-[14px] leading-[20px] font-medium text-[#3a3a3a]">
        Nothing in the kit matches “{query.trim()}”
      </p>
      <p className="text-[12px] leading-[16px] text-[#9b9b9b]">
        Try a subject, a school, or add it as a new resource.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- drawer */

function Drawer({
  record,
  onClose,
}: {
  record: ResourceRecord;
  onClose: () => void;
}) {
  const band = RESOURCE_TYPE[record.type];
  const detail = getDetail(record);
  // Reduced motion: the panel still appears, it just doesn't travel.
  const still = useReducedMotion();

  return (
    <>
      <motion.button
        type="button"
        aria-label="Close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
        className="absolute inset-0 bg-[#1a1a1a]/[0.14]"
      />
      <motion.div
        initial={{ x: still ? 0 : 460, opacity: still ? 0 : 1 }}
        animate={{
          x: 0,
          opacity: 1,
          transition: { duration: 0.35, ease: DRAWER_EASE },
        }}
        exit={{
          x: still ? 0 : 460,
          opacity: still ? 0 : 1,
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        className="absolute top-0 right-0 bottom-0 flex w-[460px] flex-col overflow-hidden border-l border-[#e4e4e4] bg-white shadow-[-8px_0_28px_0_rgba(0,0,0,0.12)]"
      >
      <div className="flex w-full flex-col gap-[14px] px-[24px] pt-[24px] pb-[20px]">
        <div className="flex w-full items-center justify-between">
          <span
            className="inline-flex items-center rounded-full px-[10px] py-[4px] text-[11px] leading-[14px] font-medium whitespace-nowrap"
            style={{ background: band.bg, color: band.ink }}
          >
            {band.label}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[15px] leading-none text-[#8a8a8a]"
          >
            ✕
          </button>
        </div>
        <p className="text-[20px] leading-[27px] font-medium text-[#1a1a1a]">
          {record.title}
        </p>
        <p className="text-[13px] leading-[18px] text-[#6b6b6b]">
          {record.sub}
        </p>
      </div>

      <div className="h-px w-full bg-[#efefef]" />

      <div className="flex w-full flex-col gap-[11px] px-[24px] py-[20px]">
        {detail.facts.map(([k, v]) => (
          <div key={k} className="flex w-full items-start gap-[12px]">
            <span className="w-[96px] shrink-0 text-[13px] leading-[18px] text-[#8a8a8a]">
              {k}
            </span>
            <span className="min-w-px flex-1 text-[13px] leading-[18px] text-[#1a1a1a]">
              {v}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-[#efefef]" />

      {/* The link back to Live Meeting: what makes this appear mid-session. */}
      <div className="flex w-full flex-col gap-[12px] px-[24px] py-[20px]">
        <Eyebrow>Why this surfaces</Eyebrow>
        <div className="flex w-full flex-wrap gap-[6px]">
          {detail.conditions.map((c) => (
            <span
              key={c}
              className="rounded-[6px] bg-[#f1f1ef] px-[10px] py-[5px] text-[12px] leading-[16px] font-medium whitespace-nowrap text-[#3a3a3a]"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="text-[12px] leading-[16px] text-[#8a8a8a]">
          {detail.matched}
        </p>
      </div>

      {detail.usedWith.length > 0 ? (
        <>
          <div className="h-px w-full bg-[#efefef]" />
          <div className="flex w-full flex-col gap-[12px] px-[24px] py-[20px]">
            <Eyebrow>Used with</Eyebrow>
            <div className="flex items-center gap-[8px]">
              {detail.usedWith.map((initials) => (
                <span
                  key={initials}
                  className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#ededea] text-[11px] leading-[14px] font-medium text-[#6b6b66]"
                >
                  {initials}
                </span>
              ))}
              {detail.others > 0 ? (
                <span className="text-[12px] leading-[16px] text-[#8a8a8a]">
                  +{detail.others} others
                </span>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div className="min-h-px flex-1" />
      <div className="h-px w-full bg-[#efefef]" />

      <div className="flex w-full items-center gap-[8px] px-[24px] py-[16px]">
        <button
          type="button"
          className="flex h-[36px] min-w-px flex-1 items-center justify-center rounded-[8px] border border-[#e4e4e4] bg-white px-[14px] text-[13px] leading-[18px] font-medium text-[#3a3a3a]"
        >
          Add to a student
        </button>
        {["Share", "Edit"].map((l) => (
          <button
            key={l}
            type="button"
            className="flex h-[36px] shrink-0 items-center justify-center rounded-[8px] border border-[#e4e4e4] bg-white px-[14px] text-[13px] leading-[18px] font-medium text-[#3a3a3a]"
          >
            {l}
          </button>
        ))}
      </div>
      </motion.div>
    </>
  );
}

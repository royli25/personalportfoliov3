"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BandCard } from "./band-card";
import { EXTRACTION, KIT_ADDITION, RESOURCE_TYPE } from "../data/resources";
import type { AddResourceModal } from "../state/types";
import type { DemoAction } from "../state/actions";

/**
 * BlueprintX — Flow C's add-resource modal.
 *
 * One component, three stages, all read from the reducer:
 *   source     — three ways in; "Paste a link" is the live path
 *   link       — a REAL empty input; the advisor drops the URL in
 *   extracting — the checklist ticks on the extract script's clock, and
 *                once `done` the same page becomes the confirm: full card
 *                preview, suggested rules, and an armed "Add to kit".
 *
 * There is no separate review screen — everything gets extracted, and you
 * confirm where you watched it happen. The stages share one shell so the
 * take cuts between them without the window moving. Nothing in here owns
 * time — the checklist is driven by `modal.step` from the Beat[] script.
 */
export function AddResourceModalView({
  modal,
  dispatch,
}: {
  modal: AddResourceModal;
  dispatch: (action: DemoAction) => void;
}) {
  const still = useReducedMotion();
  return (
    <>
      {/* Scrim covers the whole window, sidebar included (Figma C1 fix). */}
      <motion.button
        type="button"
        aria-label="Close"
        onClick={() => dispatch({ type: "MODAL_DISMISSED" })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
        className="absolute inset-0 z-20 bg-[#1a1a1a]/[0.28]"
      />
      <motion.div
        // Modals scale from centre (they anchor to the viewport, not a
        // trigger) and never from 0 — a shape, then the shape settles.
        initial={{ opacity: 0, scale: still ? 1 : 0.96 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
        }}
        exit={{
          opacity: 0,
          scale: still ? 1 : 0.98,
          transition: { duration: 0.15, ease: "easeOut" },
        }}
        className="absolute top-1/2 left-1/2 z-30 flex w-[640px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_18px_48px_0_rgba(0,0,0,0.22)]"
        style={{ x: "-50%", y: "-50%" }}
      >
        {/* Stage swap: a short crossfade; the shell itself never moves. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={modal.stage}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.15, ease: "easeOut" },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeOut" } }}
            className="flex w-full flex-col"
          >
            {modal.stage === "source" && <SourceStage dispatch={dispatch} />}
            {modal.stage === "link" && (
              <LinkStage url={modal.url} dispatch={dispatch} />
            )}
            {modal.stage === "extracting" && (
              <ExtractingStage
                step={modal.step}
                url={modal.url}
                done={modal.done}
                dispatch={dispatch}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ---------------------------------------------------------------- shell */

function Head({
  title,
  sub,
  onClose,
}: {
  title: string;
  sub: string;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex w-full items-start justify-between gap-[16px] px-[22px] pt-[20px] pb-[18px]">
        <div className="flex min-w-px flex-1 flex-col gap-[3px]">
          <p className="text-[16px] leading-[22px] font-medium text-[#1a1a1a]">
            {title}
          </p>
          <p className="text-[13px] leading-[18px] text-[#6b6b6b]">{sub}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-[15px] leading-none text-[#8a8a8a]"
        >
          ✕
        </button>
      </div>
      <Rule />
    </>
  );
}

function Rule() {
  return <div className="h-px w-full shrink-0 bg-[#efefef]" />;
}

function Footer({
  note,
  children,
}: {
  note: string;
  children: ReactNode;
}) {
  return (
    <>
      <Rule />
      <div className="flex w-full items-center gap-[8px] px-[22px] py-[14px]">
        <span className="min-w-px flex-1 text-[12px] leading-[16px] text-[#9b9b9b]">
          {note}
        </span>
        {children}
      </div>
    </>
  );
}

function GhostButton({
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
      className="flex h-[34px] items-center rounded-[8px] border border-[#e4e4e4] bg-white px-[14px] text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#3a3a3a] transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

/** Primary — white like everything else; disabled washes out, never greys. */
function PrimaryButton({
  children,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[34px] items-center rounded-[8px] border px-[14px] text-[13px] leading-[18px] font-medium whitespace-nowrap ${
        disabled
          ? "border-[#ececec] bg-white text-[#b8b8b8]"
          : "border-[#e4e4e4] bg-white text-[#3a3a3a] transition-transform duration-150 ease-out active:scale-[0.97]"
      }`}
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- source */

const SOURCES: { key: string; label: string; hint: string; live?: boolean }[] = [
  {
    key: "link",
    label: "Paste a link",
    hint: "We read the page and fill in deadline, cost and eligibility",
    live: true,
  },
  { key: "files", label: "Upload files", hint: "PDF, DOCX or CSV · up to 20 at a time" },
  {
    key: "insight",
    label: "Import from an insight",
    hint: "12 things surfaced in meetings were never saved to the kit",
  },
];

function SourceStage({ dispatch }: { dispatch: (a: DemoAction) => void }) {
  return (
    <>
      <Head
        title="Add to Resource Kit"
        sub="Anything in the kit can surface on its own during a live meeting."
        onClose={() => dispatch({ type: "MODAL_DISMISSED" })}
      />
      <div className="flex w-full flex-col gap-[10px] px-[22px] py-[18px]">
        {SOURCES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={s.live ? () => dispatch({ type: "SOURCE_CHOSEN" }) : undefined}
            className={`flex w-full items-center gap-[14px] rounded-[10px] border border-[#e4e4e4] bg-white p-[14px] text-left ${
              s.live ? "transition-[color,background-color,transform] duration-150 ease-out hover:bg-[#fafaf8] active:scale-[0.98]" : ""
            }`}
          >
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-[#f4f4f2] text-[15px] text-[#4a4a4a]">
              {s.key === "link" ? "⎘" : s.key === "files" ? "↑" : "✳"}
            </span>
            <span className="flex min-w-px flex-1 flex-col gap-[2px]">
              <span className="text-[14px] leading-[20px] font-medium text-[#1a1a1a]">
                {s.label}
              </span>
              <span className="text-[12px] leading-[16px] text-[#8a8a8a]">
                {s.hint}
              </span>
            </span>
            <span className="text-[13px] text-[#c4c4c4]">›</span>
          </button>
        ))}

        <div className="flex h-[78px] w-full flex-col items-center justify-center gap-[4px] rounded-[10px] border border-dashed border-[#dcdcdc]">
          <p className="text-[13px] leading-[18px] font-medium text-[#6b6b6b]">
            or drop files anywhere in this window
          </p>
          <p className="text-[12px] leading-[16px] text-[#a0a0a0]">
            Everything stays private to your team until you share it
          </p>
        </div>
      </div>
      <Footer note="">
        <GhostButton onClick={() => dispatch({ type: "MODAL_DISMISSED" })}>
          Cancel
        </GhostButton>
        <PrimaryButton disabled>Continue</PrimaryButton>
      </Footer>
    </>
  );
}

/* ------------------------------------------------------------------ link */

/**
 * URL entry — the advisor drops the link in themselves. A real input, empty
 * on arrival; Continue stays greyed until there's something to read.
 */
function LinkStage({
  url,
  dispatch,
}: {
  url: string;
  dispatch: (a: DemoAction) => void;
}) {
  const ready = url.trim().length > 0;
  return (
    <>
      <Head
        title="Paste a link"
        sub="We read the page and fill in deadline, cost and eligibility."
        onClose={() => dispatch({ type: "MODAL_DISMISSED" })}
      />
      <div className="flex w-full flex-col gap-[10px] px-[22px] py-[18px]">
        <div className="flex h-[42px] w-full items-center gap-[10px] rounded-[10px] border border-[#1a1a1a] bg-white px-[14px]">
          <span className="text-[13px] text-[#9b9b9b]">⎘</span>
          <input
            autoFocus
            value={url}
            onChange={(e) =>
              dispatch({ type: "URL_DRAFTED", text: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") dispatch({ type: "LINK_SUBMITTED" });
            }}
            placeholder="https://oge.mit.edu/…"
            className="min-w-px flex-1 bg-transparent text-[13px] leading-[18px] text-[#1a1a1a] outline-none placeholder:text-[#b8b8b8]"
          />
        </div>
        <p className="text-[12px] leading-[16px] text-[#9b9b9b]">
          Program pages, lab sites, scholarship listings — anything public.
        </p>
      </div>
      <Footer note="">
        <GhostButton onClick={() => dispatch({ type: "MODAL_DISMISSED" })}>
          Cancel
        </GhostButton>
        <PrimaryButton
          disabled={!ready}
          onClick={() => dispatch({ type: "LINK_SUBMITTED" })}
        >
          Continue
        </PrimaryButton>
      </Footer>
    </>
  );
}

/* ----------------------------------------------------------- extracting */

/** The band the addition will wear once it's in the kit — the skeleton wears
 *  it too, so the preview can't contradict the type step 2 just detected. */
const ADDED_TYPE = RESOURCE_TYPE[KIT_ADDITION.type];

function ExtractingStage({
  step,
  url,
  done,
  dispatch,
}: {
  step: number;
  url: string;
  done: boolean;
  dispatch: (a: DemoAction) => void;
}) {
  return (
    <>
      <Head
        title={done ? "Ready to add" : "Reading the page…"}
        sub={
          done
            ? "Check the card — this is exactly what an advisor sees mid-meeting."
            : "This usually takes a few seconds. You can edit anything afterwards."
        }
        onClose={() => dispatch({ type: "MODAL_DISMISSED" })}
      />
      <div className="flex w-full flex-col gap-[16px] px-[22px] py-[18px]">
        <div className="flex w-full items-center gap-[10px] rounded-[8px] border border-[#ebebeb] bg-[#fafafa] px-[12px] py-[9px]">
          <span className="min-w-px flex-1 truncate text-[13px] leading-[18px] text-[#3a3a3a]">
            {url}
          </span>
          <span className="text-[12px] leading-[16px] font-medium text-[#8a8a8a]">
            Change
          </span>
        </div>

        <div className="flex w-full flex-col gap-[12px]">
          {EXTRACTION.steps.map((label, i) => {
            const done = step > i;
            const busy = step === i;
            return (
              <div key={label} className="flex w-full items-center gap-[10px]">
                <motion.span
                  key={done ? "done" : busy ? "busy" : "wait"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.15, ease: "easeOut" },
                  }}
                  className="flex h-[16px] w-[16px] shrink-0 items-center justify-center"
                >
                  {done ? (
                    <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#e9f0eb] text-[9px] leading-none text-[#2f7a44]">
                      ✓
                    </span>
                  ) : busy ? (
                    <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#f1f1ef]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#6b6b6b]" />
                    </span>
                  ) : (
                    <span className="h-[15px] w-[15px] rounded-full border-[1.3px] border-[#dcdcdc]" />
                  )}
                </motion.span>
                <span
                  className={`min-w-px flex-1 text-[13px] leading-[18px] ${
                    done || busy
                      ? "font-medium text-[#1a1a1a]"
                      : "text-[#a0a0a0]"
                  }`}
                >
                  {label}
                </span>
                {busy ? (
                  <span className="text-[12px] leading-[16px] text-[#b0b0b0]">
                    working
                  </span>
                ) : done ? (
                  <span className="text-[12px] leading-[16px] text-[#b0b0b0]">
                    done
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex w-full flex-col gap-[10px]">
          <Eyebrow>{done ? "How it will appear" : "Preview"}</Eyebrow>
          {done ? (
            <BandCard
              type={KIT_ADDITION.type}
              title={KIT_ADDITION.title}
              subtitle={KIT_ADDITION.sub}
              facts={KIT_ADDITION.facts}
              trailing={
                <span className="text-[11px] leading-[16px] font-medium text-[#9b9b96]">
                  now
                </span>
              }
            />
          ) : (
            // Skeleton fills in as fields land — title after step 2, facts after step 3.
            <div className="flex w-full flex-col gap-[11px] rounded-[12px] border border-[#e8e8e8] bg-white p-[14px] shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)]">
            <div className="flex w-full items-center justify-between">
              {/* Derived, never typed: the pill IS the type step 2 detected. */}
              <span
                className="inline-flex items-center gap-[6px] rounded-full py-[4px] pr-[10px] pl-[8px] text-[11px] leading-[14px] font-medium"
                style={{ background: ADDED_TYPE.bg, color: ADDED_TYPE.ink }}
              >
                <span
                  className="h-[6px] w-[6px] rounded-full"
                  style={{ background: ADDED_TYPE.ink }}
                />
                {ADDED_TYPE.label}
              </span>
              <Skeleton w={28} />
            </div>
            {step >= 2 ? (
              <p className="text-[14px] leading-[19px] font-semibold text-[#1a1a1a]">
                {KIT_ADDITION.title}
              </p>
            ) : (
              <Skeleton w={220} />
            )}
            <Rule />
            {step >= 3 ? (
              <p className="text-[12px] leading-[16px] text-[#8a8a8a]">
                {KIT_ADDITION.facts}
              </p>
            ) : (
              <div className="flex items-center gap-[8px]">
                <Skeleton w={96} />
                <Skeleton w={64} />
                <Skeleton w={120} />
              </div>
            )}
            </div>
          )}

          {done ? (
            <>
              <div className="h-[2px]" />
              <Eyebrow>Surfacing rules · suggested</Eyebrow>
              <div className="flex w-full flex-wrap gap-[6px]">
                {EXTRACTION.suggestedRules.map((r) => (
                  <span
                    key={r}
                    className="rounded-[6px] bg-[#f1f1ef] px-[10px] py-[5px] text-[12px] leading-[16px] font-medium whitespace-nowrap text-[#3a3a3a]"
                  >
                    {r}
                  </span>
                ))}
              </div>
              <p className="text-[12px] leading-[16px] text-[#8a8a8a]">
                {EXTRACTION.matchNote}
              </p>
            </>
          ) : null}
        </div>
      </div>
      <Footer
        note={
          done
            ? "4 of 4 fields read · everything checks out"
            : `Reading ${Math.min(step + 1, 4)} of 4 fields`
        }
      >
        <GhostButton onClick={() => dispatch({ type: "MODAL_DISMISSED" })}>
          Cancel
        </GhostButton>
        <PrimaryButton
          disabled={!done}
          onClick={() => dispatch({ type: "RESOURCE_SAVED" })}
        >
          Add to kit
        </PrimaryButton>
      </Footer>
    </>
  );
}

function Skeleton({ w }: { w: number }) {
  return (
    <span
      className="block h-[10px] shrink-0 rounded-[4px] bg-[#f0f0f0]"
      style={{ width: w }}
    />
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] leading-[16px] font-medium tracking-[0.44px] text-[#9b9b9b]">
      {children}
    </p>
  );
}

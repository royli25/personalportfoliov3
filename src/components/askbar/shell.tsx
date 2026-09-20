"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ActionItems,
  Catchup,
  ChevronDown,
  Grid,
  Mic,
  Plus,
  RecentsClock,
  SendArrow,
  SlashKey,
  Summarize,
} from "./icons";

/* ── The interactive Ask Bar (Figma section 230:1234) ──────────────────────
   Three states, driven by real interaction rather than a timeline:

     rest   — the bare pill: placeholder + one suggested run.
     focus  — a shell grows around the pill: quick-action shelf above,
              scope/attach/mic controls inside.
     slash  — "/" as the first character raises the command palette:
              recents first with personal usage, then team commands with
              team-wide counts. The input row rides at the bottom throughout.

   One <input> lives through every state — the shell changes around it, so
   focus is never lost or handed off, and the whole state machine derives
   from two facts: is the input focused, and does its value start with "/".

   Geometry morphs are springs; colour and shadow are short tweens. The
   above-input slot animates to the *measured* height of whichever layer is
   showing (palette height moves as filtering changes the row count), with
   both layers stacked and cross-faded — mount/unmount would drop the
   palette's height to zero before the exit finished. Values are verbatim
   from the design; do not round them.
   ────────────────────────────────────────────────────────────────────────── */

type Command = {
  title: string;
  desc: string;
  /** "used 41×" for your recents; "Team · 312" for shared commands. */
  trailing: string;
};

const RECENT: Command[] = [
  {
    title: "Past student",
    desc: "Pull a past advisee with a matching profile and outcome",
    trailing: "used 41×",
  },
  {
    title: "Draft recap email",
    desc: "Post-meeting summary for the student and family",
    trailing: "used 26×",
  },
];

const TEAM: Command[] = [
  {
    title: "Compare schools",
    desc: "Fit, admit rate and net cost across their target list",
    trailing: "Team · 312",
  },
  {
    title: "Find programs",
    desc: "Summer research and pre-college fits for their major",
    trailing: "Team · 208",
  },
  {
    title: "Scholarship match",
    desc: "Merit and aid they qualify for right now",
    trailing: "Team · 154",
  },
  {
    title: "Build timeline",
    desc: "Every deadline from today to submission",
    trailing: "Team · 97",
  },
];

const QUICK = [
  { label: "Summarize so far", Icon: Summarize },
  { label: "Catch up", Icon: Catchup },
  { label: "Action items", Icon: ActionItems },
] as const;

const SCOPES = ["This meeting", "Full Database"] as const;

const SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;

/* Buttons around the input must not steal its focus — losing focus is what
   closes the shell, so a shelf click would dismiss the thing it lives in. */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function AskBarShell({
  onOpenChange,
}: {
  /** Fires as the shell opens/closes, for hosts that stage the bar — the demo
      floats it mid-canvas at rest and docks it on focus. */
  onOpenChange?: (open: boolean) => void;
}) {
  const reduced = useReducedMotion() ?? false;

  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  /* The armed command. Selecting anywhere — palette, shelf, the resting
     suggestion — tokenizes here rather than pasting text, so the free-text
     value stays the command's *argument*. */
  const [chip, setChip] = useState<string | null>(null);
  const [scope, setScope] = useState(0);
  const [selected, setSelected] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const [shelfH, setShelfH] = useState(0);
  const [paletteH, setPaletteH] = useState(0);
  /* Past one line the bar re-forms in two steps: first the controls drop to
     their own row (`multi`), then — only when the text wraps even at full
     width — the chip takes the first line for itself (`stack`). Measured,
     see the autosize effect. */
  const [multi, setMulti] = useState(false);
  const [stack, setStack] = useState(false);
  const ctlRef = useRef<HTMLDivElement>(null);
  /* The chip renders absolutely over the textarea's first line, and the
     text clears it with text-indent — so wrapped lines flow back under the
     chip at full width, the way a real inline token would. */
  const chipRef = useRef<HTMLSpanElement>(null);
  const [chipW, setChipW] = useState(0);
  useLayoutEffect(() => {
    setChipW(chip && chipRef.current ? chipRef.current.offsetWidth : 0);
  }, [chip]);

  const mode: "rest" | "focus" | "slash" = !focused
    ? "rest"
    : value.startsWith("/")
      ? "slash"
      : "focus";

  /* Palette filtering: everything after the "/" matches against titles and
     descriptions. Selection is one flat index across both sections. */
  const query = value.startsWith("/") ? value.slice(1).trim().toLowerCase() : "";
  const [recent, team] = useMemo(() => {
    if (!query) return [RECENT, TEAM];
    const hit = (c: Command) =>
      c.title.toLowerCase().includes(query) ||
      c.desc.toLowerCase().includes(query);
    return [RECENT.filter(hit), TEAM.filter(hit)];
  }, [query]);
  const flat = useMemo(() => [...recent, ...team], [recent, team]);

  /* Selection resets when the filter changes AND each time the palette
     opens — without the latter, a fresh "/" inherits wherever the arrows
     left the highlight last session. */
  useEffect(() => setSelected(0), [query]);
  useEffect(() => {
    if (mode === "slash") setSelected(0);
  }, [mode]);

  useEffect(() => {
    onOpenChange?.(focused);
  }, [focused, onOpenChange]);

  /* The slot's height follows whichever layer is visible — measured, because
     filtering changes the palette's natural height row by row. */
  useLayoutEffect(() => {
    const els = [
      [shelfRef.current, setShelfH],
      [paletteRef.current, setPaletteH],
    ] as const;
    const ros = els.map(([el, set]) => {
      if (!el) return null;
      set(el.offsetHeight);
      const ro = new ResizeObserver(() => set(el.offsetHeight));
      ro.observe(el);
      return ro;
    });
    return () => ros.forEach((ro) => ro?.disconnect());
  }, []);

  const run = useCallback((cmd: Command) => {
    /* Selecting arms the command as a chip and clears the value — the slash
       prefix drops with it, so the palette closes on its own and what you
       type next is the command's argument. */
    setChip(cmd.title);
    setValue("");
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setValue((v) => (v.startsWith("/") ? "" : "/"));
      return;
    }
    /* The chip deletes like text: Backspace at an empty caret takes it. */
    if (e.key === "Backspace" && value === "" && chip) {
      e.preventDefault();
      setChip(null);
      return;
    }
    if (mode === "slash") {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((i) => Math.min(i + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flat[selected]) {
        e.preventDefault();
        run(flat[selected]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setValue("");
      }
      return;
    }
    /* Escape unwinds one level: armed chip, then focus. */
    if (e.key === "Escape") {
      if (chip) setChip(null);
      else inputRef.current?.blur();
    }
    /* Chat manners: Enter sends, Shift+Enter breaks the line. */
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || chip) {
        setValue("");
        setChip(null);
      }
    }
  };

  const open = mode !== "rest";
  /* The shelf stays up while a chip is armed — picking a quick action then
     simply swaps the chip, same as re-opening the palette with "/". */
  const slotH = mode === "slash" ? paletteH : mode === "focus" ? shelfH : 0;

  /* The field grows with its content, chat-style — measured, not
     row-counted, so soft wrapping and hard newlines behave identically;
     capped so a paste can't swallow the canvas.

     Three text layouts, decided by ghost-measuring "would one line fit?"
     at the width and indent of the layout in question:
       chip + text + controls   — everything inline (fits beside controls)
       chip + text / controls   — controls drop (`multi`), text still
                                  indents around the chip at full width
       chip / text / controls   — wraps even at full width, so the chip
                                  takes the first line (`stack`)
     Line counts are (scrollHeight − padding) / 18, which makes the
     decisions independent of whichever padding the current layout wears —
     that's what keeps the fixed point stable instead of flapping. */
  useLayoutEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;

    ta.style.height = "0px";
    const natural = ta.scrollHeight;

    const cs = getComputedStyle(ta);
    const padTotal = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const ctlW = ctlRef.current ? ctlRef.current.offsetWidth + 10 : 0;
    /* Read width before touching flex — `flex: none` alone lets the
       textarea collapse, and a ghost against that sliver lies. */
    const wFull = ta.clientWidth + (multi ? 0 : ctlW);

    const prev = {
      flex: ta.style.flex,
      width: ta.style.width,
      textIndent: ta.style.textIndent,
    };
    ta.style.flex = "none";
    const linesAt = (w: number) => {
      ta.style.width = `${w}px`;
      if (chip) ta.style.textIndent = `${chipW + 8}px`;
      ta.style.height = "0px";
      return Math.round((ta.scrollHeight - padTotal) / 18);
    };
    const fitsBesideControls = linesAt(wFull - ctlW) <= 1;
    const fitsFullWidth = fitsBesideControls || linesAt(wFull) <= 1;
    ta.style.flex = prev.flex;
    ta.style.width = prev.width;
    ta.style.textIndent = prev.textIndent;
    ta.style.height = `${Math.min(natural, 160)}px`;

    setMulti(!fitsBesideControls);
    setStack(!fitsBesideControls && !fitsFullWidth);
  }, [value, chip, chipW, open, multi, stack]);

  const geometry = reduced ? { duration: 0 } : SPRING;
  const paint = { duration: reduced ? 0 : 0.18 };

  /* The right-hand cluster — inline beside a single line of text, dropped to
     its own row once the text goes multiline. One JSX, two homes; only one
     mounts at a time, so they share the measuring ref. The layoutId is what
     makes the move a move: without it the cluster teleports between homes,
     with it Motion FLIPs the same element along the spring — and it also
     rides smoothly downward as wrapped lines push it. The text itself always
     reflows instantly (it's the thing being typed); only furniture animates. */
  const controls = (
    <motion.div
      ref={ctlRef}
      layoutId="askbar-controls"
      transition={geometry}
      className="flex shrink-0 items-center gap-[10px]"
    >
      {!open ? (
        !chip &&
        !value.trim() && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            onClick={() => {
              setChip("Fetch Sample Students");
              setValue("");
              inputRef.current?.focus();
            }}
            className="flex shrink-0 cursor-pointer items-center gap-[8px] rounded-[20px] border border-[#dddddd] bg-[#f3f3f3] px-[15px] py-[10px]"
          >
            <SlashKey className="size-[13px] shrink-0" />
            <span className="whitespace-nowrap text-[13px] font-medium leading-[18px] text-black/60">
              Fetch Sample Students
            </span>
          </button>
        )
      ) : (
        <>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            onClick={() => setScope((s) => (s + 1) % SCOPES.length)}
            className="flex shrink-0 cursor-pointer items-center gap-[7px] rounded-[14px] border border-[#e6e5e2] bg-[#f5f5f2] py-[6px] pr-[9px] pl-[11px]"
          >
            <span className="whitespace-nowrap text-[12px] font-medium leading-[17px] text-[#5a5854]">
              {SCOPES[scope]}
            </span>
            <ChevronDown className="size-[10px] shrink-0" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            aria-label="Attach"
            className="flex shrink-0 cursor-pointer items-center rounded-full p-[8px] hover:bg-black/[0.04]"
          >
            <Plus className="size-[15px]" />
          </button>
          {value.trim() || chip ? (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={keepFocus}
              onClick={() => {
                setValue("");
                setChip(null);
              }}
              aria-label="Send"
              className="flex size-[33px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f1f1ee] hover:bg-[#e9e9e5]"
            >
              <SendArrow className="size-[17px]" />
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={keepFocus}
              aria-label="Dictate"
              className="flex shrink-0 cursor-pointer items-center rounded-full bg-[#f1f1ee] p-[9px]"
            >
              <Mic className="size-[15px]" />
            </button>
          )}
        </>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: open ? "#f4f4f2" : "rgba(244,244,242,0)",
        borderColor: open ? "#e3e2df" : "rgba(227,226,223,0)",
        boxShadow: open
          ? "0px 1px 2px 0px rgba(0,0,0,0.04), 0px 14px 36px -8px rgba(0,0,0,0.1)"
          : "0px 1px 2px 0px rgba(0,0,0,0), 0px 14px 36px -8px rgba(0,0,0,0)",
        paddingTop: open ? 4 : 0,
        paddingLeft: open ? 8 : 0,
        paddingRight: open ? 8 : 0,
        paddingBottom: open ? 8 : 0,
      }}
      transition={{
        ...geometry,
        backgroundColor: paint,
        borderColor: paint,
        boxShadow: paint,
      }}
      className="w-full rounded-[34px] border"
    >
      {/* ── Above-input slot: shelf and palette stacked, cross-faded ── */}
      <motion.div
        initial={false}
        animate={{ height: slotH }}
        transition={geometry}
        className="relative overflow-hidden"
      >
        {/* Shelf — quick actions (02) */}
        <motion.div
          ref={shelfRef}
          initial={false}
          animate={{ opacity: mode === "focus" ? 1 : 0 }}
          transition={paint}
          style={{ pointerEvents: mode === "focus" ? "auto" : "none" }}
          className="absolute inset-x-0 top-0 flex items-center gap-[4px] py-[6px] pl-[6px] pr-[8px]"
          aria-hidden={mode !== "focus"}
        >
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            onClick={() => setValue("/")}
            aria-label="Recent commands"
            className="flex shrink-0 cursor-pointer items-center rounded-[9px] py-[7px] pr-[6px] pl-[8px] hover:bg-black/[0.04]"
          >
            <RecentsClock className="size-[15px]" />
          </button>
          {QUICK.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              tabIndex={-1}
              onMouseDown={keepFocus}
              onClick={() => {
                setChip(label);
                setValue("");
                inputRef.current?.focus();
              }}
              className="flex shrink-0 cursor-pointer items-center gap-[8px] rounded-[9px] py-[7px] pr-[11px] pl-[9px] hover:bg-black/[0.04]"
            >
              <Icon className="size-[14px]" />
              <span className="whitespace-nowrap text-[12.5px] font-medium leading-[17px] text-[#5f5d58]">
                {label}
              </span>
            </button>
          ))}
          <span className="min-w-0 flex-1" />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            onClick={() => setValue("/")}
            className="flex shrink-0 cursor-pointer items-center gap-[8px] rounded-[9px] py-[7px] pr-[10px] pl-[9px] hover:bg-black/[0.04]"
          >
            <Grid className="size-[14px]" />
            <span className="whitespace-nowrap text-[12.5px] font-medium leading-[17px] text-[#5f5d58]">
              All commands
            </span>
          </button>
        </motion.div>

        {/* Palette — recents first, then the team's commands (03) */}
        <motion.div
          ref={paletteRef}
          initial={false}
          animate={{ opacity: mode === "slash" ? 1 : 0 }}
          transition={paint}
          style={{ pointerEvents: mode === "slash" ? "auto" : "none" }}
          className="absolute inset-x-0 top-0 pb-[5px]"
          aria-hidden={mode !== "slash"}
        >
          <div className="flex items-center px-[14px] pt-[12px] pb-[6px]">
            <span className="text-[10.5px] font-medium tracking-[0.84px] text-[#a5a39e]">
              {recent.length ? "RECENT" : "ALL COMMANDS"}
            </span>
            <span className="flex-1" />
            <span className="text-[11.5px] whitespace-pre text-[#a5a39e]">
              {"All commands  ⌘K"}
            </span>
          </div>

          <div role="listbox" aria-label="Commands" id="askbar-commands" className="flex flex-col gap-[2px]">
            {recent.map((cmd, i) => (
              <CommandRow
                key={cmd.title}
                cmd={cmd}
                active={selected === i}
                onHover={() => setSelected(i)}
                onRun={() => run(cmd)}
              />
            ))}

            {recent.length > 0 && team.length > 0 && (
              <div className="flex items-center px-[14px] pt-[12px] pb-[6px]">
                <span className="text-[10.5px] font-medium tracking-[0.84px] text-[#a5a39e]">
                  ALL COMMANDS
                </span>
              </div>
            )}

            {team.map((cmd, i) => (
              <CommandRow
                key={cmd.title}
                cmd={cmd}
                active={selected === recent.length + i}
                onHover={() => setSelected(recent.length + i)}
                onRun={() => run(cmd)}
              />
            ))}

            {flat.length === 0 && (
              <p className="px-[14px] py-[14px] text-[12.5px] text-[#a5a39e]">
                No commands match “{query}”
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── The input row — the one element every state shares ── */}
      {/* minHeight, not height: one line keeps the original inline geometry;
          past that (`multi`) the bar re-forms — text spans the full width
          and the controls take their own row underneath. */}
      <motion.div
        initial={false}
        animate={{
          minHeight: open ? 53 : 58,
          borderRadius: open ? 26 : 35,
          borderColor: open ? "#dcdbd7" : "#e4e4e4",
          boxShadow: open
            ? "0px 2px 6px 0px rgba(0,0,0,0.05)"
            : "0px 2px 8px 0px rgba(0,0,0,0.05)",
          paddingRight: open ? 10 : 12,
        }}
        transition={{
          ...geometry,
          borderColor: paint,
          boxShadow: paint,
        }}
        className="flex flex-col justify-center border bg-white pl-[18px]"
      >
        <div
          className={`relative flex gap-[10px] ${multi ? "items-start" : "items-center"}`}
        >
        {/* The armed command, tokenized. It reads like the palette row it came
            from — glyph square, title — shrunk to caret height. Absolute over
            the first line; the textarea's text-indent keeps clear of it. */}
        {chip && (
          <motion.span
            ref={chipRef}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={geometry}
            className={`absolute left-0 flex max-w-[50%] items-center gap-[7px] rounded-full border border-[#e6e5e2] bg-[#f5f5f2] py-[4px] pr-[5px] pl-[10px] ${
              open ? "top-[12px]" : "top-[14.5px]"
            }`}
          >
            <SlashKey className="size-[12px] shrink-0" />
            <span className="truncate text-[12.5px] font-medium leading-[17px] text-[#1a1a1a]">
              {chip}
            </span>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={keepFocus}
              onClick={() => {
                setChip(null);
                inputRef.current?.focus();
              }}
              aria-label={`Remove ${chip}`}
              className="flex shrink-0 cursor-pointer items-center rounded-full p-[3px] text-[#8d8b86] hover:bg-black/[0.06] hover:text-[#1a1a1a]"
            >
              {/* Not a design asset — the chip itself is a judgment call. */}
              <svg viewBox="0 0 10 10" className="size-[9px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" />
              </svg>
            </button>
          </motion.span>
        )}

        <motion.textarea
          ref={inputRef}
          value={value}
          rows={1}
          role="combobox"
          aria-expanded={mode === "slash"}
          aria-controls="askbar-commands"
          aria-label="Ask anything about this meeting"
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          placeholder={
            chip
              ? "Add details…"
              : open
                ? "Ask anything, or  /  for commands"
                : "Ask anything about this meeting…"
          }
          /* Padding centres the single 18px line inside the row's *inner*
             height (min-height is border-box: 53/58 minus 2px of border).
             Class-set, never animated — the autosize effect measures
             scrollHeight, and animated padding would make that measurement
             race the spring. The effect owns `height`. */
          className={`min-w-0 flex-1 resize-none overflow-y-auto bg-transparent text-[13px] leading-[18px] text-[#1a1a1a] caret-[#1a1a1a] outline-none placeholder:text-black/55 ${
            open
              ? stack
                ? "pt-[45px] pb-[10px]" /* chip line reserved above the text */
                : multi
                  ? "pt-[16.5px] pb-[10px]"
                  : "py-[16.5px]"
              : stack
                ? "pt-[47px] pb-[19px]"
                : "py-[19px]"
          }`}
          style={{
            fontWeight: value.startsWith("/") ? 500 : 400,
            /* The token indent holds as long as the text shares the chip's
               line; `stack` reserves the whole first line via padding
               instead, where an indent would drift wrapped text under the
               chip. */
            textIndent: chip && !stack ? chipW + 8 : undefined,
          }}
        />

        {!multi && controls}
        </div>

        {/* The dropped controls row. Multi + open only: at rest there is
            nothing to drop — the suggestion only exists beside an empty
            single line, and an empty line is never multi. */}
        {multi && open && (
          <div className="flex shrink-0 items-center justify-end pb-[10px]">
            {controls}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function CommandRow({
  cmd,
  active,
  onHover,
  onRun,
}: {
  cmd: Command;
  active: boolean;
  onHover: () => void;
  onRun: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      tabIndex={-1}
      onMouseDown={keepFocus}
      onMouseEnter={onHover}
      onClick={onRun}
      className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[14px] py-[9px] pr-[12px] pl-[10px] text-left ${
        active
          ? "border border-[#e6e5e2] bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)]"
          : "border border-transparent"
      }`}
    >
      <span
        className={`flex shrink-0 items-start rounded-[8px] p-[6px] ${
          active ? "bg-[#f5f5f2]" : "bg-[#ecebe8]"
        }`}
      >
        <SlashKey className="size-[14px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-[13px] font-medium leading-[18px] text-[#1a1a1a]">
          {cmd.title}
        </span>
        <span className="truncate text-[12px] leading-[16px] text-[#8d8b86]">
          {cmd.desc}
        </span>
      </span>
      <span className="shrink-0 whitespace-nowrap text-[11.5px] text-[#adaba6]">
        {cmd.trailing}
      </span>
    </button>
  );
}

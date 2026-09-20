import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  Chevron,
  DRAG,
  Icon,
  LivePill,
  Pill,
  type IconName,
  type Tone,
} from "./primitives";

/**
 * BlueprintX — the meeting column: who you're talking to, what you can ask,
 * and the transcript the assistant is reading as it runs.
 */

/* ------------------------------------------------------------------ header */

export function Breadcrumb({ trail }: { trail: string[] }) {
  const last = trail.length - 1;
  return (
    // Top bar doubles as a drag surface in the Electron shell.
    <div
      className="flex h-[48px] w-full shrink-0 items-center bg-[#f2f2f0] px-[20px] py-[10px]"
      style={DRAG}
    >
      <div className="flex items-center gap-[12.5px]">
        <Icon name="breadcrumb-back" size={18} />
        <div className="flex items-center gap-[8px] text-[13px] leading-[19px] whitespace-nowrap">
          {trail.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-[8px]">
              <span
                className={
                  i === last ? "font-medium text-black" : "text-[#6b6b6b]"
                }
              >
                {crumb}
              </span>
              {i === last ? null : <span className="text-[#c9c9c9]">/</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- student card */

export type TargetSchool = { name: string; fit: string; tone: Tone };

export type Student = {
  name: string;
  /** Grade and school, e.g. "12th · Princeton Day School". */
  meta: string;
  /** One line of academics, e.g. "GPA 3.94 · SAT 1480 · Major: Comp. Sci". */
  stats: string;
  targets: TargetSchool[];
  /** Photo if there is one; otherwise `initials` renders a monogram. */
  avatar?: string;
  initials?: string;
};

export function StudentCard({ student }: { student: Student }) {
  return (
    <Card className="w-full">
      <div className="flex items-center border-b border-[#ebebe8] bg-[#f5f5f3] px-[16px] py-[13px]">
        <div className="flex items-center gap-[12px]">
          {student.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={student.avatar}
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="h-[40px] w-[40px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#ededea] text-[14px] font-medium text-[#6b6b66]">
              {student.initials}
            </span>
          )}
          <div className="flex flex-col gap-[2px] whitespace-nowrap">
            <p className="text-[17px] leading-[22px] font-semibold text-[#1a1a1a]">
              {student.name}
            </p>
            <p className="text-[13px] leading-[18px] text-[#6b6b6b]">
              {student.meta}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[12px] px-[16px] pt-[14px] pb-[16px]">
        <p className="text-[13px] leading-[18px] whitespace-nowrap text-[#4a4a4a]">
          {student.stats}
        </p>
        <div className="flex w-full flex-wrap items-start gap-[6px]">
          {student.targets.map((school) => (
            <Pill key={school.name} tone={school.tone}>
              {school.name} · {school.fit}
            </Pill>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------ action chips */

export type Action = { label: string; icon: IconName };

/** Row of equal-width prompts above the transcript. */
export function ActionChips({ actions }: { actions: Action[] }) {
  return (
    <div className="flex w-full items-start gap-[8px]">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="flex min-w-px flex-1 items-center justify-center gap-[8px] rounded-[8px] border border-[#e4e4e4] bg-white px-[12px] py-[9px]"
        >
          <Icon name={action.icon} size={14} />
          <span className="text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#3a3a3a]">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- transcript */

export type Message = {
  body: string;
  /** The advisor's own lines get the blue gutter dot; everyone else is grey. */
  speaker?: "advisor" | "student";
};

export type DockedInsight = {
  /** Insight type, e.g. "Profile Surfaced". */
  label: string;
  /** What was found, e.g. "Jordan Lee · CS senior, Stanford". */
  detail: string;
  timestamp: string;
};

/**
 * Transcript card.
 *
 * The gutter is the whole idea: live speech and surfaced insights share one
 * dot rail, so an insight reads as something that happened *in* the meeting
 * rather than a notification stapled beside it.
 */
export function TranscriptCard({
  title = "Meeting Transcript",
  elapsed,
  messages,
  docked = [],
}: {
  title?: string;
  elapsed: string;
  messages: Message[];
  docked?: DockedInsight[];
}) {
  return (
    <Card className="w-full">
      <CardHeader title={title}>
        <LivePill elapsed={elapsed} />
        <Chevron direction="up" />
      </CardHeader>

      <div className="flex flex-col bg-[#fafafa] px-[18px] py-[16px]">
        <div className="flex w-full flex-col gap-[10px]">
          {messages.map((message, i) => (
            <div key={i} className="flex w-full items-start rounded-[8px]">
              <Gutter>
                <span
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{
                    background:
                      message.speaker === "advisor" ? "#31507f" : "#b9b9b3",
                  }}
                />
              </Gutter>
              <p className="min-w-px flex-1 text-[15px] leading-[22px] text-[#1a1a1a]">
                {message.body}
              </p>
            </div>
          ))}
        </div>

        {docked.length > 0 ? (
          <div className="flex w-full flex-col gap-[10px] pt-[10px]">
            {docked.map((insight) => (
              <div
                key={insight.label + insight.timestamp}
                className="flex w-full items-stretch"
              >
                <Gutter>
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#375c99]" />
                </Gutter>
                <div className="flex min-w-px flex-1 items-center gap-[9px] rounded-[10px] bg-[#eef4ff] py-[9px] pr-[13px] pl-[11px]">
                  <p className="text-[12px] leading-[16px] font-medium whitespace-nowrap text-black">
                    {insight.label}
                  </p>
                  <p className="text-[12px] leading-[16px] font-medium whitespace-nowrap text-[rgba(26,26,26,0.6)]">
                    {insight.detail}
                  </p>
                  <p className="min-w-px flex-1 text-right text-[10px] leading-[14px] text-[rgba(0,0,0,0.6)]">
                    {insight.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/** The 20px dot rail every feed row hangs off. */
function Gutter({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-[20px] shrink-0 flex-col items-start self-stretch">
      <div className="flex min-h-[16px] w-[20px] flex-1 items-center">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- command bar */

export function CommandBar({
  placeholder = "Ask anything about this meeting…",
  action,
}: {
  placeholder?: string;
  action: { label: string };
}) {
  return (
    <div className="flex w-full items-center gap-[10px] rounded-[35px] border border-[#e4e4e4] bg-white py-[10px] pr-[12px] pl-[18px] shadow-[0_2px_8px_0_rgba(0,0,0,0.05)]">
      <p className="min-w-px flex-1 text-[13px] leading-[18px] text-[rgba(0,0,0,0.6)]">
        {placeholder}
      </p>
      <button
        type="button"
        className="relative flex items-center gap-[10px] rounded-[20px] border border-[#e4e4e4] bg-white px-[15px] py-[10px]"
      >
        <Icon name="send" size={13} />
        <span className="text-[13px] leading-[19.5px] font-medium whitespace-nowrap text-[rgba(0,0,0,0.6)]">
          {action.label}
        </span>
      </button>
    </div>
  );
}

import type { ReactNode } from "react";
import { RESOURCE_TYPE, type ResourceType } from "../data/resources";

/**
 * BlueprintX — the banded card (Figma `Insight / Profile`, 270:11320).
 *
 * ONE CARD, ONE BAND, AND THE BAND'S RIGHT SLOT CHANGES WITH CONTEXT. The
 * same record is an *event* in a live meeting (it just happened; it wants a
 * decision) and a *record* in the Resource Kit (it has always been there;
 * you open it). Everything that identifies the resource — band tint, type
 * label, title, subtitle, rule, fact line — is identical in both places, and
 * only `trailing` differs:
 *
 *   meeting  → Add to notes · Dismiss
 *   library  → the usage count
 *
 * Build a third surface? Pass a third `trailing`. Don't fork the card — the
 * two drifting apart is exactly the bug this component exists to prevent.
 */
export function BandCard({
  type,
  title,
  subtitle,
  facts,
  trailing,
  onOpen,
  className = "",
}: {
  type: ResourceType;
  title: string;
  subtitle: string;
  facts: string;
  /** Right side of the band. */
  trailing?: ReactNode;
  onOpen?: () => void;
  className?: string;
}) {
  const band = RESOURCE_TYPE[type];

  const body = (
    <>
      <div
        className="flex h-[36px] w-full shrink-0 items-center justify-between border-b px-[16px]"
        style={{ background: band.bg, borderColor: band.line }}
      >
        <span
          className="text-[11px] leading-[16px] font-medium whitespace-nowrap"
          style={{ color: band.ink }}
        >
          {band.label}
        </span>
        {trailing}
      </div>

      <div className="flex w-full flex-col gap-[9px] px-[16px] pt-[11px] pb-[12px]">
        <div className="flex w-full flex-col gap-[2px]">
          <p className="text-[14px] leading-[19px] font-semibold text-[#1a1a1a]">
            {title}
          </p>
          <p className="text-[12px] leading-[16px] text-[#6b6b6b]">
            {subtitle}
          </p>
        </div>
        <div className="h-px w-full bg-[#efefef]" />
        <p className="text-[11px] leading-[16px] text-[#9a9a9a]">{facts}</p>
      </div>
    </>
  );

  // No width of its own — a grid row flexes it, the meeting rail fixes it at
  // 400. Hard-coding w-full here overflows any row holding two of them.
  const shell = `flex shrink-0 flex-col overflow-hidden rounded-[14px] border border-[#e8e8e8] bg-white text-left shadow-[0_2px_6px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.04)] ${className}`;

  if (!onOpen) return <div className={shell}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${shell} transition-shadow duration-150 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.06),0_1px_2px_0_rgba(0,0,0,0.04)]`}
    >
      {body}
    </button>
  );
}

/** The library's trailing slot — how often this has surfaced. */
export function UsageCount({ uses }: { uses: number }) {
  return (
    <span className="text-[11px] leading-[16px] font-medium whitespace-nowrap text-[#9b9b96]">
      {uses}×
    </span>
  );
}

/** The meeting's trailing slot — the two moves an advisor has mid-session. */
export function BandActions({
  onCapture,
  onDismiss,
}: {
  onCapture?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <span className="flex items-center gap-[12px] whitespace-nowrap">
      <button
        type="button"
        onClick={onCapture}
        className="text-[11px] leading-[16px] font-medium text-[#3a3a3a]"
      >
        Add to notes
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[11px] leading-[16px] text-[#9b9b96]"
      >
        Dismiss
      </button>
    </span>
  );
}

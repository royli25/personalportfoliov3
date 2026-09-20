import { Card, Pill, type Tone } from "./primitives";

/**
 * BlueprintX — the insights rail.
 *
 * Newest first. Each card is one thing the assistant surfaced mid-meeting,
 * with the two moves an advisor actually has: keep it, or drop it.
 */

export type Insight = {
  /** Insight type — becomes the pill, e.g. "Research Opportunity". */
  type: string;
  tone: Tone;
  timestamp: string;
  title: string;
  /** One line of context under the title. */
  subtitle: string;
};

export function InsightsRail({
  title = "Surfacing Insights",
  count,
  insights,
}: {
  title?: string;
  /** Total surfaced this meeting — can exceed the cards shown. */
  count: number;
  insights: Insight[];
}) {
  return (
    <div className="flex h-full w-[440px] shrink-0 flex-col gap-[12px] border-l border-[#ebebe7] bg-[#fafafa] px-[20px] py-[22px]">
      <div className="flex w-full items-center justify-between whitespace-nowrap">
        <p className="text-[13px] leading-[16px] font-medium text-[#9b9b9b]">
          {title}
        </p>
        <p className="text-[11px] leading-[16px] font-medium text-[#b0b0b0]">
          {count}
        </p>
      </div>

      <div className="flex min-h-px w-full flex-1 flex-col gap-[10px]">
        {insights.map((insight) => (
          <InsightCard key={insight.title} insight={insight} />
        ))}
      </div>
    </div>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card className="flex w-[400px] flex-col gap-[10px] rounded-[14px] px-[16px] py-[14px]">
      <div className="flex w-full items-center justify-between">
        <Pill tone={insight.tone}>{insight.type}</Pill>
        <span className="text-[10px] leading-[14px] whitespace-nowrap text-[#b8b8b8]">
          {insight.timestamp}
        </span>
      </div>

      <p className="text-[15px] leading-[20px] font-semibold whitespace-nowrap text-[#1a1a1a]">
        {insight.title}
      </p>
      <p className="text-[13px] leading-[18px] whitespace-nowrap text-[#6b6b6b]">
        {insight.subtitle}
      </p>

      <div className="flex w-full items-center gap-[16px] border-t border-[#efefec] pt-[10px] text-[12px] leading-[16px] whitespace-nowrap">
        <button type="button" className="font-medium text-black">
          Add to notes
        </button>
        <button type="button" className="text-[#9b9b96]">
          Dismiss
        </button>
      </div>
    </Card>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlueprintXDemo, FRAME } from "@/demos/blueprintx";
import { FitStage } from "@/demos/_shared/fit-stage";

/**
 * /demo/[demo] — the recording stage.
 *
 * The demo is authored at its fixed canvas (1440×900, never responsive) and
 * FitStage scales it to fill the viewport, aspect preserved. In a browser it
 * letterboxes on the film-frame dark; in the Electron shell (electron/main.js)
 * the window is aspect-locked to the canvas, so the product fills the whole
 * frameless window at any size and the stage never shows.
 *
 * Not indexed — these pages exist for recording and review, not discovery.
 */

const DEMOS = ["blueprintx"] as const;
type DemoSlug = (typeof DEMOS)[number];

type Props = { params: Promise<{ demo: string }> };

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ demo }));
}

export const metadata: Metadata = {
  title: "Demo — Roy Li",
  robots: { index: false, follow: false },
};

export default async function DemoPage({ params }: Props) {
  const { demo } = await params;
  if (!DEMOS.includes(demo as DemoSlug)) notFound();

  return (
    <div className="min-h-screen w-full bg-[#1a1a1a]">
      <FitStage width={FRAME.width} height={FRAME.height}>
        <BlueprintXDemo scale={1} controls />
      </FitStage>
    </div>
  );
}

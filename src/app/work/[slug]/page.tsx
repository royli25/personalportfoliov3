import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyBody } from "@/components/case-study-body";
import { CASE_STUDIES, CASE_SLUGS } from "@/data/case-studies";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDIES[slug];
  if (!study) return {};

  return {
    title: `${study.name} — Roy Li`,
    description: study.deck ?? study.sections[0]?.body[0] ?? study.name,
  };
}

/**
 * A direct load of a case study is the same experience as clicking into it:
 * the shell with the study's panel already open on top. Reloading mid-study
 * therefore keeps you in the panel — with its scroll-to-top return path —
 * instead of stranding you on a lookalike page where that gesture does nothing.
 */
export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  if (!CASE_STUDIES[slug]) notFound();

  return <CaseStudyBody study={CASE_STUDIES[slug]} />;
}

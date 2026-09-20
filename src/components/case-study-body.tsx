import {
  CaseNav,
  CaseHero,
  CaseSection,
  NextCase,
} from "@/components/case-study";
import { SectionRail } from "@/components/rail";
import { CASE_STUDIES, sectionId } from "@/data/case-studies";
import type { CaseStudy } from "@/data/case-studies";

/**
 * The case study itself — everything both presentations share.
 *
 * The section rail belongs here rather than to the route: it reads scroll
 * through a captured document listener, so it tracks the window on `/work/…`
 * and the panel's own scroller when opened over the shell, unchanged either
 * way. Back-to-top is the exception and stays with the route — inside the
 * panel, scrolling to the top is what dismisses it, so a button racing you
 * there would fight the gesture.
 */
export function CaseStudyBody({ study }: { study: CaseStudy }) {
  const rail = study.sections.flatMap((s) =>
    s.eyebrow ? [{ id: sectionId(s.eyebrow), label: s.eyebrow }] : [],
  );

  return (
    <>
      {/*
        No gap here on purpose: every child already owns its top rhythm, and a
        container gap would compose with it so no boundary would land on the
        spacing scale (the 64px block gap read as 88, sections as 136).
      */}
      <div className="flex min-h-screen w-full min-w-0 flex-col items-center overflow-x-hidden px-3 pb-10">
        <CaseNav />
        <CaseHero study={study} />

        {study.sections.map((section, i) => (
          <CaseSection
            key={section.eyebrow ?? section.title ?? i}
            section={section}
            first={i === 0}
          />
        ))}

        {study.next && (
          <NextCase
            next={study.next}
            exists={Boolean(CASE_STUDIES[study.next.slug])}
          />
        )}
      </div>

      {/* Sibling of the column, not a child: it has to stay fixed, and `.reveal`
          animates transform, which would make it the containing block. A blog
          has no section titles, so it has no rail either. */}
      {rail.length > 0 && <SectionRail items={rail} />}
    </>
  );
}

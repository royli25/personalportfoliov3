import type { ReactNode } from "react";
import { HomeShell } from "@/components/shell/home-shell";
import { CaseStudies, PlaygroundPoster } from "@/components/shell/panes";
import { Gallery } from "@/components/shell/gallery";
import {
  AskBarLiveTile,
  ReadyToAddLiveTile,
} from "@/components/shell/live-demo-tile";
import { ScrambleText } from "@/components/shell/scramble-text";
import { WipBanner } from "@/components/shell/wip-banner";
import { CaseStudyBody } from "@/components/case-study-body";
import { readGallery } from "@/lib/gallery";
import {
  COMPONENTS,
  EMAIL,
  HEROES,
  SOCIALS,
  TABS,
  VISUALS,
  WORK,
  type TabId,
} from "@/data/site";
import { CASE_SLUGS, CASE_STUDIES } from "@/data/case-studies";

/**
 * The whole home experience, buildable from either route.
 *
 * `/` renders it plain; `/work/[slug]` renders it with that study's panel
 * already open on top. One composition instead of two pages means a reload
 * mid-study lands you exactly where you were — shell behind, study in front —
 * rather than on a different, panel-less presentation of the same URL.
 *
 * Every study is server-rendered here and handed to the shell as a ReactNode.
 * They cost nothing until opened (React mounts them on demand), and the first
 * open costs nothing either — no chunk to fetch, no blank panel while it
 * compiles, no loading state to design around.
 */
export function HomeComposition({ openSlug }: { openSlug?: string }) {
  /* Each gallery is whatever is sitting in public/<folder>/. Until you drop
     files in, the placeholder list stands in so the tab isn't just empty. */
  const visuals = readGallery("visuals");
  const components = readGallery("components");

  const studies = Object.fromEntries(
    CASE_SLUGS.map((slug) => [
      slug,
      <CaseStudyBody key={slug} study={CASE_STUDIES[slug]} />,
    ]),
  );

  /* One hero per destination, server-rendered like the panes — the shell only
     decides which is on screen. */
  const heroes = Object.fromEntries(
    ["home" as const, ...TABS.map((t) => t.id)].map((id) => [
      id,
      <Hero key={id} id={id} />,
    ]),
  ) as Record<TabId | "home", ReactNode>;

  return (
    /* The banner and the shell share the viewport rather than overlapping:
       this column owns the height and the shell takes what's left of it. */
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <WipBanner />

      <HomeShell
        heroes={heroes}
        panes={{
          "case-studies": <CaseStudies work={WORK} />,
          visuals: <Gallery tiles={visuals.length ? visuals : VISUALS} />,
          components: (
            <Gallery
              tiles={components.length ? components : COMPONENTS}
              /* The recording is the resting face of a component that actually
                 exists in this repo — hovering swaps in the live one. */
              live={{
                "01-ask-bar.mp4": (
                  <AskBarLiveTile src="/components/01-ask-bar.mp4" />
                ),
                "02-ready-to-add.mp4": (
                  <ReadyToAddLiveTile src="/components/02-ready-to-add.mp4" />
                ),
              }}
            />
          ),
          /* The pane holds a live, blurred Desktop — the same room the
             fullscreen panel boots from. Closing lands you back on that
             picture, not a still of the empty wallpaper. */
          playground: <PlaygroundPoster />,
        }}
        studies={studies}
        initialSlug={openSlug}
      />
    </div>
  );
}

/**
 * The rail's copy for one destination.
 *
 * `h1` on every one of them: the hero is the page's heading, and the heading
 * changes with the section — there is only ever one on screen.
 */
function Hero({ id }: { id: TabId | "home" }) {
  const { title, body } = HEROES[id];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[34px] leading-10 tracking-[-0.02em] text-shell-ink">
        <ScrambleText text={title} />
      </h1>

      {body && <p className="text-[15px] leading-6 text-shell-dim">{body}</p>}

      {/* Contact reads as the last line of the introduction, so it belongs to
          Home alone — the section heroes describe the work, not the person. */}
      {id === "home" && (
        <p className="text-[15px] leading-6 text-shell-dim">
          Reach me at{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="text-shell-ink underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            {EMAIL}
          </a>{" "}
          or on{" "}
          <a
            href={SOCIALS.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-shell-ink underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            LinkedIn
          </a>
          .
        </p>
      )}
    </div>
  );
}

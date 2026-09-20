import Image from "next/image";
import Link from "next/link";
import { Filler } from "@/components/media";
import { Desktop } from "@/desktop";
import type { Work } from "@/data/site";

/** The four things the work pane can show. */

/* -------------------------------------------------------- case studies */

function WorkCard({ work }: { work: Work }) {
  /* A real screenshot keeps its own aspect ratio — the placeholder's 1.92/2.26
     frames exist to hold a shape, not to crop product work down to one. */
  const ratio = work.image
    ? `${work.image.width} / ${work.image.height}`
    : /* Proportion, not pixels: the pane is fluid, the design's 400/340px
         frames are not. These match the ratios at the 1440 canvas width. */
      (work.ratio ?? (work.feature ? "1.92 / 1" : "2.26 / 1"));

  const media = work.image ? (
    <Image
      src={work.image.src}
      alt={work.image.alt}
      width={work.image.width}
      height={work.image.height}
      sizes="(min-width: 1024px) 60vw, 100vw"
      priority={work.feature}
      /* Cover, because the frame gives a few percent of its height back on
         hover: the shot crops evenly from both edges instead of squashing. */
      className="h-full w-full object-cover"
    />
  ) : (
    <Filler
      label={work.filler ?? `${work.name}.png`}
      tone="dark"
      rounded="rounded-shell"
      /* No ratio — the card fixes the height and the media fills what's left
         of it. */
      className="h-full"
    />
  );

  /* Hidden until hover — the title drops out of the shot rather than sitting
     under it as a second headline. aria-hidden because the link's label
     already names the study. */
  const caption = (
    <div className="work-card-title shrink-0">
      <div>
        <p
          aria-hidden={work.slug ? true : undefined}
          className="text-[15px] leading-[21px] font-medium text-shell-ink"
        >
          {work.name}
        </p>
      </div>
    </div>
  );

  /**
   * The card's height is fixed by the ratio for the life of the hover, so the
   * title is paid for out of the media's height rather than added to the
   * card's — the shot compresses a hair and the stack below never moves. The
   * media is the flexible one (`flex-1 min-h-0`); the title takes what it
   * needs.
   */
  const body = (
    <div className="flex flex-col" style={{ aspectRatio: ratio }}>
      <div className="min-h-0 flex-1 overflow-hidden rounded-shell">
        {media}
      </div>
      {caption}
    </div>
  );

  /* data-spot: the shell's scroll spotlight lifts the card you're on. */
  if (!work.slug) {
    return (
      <article data-spot="" className="group">
        {body}
      </article>
    );
  }

  return (
    <article data-spot="">
      <Link
        href={`/work/${work.slug}`}
        aria-label={`Read the ${work.name} case study`}
        /* Padding always present so hover only fills colour — no layout jump,
           no float. Tight on three sides and deeper at the foot, where the
           title lands: the fill reads as room made for it, not a border. */
        className="group block rounded-[10px] px-1.5 pt-1.5 pb-3 -mx-1.5 -mt-1.5 -mb-3 transition-colors duration-200 hover:bg-shell-hover"
      >
        {body}
      </Link>
    </article>
  );
}

export function CaseStudies({ work }: { work: Work[] }) {
  return (
    <div className="flex flex-col gap-6">
      {work.map((w) => (
        <WorkCard key={w.name} work={w} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- playground */

/**
 * What the Playground pane holds once you've closed the desktop.
 *
 * Selecting the tab boots straight into the machine — this is the way back in,
 * and the reason closing it doesn't strand you on an empty pane. The pane
 * *is* the rest desktop: same blur, same overshoot, same veil, full-bleed
 * into the work column. Hover tucks it in a hair and lifts the veil, so
 * clicking is the same surface coming into focus.
 *
 * The stage is the live machine, not a still of the wallpaper. A photograph
 * of the empty gradient is a lie once the dock and the sticky exist — the
 * boot card already paints the real Desktop behind its blur, and closing
 * has to land on that same room. `inert` so the picture cannot steal the
 * click that opens it (a dock button nested in a launch control).
 *
 * `warm` stays off: this pane is always mounted, only hidden, and prefetching
 * BlueprintX for every visitor is the thing `registry.tsx` exists to prevent.
 *
 * A launch control with no handler: the shell delegates clicks (and keys)
 * off `data-launch` the way it does case-study links, because the pane is a
 * server-rendered ReactNode with no boundary to hand a callback across.
 */
export function PlaygroundPoster() {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        data-launch="desktop"
        aria-label="Open the playground desktop"
        className="playground-poster relative hidden h-full w-full cursor-pointer overflow-hidden lg:block"
      >
        <span className="playground-poster-stage pointer-events-none absolute inset-0" inert>
          <Desktop booted warm={false} />
        </span>
        <span aria-hidden className="playground-poster-veil absolute inset-0" />
      </div>

      {/* A 1440px canvas on a phone lands near 0.26 — the composition would
          read and the product wouldn't. Say so instead of shipping it. */}
      <p className="text-[15px] leading-6 text-shell-dim lg:hidden">
        The playground runs the real applications at their full desktop size.
        It’s only available on a computer.
      </p>
    </>
  );
}

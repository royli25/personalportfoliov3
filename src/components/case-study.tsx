import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal, Showcase, Card, Chevron } from "./layout";
import { shell } from "./tokens";
import { Filler, Browser, Laptop, Phone } from "./media";
import { FeatureDisplay } from "./feature-display";
import { FocusDeck } from "./focus-deck";
import { LoopVideo } from "./loop-video";
import { sectionId } from "@/data/case-studies";
import type { Block, CaseStudy, Media, Section } from "@/data/case-studies";

/**
 * Case study page furniture.
 *
 * Same shell as the home page (the shared `shell("narrow")`, 760px, dead
 * centre) and the same type scale — a study reads as the site continuing, not
 * as a separate template. Only media rows break out of the column.
 */

/** The reading column. Everything textual sits inside one of these. */
function Column({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`${shell("narrow")} ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- nav */

function GitHubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
    </svg>
  );
}

export function CaseNav() {
  return (
    <header className="case-study-nav flex min-h-7 items-center">
      <Link
        href="/#case-studies"
        className="group inline-flex items-center gap-1 font-sans text-[12px] text-neutral-400 transition-colors hover:text-neutral-900"
      >
        <Chevron className="h-3 w-3 rotate-180 group-hover:-translate-x-0.5" />
        back to work
      </Link>
    </header>
  );
}

/* ------------------------------------------------------------------ hero */

export function CaseHero({ study }: { study: CaseStudy }) {
  return (
    <>
      <Reveal className="w-full">
        <Column className="scroll-mt-24">
          <h1 className="font-sans text-h1 text-neutral-900">
            {study.title}
            {study.accent ? ` ${study.accent}` : ""}
          </h1>

          {study.repo && (
            <a
              href={study.repo.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-chip border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-sans text-eyebrow text-neutral-900 transition-colors hover:border-neutral-300 hover:bg-neutral-100"
            >
              <GitHubMark />
              {study.repo.label}
            </a>
          )}

          {study.deck && (
            <p className="mt-4 text-p1 text-neutral-900/65">{study.deck}</p>
          )}
        </Column>
      </Reveal>

      <MediaRow media={study.cover} spacing="normal" />

      {study.meta && study.meta.length > 0 && (
        <Reveal className="w-full" delay={80}>
          <Column>
            <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-neutral-100 pt-6 md:grid-cols-4">
              {study.meta.map((m) => (
                <div key={m.label}>
                  <dt className="font-sans text-p1 text-neutral-900 capitalize">
                    {m.label}
                  </dt>
                  <dd className="mt-3 font-sans text-p2 text-neutral-900/65">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Column>
        </Reveal>
      )}
    </>
  );
}

/* -------------------------------------------------------------- sections */

export function CaseSection({
  section,
  /** The first section opens the body act, so it sits 96 below the opening. */
  first = false,
}: {
  section: Section;
  first?: boolean;
}) {
  const accent = section.accent;
  const headed = Boolean(section.eyebrow || section.title);

  return (
    <>
      {(headed || section.body.length > 0) && (
        <Reveal className="w-full">
          {/* The rail scrolls here, so leave the eyebrow clear of the top edge. */}
          <Column
            id={section.eyebrow ? sectionId(section.eyebrow) : undefined}
            className={`scroll-mt-10 ${first ? "mt-24" : "mt-18"}`}
          >
            {section.eyebrow && (
              <p className="inline-flex rounded-chip bg-neutral-900 px-2.5 py-1 font-sans text-eyebrow text-white capitalize">
                {section.eyebrow}
              </p>
            )}
            {section.title && (
              <h2
                className={`${section.eyebrow ? "mt-3" : ""} font-sans text-h1 text-neutral-900`}
              >
                {section.accentLeads ? (
                  <>
                    {accent} {section.title}
                  </>
                ) : (
                  <>
                    {section.title}
                    {accent && <> {accent}</>}
                  </>
                )}
              </h2>
            )}

            {section.body.map((p, i) => (
              <p
                key={i}
                className={`${i === 0 && !headed ? "" : "mt-4"} text-p1 text-neutral-900/65`}
              >
                {p}
              </p>
            ))}
          </Column>
        </Reveal>
      )}

      {section.blocks?.map((block, i) => <CaseBlock key={i} block={block} />)}
    </>
  );
}

/* ---------------------------------------------------------------- blocks */

function CaseBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "media":
      return <MediaRow media={block.media} spacing="media" />;

    case "gallery":
      return (
        <>
          <Showcase width="narrow" spacing="media">
            {block.items.map((m) => (
              <Card
                key={m.label}
                className="min-w-0 flex-col items-center justify-start overflow-hidden pt-6"
              >
                <Frame media={m} />
              </Card>
            ))}
          </Showcase>
          {block.items.some((m) => m.caption) && (
            <Reveal className="w-full">
              <div className={`${shell("narrow")} mt-3 flex flex-col gap-2 md:flex-row`}>
                {block.items.map((m) => (
                  <p
                    key={m.label}
                    className="flex-1 text-center font-sans text-[10px] text-neutral-400"
                  >
                    {m.caption}
                  </p>
                ))}
              </div>
            </Reveal>
          )}
        </>
      );

    case "stats":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {block.items.map((s) => (
                <div
                  key={s.label}
                  className="flex h-[134px] items-center justify-center bg-[#f2f2f2] p-[5px]"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center gap-[15px] border border-[#c6c6c6] bg-[#dfdfdf] p-[5px]">
                    <p className="font-sans text-[48px] font-medium leading-none text-[#930902]">
                      {s.value}
                    </p>
                    <p className="font-sans text-[16px] leading-none text-neutral-950">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Reveal>
      );

    case "quote":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            <figure className="border-l-2 border-amber-200 pl-5">
              <blockquote className="font-sans text-[20px] leading-8 text-neutral-900">
                &ldquo;{block.text}&rdquo;
              </blockquote>
              {block.attribution && (
                <figcaption className="mt-3 font-sans text-[10px] tracking-wide text-neutral-400">
                  {block.attribution}
                </figcaption>
              )}
            </figure>
          </Column>
        </Reveal>
      );

    case "steps":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            <ol>
              {block.items.map((s, i) => (
                <li
                  key={s.title}
                  className="grid grid-cols-[28px_1fr] gap-4 border-t border-neutral-100 py-5 first:border-0 first:pt-0"
                >
                  <span className="pt-0.5 font-sans text-[10px] text-neutral-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-sans text-[13px] font-medium text-neutral-900">
                      {s.title}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-6 text-neutral-500">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Column>
        </Reveal>
      );

    case "notes":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            <div className="rounded-card border border-neutral-200/80 bg-neutral-50/60 p-5">
              {block.title && (
                <p className="font-sans text-[10px] tracking-wide text-neutral-400">
                  {block.title}
                </p>
              )}
              <ul className="mt-3 space-y-2">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[14px_1fr] text-[13px] leading-6 text-neutral-600"
                  >
                    <span aria-hidden="true" className="text-neutral-300">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Column>
        </Reveal>
      );

    case "columns":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            {block.title && (
              <p className="mb-6 font-sans text-[10px] tracking-wide text-neutral-400">
                {block.title}
              </p>
            )}
            <div
              className={`grid gap-4 ${
                block.items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
              }`}
            >
              {block.items.map((item) => (
                <ColumnItem
                  key={item.title}
                  item={item}
                  scale={block.scale ?? "md"}
                />
              ))}
            </div>
          </Column>
        </Reveal>
      );

    case "cards":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {block.items.map((card) => (
                // Same title/body treatment as a `columns` item — these read as
                // the same kind of thing, so they shouldn't be typeset differently.
                <div key={card.title}>
                  <Shot media={card.media} sizes="(min-width: 640px) 250px, 100vw" />
                  <p className="mt-3 font-sans text-h2 text-neutral-900">
                    {card.title}
                  </p>
                  <p className="mt-2 text-p1 text-neutral-900/65">{card.body}</p>
                </div>
              ))}
            </div>
          </Column>
        </Reveal>
      );

    case "carousel":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            <FeatureDisplay
              label="What the product does"
              items={block.items.map((slide) => ({
                title: slide.title,
                body: slide.body,
                media: (
                  <Shot
                    media={slide.media}
                    sizes="(min-width: 800px) 760px, 100vw"
                  />
                ),
              }))}
            />
          </Column>
        </Reveal>
      );

    case "decisions":
      return (
        <Reveal className="w-full" delay={80}>
          <Column className="mt-6">
            {/* Each row is a direct child, because FocusDeck springs its own
                children — anything wrapped in between would animate instead. */}
            <FocusDeck className="flex flex-col gap-6">
              {block.items.map((d) => (
                <div key={d.eyebrow} className="border-t border-[#ebebeb] pt-6">
                  <p className="font-sans text-h4 capitalize text-neutral-400">
                    {d.eyebrow}
                  </p>
                  <p className="mt-2.5 font-sans font-medium text-neutral-900 text-h2">
                    {d.title}
                  </p>
                  <p className="mt-2.5 text-p1 text-neutral-900/65">{d.body}</p>

                  <div className="mt-5">
                    <Shot
                      media={d.media}
                      sizes="(min-width: 800px) 760px, 100vw"
                    />
                  </div>
                </div>
              ))}
            </FocusDeck>
          </Column>
        </Reveal>
      );

    case "prose":
      return (
        <Reveal className="w-full">
          <Column className="mt-6">
            <p className="text-p1 text-neutral-900/65">{block.text}</p>
          </Column>
        </Reveal>
      );
  }
}

/** One column of a `columns` block. Scale sets how much weight it carries. */
function ColumnItem({
  item,
  scale,
}: {
  item: { eyebrow?: string; title: string; body: string };
  scale: "sm" | "md" | "lg";
}) {
  /*
    Every one of these sub-headings is the same role, so they all take `h2`
    now — the three scales only vary how much air sits above them. Body copy
    is the primary ink at 65%, matching prose everywhere else.
  */
  const { pad, body } = {
    sm: { pad: "pt-3.5", body: "mt-1.5 text-p1 text-neutral-900/65" },
    md: { pad: "pt-4", body: "mt-2 text-p1 text-neutral-900/65" },
    lg: { pad: "pt-5", body: "mt-2.5 text-p1 text-neutral-900/65" },
  }[scale];
  const title = "text-h2";

  return (
    <div className={`border-t border-[#ebebeb] ${pad}`}>
      {item.eyebrow && (
        <p className="mb-2.5 font-sans text-[10px] tracking-wide text-neutral-400">
          {item.eyebrow}
        </p>
      )}
      <p className={`font-sans font-medium text-neutral-900 ${title}`}>
        {item.title}
      </p>
      <p className={body}>{item.body}</p>
    </div>
  );
}

/**
 * A media slot with no chrome of its own — the block around it does the
 * framing, so cards, slides and before/after pairs all size their own shots.
 */
function Shot({ media, sizes }: { media: Media; sizes: string }) {
  if (media.video) {
    return (
      <LoopVideo
        src={media.video}
        width={media.width ?? 1600}
        height={media.height ?? 900}
        alt={media.alt}
        className="block h-auto w-full"
      />
    );
  }
  if (!media.src) {
    return (
      <Filler
        label={media.label}
        ratio={media.ratio}
        rounded="rounded-none"
        className="border-0 bg-[#fbfbfb]"
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt ?? ""}
      width={media.width ?? 1600}
      height={media.height ?? 900}
      sizes={sizes}
      className="block h-auto w-full"
    />
  );
}

/* ----------------------------------------------------------------- media */

/** A single shot, breaking out of the reading column, with its caption. */
function MediaRow({
  media,
  spacing = "compact",
}: {
  media: Media;
  spacing?: "compact" | "normal" | "media";
}) {
  return (
    <>
      <Showcase width="narrow" spacing={spacing}>
        <Frame media={media} />
      </Showcase>
      {media.caption && (
        <Reveal className="w-full">
          <div className={`${shell("narrow")} mt-3`}>
            <p className="text-center font-sans text-[10px] text-neutral-400">
              {media.caption}
            </p>
          </div>
        </Reveal>
      )}
    </>
  );
}

/** Wraps a real image or filler in whichever chrome the content asked for. */
function Frame({ media }: { media: Media }) {
  const fill = media.src ? (
    <Image
      src={media.src}
      alt={media.alt ?? ""}
      width={media.width ?? 1600}
      height={media.height ?? 900}
      sizes={
        media.frame === "diagram"
          ? "(min-width: 800px) 760px, 600px"
          : "(min-width: 1100px) 1100px, 100vw"
      }
      className="block h-auto w-full"
    />
  ) : (
    <Filler
      label={media.label}
      ratio={media.ratio}
      rounded="rounded-none"
      className="border-0"
    />
  );

  switch (media.frame) {
    /**
     * An explanatory diagram, exported from Figma with its own card and border
     * already baked in — so it gets no chrome from us, or the two would double
     * up. Diagrams carry 13px labels: below the reading column they'd render
     * around 6px, so the narrow case scrolls sideways rather than shrinking
     * past legibility.
     */
    case "diagram":
      return (
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="min-w-[600px]">{fill}</div>
        </div>
      );

    case "browser":
      return (
        <Browser url={media.url ?? "example.com"} className="min-w-0 flex-1">
          {fill}
        </Browser>
      );
    case "laptop":
      return <Laptop>{fill}</Laptop>;
    case "phone":
      return (
        <Phone className="mt-1">
          {media.src ? (
            <Image
              src={media.src}
              alt={media.alt ?? ""}
              width={media.width ?? 390}
              height={media.height ?? 844}
              sizes="196px"
              className="h-full w-full object-cover"
            />
          ) : (
            <Filler
              label={media.label}
              rounded="rounded-none"
              className="h-full border-0 bg-neutral-100"
            />
          )}
        </Phone>
      );
    /**
     * Bare media sits flush, same as a diagram. It used to carry a rounded
     * border, which made it the only shot on the page with chrome of its own —
     * every other frame either draws real device chrome or nothing at all.
     */
    default:
      return <div className="min-w-0 flex-1 overflow-hidden">{fill}</div>;
  }
}

/* ------------------------------------------------------------ next study */

export function NextCase({
  next,
  exists,
}: {
  next: NonNullable<CaseStudy["next"]>;
  /** Falls back to the work section until that study is written. */
  exists: boolean;
}) {
  return (
    <Reveal className="w-full" delay={80}>
      {/* Opens the outro act: 96 off the last section, not the usual 48. */}
      <Column className="mt-24">
        <Link
          href={exists ? `/work/${next.slug}` : "/#work"}
          className="group flex items-center justify-between gap-4 rounded-card border border-neutral-200/80 p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          <div>
            <p className="font-sans text-[10px] tracking-wide text-neutral-400">
              next case study
            </p>
            <p className="mt-2 font-sans text-[19px] leading-6 text-neutral-900">
              {next.name}
            </p>
            <p className="mt-1 text-[13px] leading-6 text-neutral-500">
              {next.blurb}
            </p>
          </div>
          <Chevron className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-900" />
        </Link>
      </Column>
    </Reveal>
  );
}

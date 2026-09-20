"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Filler } from "@/components/media";
import { useSpotlightPlayback } from "@/components/shell/use-spotlight-playback";
import type { Tile } from "@/data/site";

/**
 * The gallery wall, with a lightbox.
 *
 * One image per row at full pane width — unless filenames pair them: tiles
 * sharing a `row` number (from a `02a-`/`02b-` prefix) sit side by side,
 * splitting the width evenly. Grouping is by *adjacency*: files sort by name,
 * so a shared prefix always arrives consecutively.
 *
 * Clicking any real image opens it full screen. Placeholders aren't clickable
 * — a lightbox of a labelled blank is nobody's destination.
 */
export function Gallery({
  tiles,
  live,
}: {
  tiles: Tile[];
  /** Interactive stand-ins keyed by filename — a tile whose file has a live
      counterpart renders that instead of the flat media. Server-composed:
      the nodes arrive rendered, this component only places them. */
  live?: Record<string, ReactNode>;
}) {
  const [open, setOpen] = useState<number | null>(null);

  /* The lightbox pages through real images only, in wall order — videos
     loop in place and live tiles are their own destination. */
  const shots = tiles.filter((t) => t.src && !t.video);
  const shotIndex = new Map(shots.map((s, i) => [s.filler, i]));

  const rows: Tile[][] = [];
  for (const tile of tiles) {
    const prev = rows[rows.length - 1];
    if (tile.row !== undefined && prev?.[0].row === tile.row) {
      prev.push(tile);
    } else {
      rows.push([tile]);
    }
  }

  return (
    <>
      {/* Tighter than the case-study stack on purpose: these are pieces of one
          wall, not separate works, and the pair gap matches the stack gap so
          rows and columns read as one grid. */}
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          /* data-spot on the row, not the tile: a side-by-side pair is one
             scroll position, so it lights and dims as one. */
          <div
            key={row[0].filler}
            data-spot=""
            className={row.length > 1 ? "flex gap-3" : undefined}
          >
            {row.map((tile) => (
              <div
                key={tile.filler}
                className={row.length > 1 ? "min-w-0 flex-1" : undefined}
              >
                {live?.[tile.filler] ? (
                  live[tile.filler]
                ) : tile.video && tile.src ? (
                  <SpotlightClip tile={tile} />
                ) : tile.src ? (
                  <button
                    type="button"
                    onClick={() => setOpen(shotIndex.get(tile.filler) ?? 0)}
                    aria-label={`View ${tile.alt || "image"} full screen`}
                    className="block w-full cursor-pointer"
                  >
                    {tile.width && tile.height ? (
                      <Image
                        src={tile.src}
                        alt={tile.alt ?? ""}
                        width={tile.width}
                        height={tile.height}
                        sizes={
                          row.length > 1
                            ? "(min-width: 1024px) 30vw, 50vw"
                            : "(min-width: 1024px) 60vw, 100vw"
                        }
                        className="h-auto w-full rounded-shell"
                      />
                    ) : (
                      /* Header wouldn't parse, so there are no dimensions to
                         reserve — crop into the ratio box instead of shipping
                         a broken layout. */
                      <span
                        className="relative block w-full overflow-hidden rounded-shell"
                        style={{ aspectRatio: tile.ratio }}
                      >
                        <Image
                          src={tile.src}
                          alt={tile.alt ?? ""}
                          fill
                          className="object-cover"
                        />
                      </span>
                    )}
                  </button>
                ) : (
                  <Filler
                    label={tile.filler}
                    tone="dark"
                    rounded="rounded-shell"
                    ratio={tile.ratio}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {open !== null && shots[open] && (
        <Lightbox
          shots={shots}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

/**
 * A dropped .mp4 plays while its card is the primary one in the scroll and
 * rests paused at frame 0 otherwise — the same rule the live tiles follow
 * (`use-spotlight-playback.ts`), so a plain clip and a live one sitting on
 * the same wall behave identically. preload="auto" because a paused first
 * frame is the resting face.
 */
function SpotlightClip({ tile }: { tile: Tile }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useSpotlightPlayback(videoRef, boxRef);

  return (
    <div ref={boxRef}>
      <video
        ref={videoRef}
        src={tile.src}
        width={tile.width}
        height={tile.height}
        preload="auto"
        muted
        loop
        playsInline
        aria-label={tile.alt || undefined}
        className="h-auto w-full rounded-shell"
        style={{ aspectRatio: tile.ratio }}
      />
    </div>
  );
}

/** Must cover the exit fade in globals.css `.lightbox[data-closing]`. */
const EXIT_MS = 180;

/**
 * Full-screen viewer. Click anywhere or Escape closes; arrow keys page
 * through the wall. A modal, so it scales from center — origin-aware scaling
 * is for popovers with a trigger to grow out of, which this deliberately
 * fills the screen instead of having.
 */
function Lightbox({
  shots,
  index,
  onIndex,
  onClose,
}: {
  shots: Tile[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") onIndex((index + 1) % shots.length);
      else if (e.key === "ArrowLeft")
        onIndex((index - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, index, onIndex, shots.length]);

  /* Same dialog manners as the case-study panel: the page behind must not
     scroll, and focus comes in with us and goes back where it was. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const before = document.activeElement as HTMLElement | null;
    box.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      before?.focus?.();
    };
  }, []);

  const shot = shots[index];

  return (
    <div
      ref={box}
      role="dialog"
      aria-modal="true"
      aria-label={shot.alt || "Image viewer"}
      tabIndex={-1}
      data-closing={closing}
      onClick={close}
      className="lightbox fixed inset-0 z-[60] bg-black/85 outline-none"
    >
      <div className="absolute inset-4 lg:inset-12">
        {/* Keyed by src so paging re-runs the entrance for each image. */}
        <Image
          key={shot.src}
          src={shot.src!}
          alt={shot.alt ?? ""}
          fill
          sizes="100vw"
          className="lightbox-img object-contain"
        />
      </div>

      {shot.alt && (
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.06em] text-white/50">
          {shot.alt}
          {shots.length > 1 && (
            <span className="text-white/30">
              {"   "}
              {index + 1} / {shots.length}
            </span>
          )}
        </span>
      )}

      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute top-5 right-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

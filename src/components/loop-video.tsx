"use client";

import { useEffect, useRef } from "react";

/**
 * A muted autoplaying loop that rewinds whenever it leaves the viewport.
 *
 * Browsers already throttle offscreen video, but they resume mid-clip — so a
 * flow you scroll past and come back to picks up halfway through the story it
 * is trying to tell. Every arrival should start at frame one.
 *
 * Play waits for a real showing (40% visible) so a clip doesn't burn its
 * opening seconds peeking over the bottom edge; the rewind waits for the shot
 * to clear the viewport entirely, so the jump back is never visible.
 *
 * Playback is driven entirely by the observer — deliberately no `autoPlay`.
 * The attribute starts the clip the moment it decodes, offscreen, and since an
 * observer only fires on threshold crossings there is nothing left to stop it:
 * you would scroll down to a flow already a third of the way through itself.
 */
export function LoopVideo({
  src,
  width,
  height,
  alt,
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio === 0) {
          el.pause();
          el.currentTime = 0;
        } else if (entry.intersectionRatio >= 0.4) {
          // Autoplay can still be refused (low power mode); nothing to recover.
          void el.play().catch(() => {});
        }
      },
      { threshold: [0, 0.4] },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      className={className}
    />
  );
}

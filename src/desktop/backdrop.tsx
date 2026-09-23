"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";

function subscribeToClock(update: () => void) {
  const timer = window.setInterval(update, 1000);
  return () => window.clearInterval(timer);
}

const minuteNow = () => Math.floor(Date.now() / 60000);
const serverMinute = () => null;

/** The peek, reveal, and destination use the same image, framing, and clock. */
export function DesktopBackdrop({
  backToPortfolio = false,
  onReady,
}: {
  backToPortfolio?: boolean;
  onReady?: () => void;
}) {
  const minute = useSyncExternalStore(subscribeToClock, minuteNow, serverMinute);
  const now = minute === null ? null : new Date(minute * 60000);

  return <span className="v3-desktop-backdrop">
    <Image
      src="/figma/desktop.png"
      alt=""
      fill
      sizes="(min-width: 1024px) 2048px, 100vw"
      className="v3-desktop-wallpaper"
      priority
      onLoad={onReady}
      onError={onReady}
    />
    <span className="v3-menubar">
      {backToPortfolio && <Link href="/" className="v3-playground-back">← Back to portfolio</Link>}
      <span className="v3-menubar-date">{now?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
      <span>{now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}</span>
      <img src="/figma/search.svg" width="12" height="12" alt="" />
    </span>
  </span>;
}

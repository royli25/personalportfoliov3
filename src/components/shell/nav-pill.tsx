"use client";

import Image from "next/image";
import { TABS, type TabId } from "@/data/site";

/**
 * The rail's section selector — bare icon glyphs with captions, no container
 * chrome.
 *
 * A real tablist, not four links: the panes live side by side in one viewport,
 * so switching one must never cost a navigation or reset the rail beside it.
 *
 * With the pill gone, opacity is the whole selection signal — selected at
 * full, unselected dropped to 60% — applied to the button so the icon and its
 * caption always dim together.
 *
 * The rail is one width on every destination. Playground once folded it to a
 * glyph strip to buy the desktop the pane's width; the desktop now boots into
 * a full-screen panel instead, which is more room than the fold ever bought
 * and costs the rail nothing.
 */

export function NavPill({
  value,
  onChange,
  onHome,
}: {
  /** "home" is the landing state — a destination of its own, not a pane. */
  value: TabId | "home";
  onChange: (id: TabId) => void;
  onHome?: () => void;
}) {
  const glyph = "h-14 w-14";
  const caption = "text-[11px]";

  return (
    <div className="flex items-start gap-7 lg:w-full lg:justify-between">
      {/* Home leads the row but stays outside the tablist — it selects no
          pane, so it's a plain button, never "active". display:contents on
          the tablist lets the outer flex lay everything out as one row while
          the semantics stay honest. */}
      {onHome && (
        <button
          type="button"
          aria-label="Home"
          aria-current={value === "home" ? "page" : undefined}
          onClick={() => onHome()}
          className={`flex flex-col items-center gap-1.5 transition-opacity duration-200 ${
            value === "home" ? "opacity-100" : "opacity-60 hover:opacity-100"
          }`}
        >
          <Image
            src="/icons/nav/home.webp"
            alt=""
            width={56}
            height={56}
            className={glyph}
          />
          <span
            className={`${caption} ${
              value === "home" ? "font-medium text-shell-ink" : "text-shell-dim"
            }`}
          >
            Home
          </span>
        </button>
      )}

      <div role="tablist" aria-label="Portfolio sections" className="contents">
        {TABS.map((tab) => {
          const active = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-label={tab.label}
              aria-controls={`pane-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1.5 transition-opacity duration-200 ${
                active ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={tab.icon}
                alt=""
                width={56}
                height={56}
                className={glyph}
              />
              <span
                className={`${caption} ${
                  active ? "font-medium text-shell-ink" : "text-shell-dim"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

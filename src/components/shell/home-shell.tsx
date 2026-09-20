"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { NavPill } from "./nav-pill";
import { CaseStudyPanel } from "./case-study-panel";
import { DesktopPanel } from "./desktop-panel";
import { ScrambleReady } from "./scramble-text";
import { TABS, type TabId } from "@/data/site";

const PixelBlast = dynamic(() => import("@/components/pixel-blast"), {
  ssr: false,
  loading: () => null,
});

/**
 * The split shell: a fixed identity rail beside an independently scrolling
 * work pane, with case studies opening in a panel on top.
 *
 * Everything visible arrives server-rendered as props — panes and the studies
 * alike. The shell owns only what's on screen: which pane is selected, which
 * study is open, whether the Playground's desktop is booted, and whether the
 * direct-load grant (see below) has been used. Studies come fully rendered
 * rather than lazy-loaded because the first click once had to wait ~1.5s for a
 * chunk to fetch and compile — an empty panel that reads as "clicking does
 * nothing".
 */
export function HomeShell({
  heroes,
  panes,
  studies,
  initialSlug,
}: {
  /** The rail's copy per destination — it changes with the pane beside it. */
  heroes: Record<TabId | "home", ReactNode>;
  panes: Record<TabId, ReactNode>;
  /** Every case study, server-rendered, keyed by slug. */
  studies: Record<string, ReactNode>;
  /** Present when this render *is* /work/[slug] — panel starts open over it. */
  initialSlug?: string;
}) {
  /* "home" is a real destination, not a pane: the rail open on the hero,
     the work pane empty. Sections are where content lives. */
  const [tab, setTab] = useState<TabId | "home">("home");
  const [openSlug, setOpenSlug] = useState<string | null>(initialSlug ?? null);
  /* The Playground's desktop, booting to full screen over everything. */
  const [desktopOpen, setDesktopOpen] = useState(false);
  /* "Start at full size" is a one-shot grant for the direct load. Once that
     panel closes, this render is just the shell — re-opening the same study
     by click gets the click choreography (peek first) like any other. */
  const [grantSpent, setGrantSpent] = useState(false);
  /* First paint is the page arriving, not a change — nothing in the rail
     animates until the user has moved something. */
  const [booted, setBooted] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => setBooted(true), []);

  /* A new pane starts at its own top — otherwise you switch tabs and land
     halfway down a gallery you haven't seen the beginning of. */
  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  const goHome = useCallback(() => {
    setTab("home");
  }, []);

  /* Playground is a machine, not a gallery: arriving at the tab boots it,
     the way clicking a case-study card opens the study. The pane behind is
     the rest desktop, so closing lands you somewhere you can get back in
     from rather than on an empty column.

     Below lg there is no desktop to boot — a 1440px canvas on a phone lands
     near 0.26 — so the tab is only ever a tab and the pane says why. */
  const selectTab = useCallback((id: TabId) => {
    setTab(id);
    if (id === "playground" && window.matchMedia("(min-width: 1024px)").matches)
      setDesktopOpen(true);
  }, []);

  /**
   * Spotlight: the `[data-spot]` item nearest the pane's centre carries full
   * strength, the rest drop back — the FocusDeck move, applied to the pane.
   *
   * Dimming is the marked state (`data-dim`), not lighting: the server renders
   * no attributes, so first paint is everything at full strength and the first
   * measure eases the others down — never a flash of a dimmed page. Scroll is
   * captured on the document because it doesn't bubble, and the pane scrolls
   * itself on desktop but rides the page on mobile; the visible centre is the
   * pane's rect clipped to the viewport, which is correct for both.
   */
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const panel = pane.querySelector<HTMLElement>(`#pane-${tab}`);
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-spot]"));
      // One item has nothing to stand out from.
      if (items.length < 2) {
        items.forEach((el) => el.removeAttribute("data-dim"));
        return;
      }

      const r = pane.getBoundingClientRect();
      const centre =
        (Math.max(r.top, 0) + Math.min(r.bottom, window.innerHeight)) / 2;

      let lit: HTMLElement | null = null;
      let closest = Infinity;
      for (const el of items) {
        const b = el.getBoundingClientRect();
        const d = Math.abs((b.top + b.bottom) / 2 - centre);
        if (d < closest) {
          closest = d;
          lit = el;
        }
      }
      for (const el of items) {
        if (el === lit) el.removeAttribute("data-dim");
        else el.setAttribute("data-dim", "true");
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    onScroll();
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tab]);

  /* ------------------------------------------------------------ history
     The URL always names what's on screen, but opening a study is never a
     navigation — the shell stays mounted throughout. One entry is pushed per
     open so Back dismisses; swaps replace so Back doesn't walk a browsing
     chain; closing from a direct load rewrites to "/" because going back
     would leave the site. */

  const openStudy = useCallback((slug: string) => {
    setOpenSlug(slug);
    window.history.pushState({ panel: slug }, "", `/work/${slug}`);
  }, []);

  const swapStudy = useCallback(
    (slug: string) => {
      if (!(slug in studies)) {
        // A study that doesn't exist yet — let the server say 404.
        window.location.assign(`/work/${slug}`);
        return;
      }
      setOpenSlug(slug);
      window.history.replaceState({ panel: slug }, "", `/work/${slug}`);
    },
    [studies],
  );

  /* Called by the panel after its exit transition has finished. */
  const onPanelClosed = useCallback(() => {
    setOpenSlug(null);
    setGrantSpent(true);
    if (window.history.state?.panel) window.history.back();
    else window.history.replaceState({}, "", "/");
  }, []);

  /* Browser Back while open dismisses immediately — a back button that waits
     out an exit animation feels broken. */
  useEffect(() => {
    const onPop = () => {
      setOpenSlug(null);
      setGrantSpent(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /**
   * Case-study links in the pane open the panel instead of navigating.
   *
   * Delegated because the panes are server-rendered ReactNode — there is no
   * boundary to hand a callback across. Capture phase because `next/link`
   * prevents default and starts its own navigation from the anchor itself, so
   * a bubble listener arrives to find the click already spoken for. The cards
   * stay real `<a href>`: cmd-click, middle-click and "open in new tab" are
   * exactly the clicks this handler declines to take.
   */
  const onPaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      /* The Playground poster: a real button in server-rendered markup, so it
         reaches the shell the same delegated way the study links do. */
      if ((e.target as HTMLElement).closest?.("[data-launch='desktop']")) {
        e.preventDefault();
        e.stopPropagation();
        setDesktopOpen(true);
        return;
      }

      const slug = (e.target as HTMLElement)
        .closest?.("a[href^='/work/']")
        ?.getAttribute("href")
        ?.replace("/work/", "");
      if (!slug || !(slug in studies)) return;

      e.preventDefault();
      e.stopPropagation();
      openStudy(slug);
    },
    [studies, openStudy],
  );

  const onPaneKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!(e.target as HTMLElement).closest?.("[data-launch='desktop']")) return;
    e.preventDefault();
    setDesktopOpen(true);
  }, []);

  return (
    /* The height comes from the column in home-composition.tsx, not from the
       viewport: a banner above the shell has to shorten it, or the rail's last
       line falls off the bottom on lg where nothing scrolls. */
    <div className="relative flex min-h-0 flex-1 flex-col bg-shell lg:flex-row lg:overflow-hidden">
      {/* The shell's field, full-bleed behind both columns. It runs under the
          rail rather than starting at its edge, so the rail's opaque gradient
          hides the left edge fade and the pattern reads as continuing beneath
          the panel.

          Home only. It exists to fill the empty half; every other destination
          fills that half with work, and a dither behind a gallery competes
          with it. That also means no WebGL context anywhere but here. Off
          below lg, where the columns stack and there is no empty half. */}
      {tab === "home" && (
        <div className="absolute inset-0 z-0 hidden lg:block">
          <PixelBlast
            variant="circle"
            pixelSize={6}
            color="#B497CF"
            patternScale={3}
            patternDensity={1.2}
            pixelSizeJitter={0.5}
            /* Gathered into the bottom-right so the mass sits diagonally
               opposite the nav and clear of the hero's last line. */
            bias={0.85}
            biasOrigin={[1, 0]}
            biasFloor={0.35}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid
            liquidStrength={0.036}
            liquidRadius={1.2}
            liquidWobbleSpeed={2}
            speed={0.6}
            /* Shallow: a wide fade would eat the bottom-right corner the
               bias is gathering the field into. */
            edgeFade={0.1}
            transparent
          />
        </div>
      )}

      {/* One width on every destination. Playground used to fold this to a
          glyph strip to buy the desktop the pane's width; the desktop now
          boots to full screen instead, which is more room than the fold ever
          bought and leaves the rail alone. */}
      <aside className="relative z-10 flex shrink-0 flex-col justify-between gap-12 overflow-hidden bg-linear-to-b from-shell-wash from-[67.7%] to-shell px-8 py-10 lg:h-full lg:w-[560px] lg:gap-16 lg:px-16 lg:py-12">
        {/* Full-bleed scroller below lg: four segments don't fit 375px, and a
            segmented control that wraps to two rows reads as a bug. */}
        <div className="no-scrollbar -mx-8 w-[calc(100%+4rem)] overflow-x-auto px-8 lg:mx-0 lg:w-full lg:overflow-visible lg:px-0">
          <NavPill value={tab} onChange={selectTab} onHome={goHome} />
        </div>

        <div className="lg:w-[432px]">
          {/* Keyed so a section change mounts a fresh node — that's what the
              entrance in globals.css keys off. Both the class and the scramble
              wait for `booted`, so the page you load doesn't animate itself
              in; only changes you make do. */}
          <ScrambleReady.Provider value={booted}>
            <div key={tab} className={booted ? "hero-swap" : undefined}>
              {heroes[tab]}
            </div>
          </ScrambleReady.Provider>
        </div>
      </aside>

      {/* Home drops the raised tile and the pointer both: the fill would hide
          the field behind it, and the pane holds nothing there, so clicks
          belong to the field as ripples. Every other destination keeps the
          tile and its own hit targets. */}
      <div
        id="work"
        ref={paneRef}
        onClickCapture={onPaneClick}
        onKeyDownCapture={onPaneKey}
        className={`pane-scroll relative z-10 min-w-0 flex-1 lg:h-full ${
          tab === "home"
            ? "px-8 pt-8 pb-16 lg:overflow-y-auto lg:px-14 lg:pt-12 lg:pointer-events-none"
            : tab === "playground"
              ? /* Full-bleed on lg: the rest desktop is the pane, not a card in it. */
                "bg-shell-pane px-8 pt-8 pb-16 lg:overflow-hidden lg:p-0"
              : "bg-shell-pane px-8 pt-8 pb-16 lg:overflow-y-auto lg:px-14 lg:pt-12"
        }`}
      >
        {TABS.map((t) => (
          <div
            key={t.id}
            id={`pane-${t.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.id}`}
            hidden={t.id !== tab}
            /* A gallery is laid out by the pane; the Playground's preview is
               a whole screen, so it takes the pane's height instead. */
            className={t.id === "playground" ? "h-full" : undefined}
          >
            {panes[t.id]}
          </div>
        ))}
      </div>

      {openSlug && studies[openSlug] && (
        <CaseStudyPanel
          contentKey={openSlug}
          /* A direct load starts at full size — you asked for the page; the
             entrance-through-peek is the *click* choreography. One-shot. */
          startAt={openSlug === initialSlug && !grantSpent ? "open" : "peek"}
          onClosed={onPanelClosed}
          onSwap={swapStudy}
        >
          {studies[openSlug]}
        </CaseStudyPanel>
      )}

      {desktopOpen && <DesktopPanel onClosed={() => setDesktopOpen(false)} />}
    </div>
  );
}

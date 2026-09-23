"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DesktopBackdrop } from "@/desktop/backdrop";
import { usePagePeel } from "./page-peel";
import { Announcement } from "./announcement";
import { PixelPreview } from "./pixel-preview";
import { VisualMosaic } from "./visual-mosaic";
import { useEffect, useRef, useState } from "react";
import { EMAIL, WORK, type Tile } from "@/data/site";
import { AskBarLiveTile, ReadyToAddLiveTile } from "@/components/shell/live-demo-tile";

const SHOW_COMPONENTS = false;

type View = "home" | "visuals" | "components" | "case-studies";
const views: { id: View; label: string }[] = [
  { id: "home", label: "Home" }, { id: "visuals", label: "Visuals" },
  { id: "components", label: "Components" }, { id: "case-studies", label: "Case Studies" },
];

export function Portfolio({ visuals, components }: { visuals: Tile[]; components: Tile[] }) {
  const peelPage = usePagePeel();
  const router = useRouter();
  const [selected, setSelected] = useState<Tile | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Keep old shared links working with section anchors.
    const legacy = new URLSearchParams(location.search).get("view");
    if (views.some(item => item.id === legacy)) {
      history.replaceState(null, "", `/#${legacy}`);
      document.getElementById(legacy!)?.scrollIntoView({ behavior: "instant" });
    }
  }, []);
  function preview(tile: Tile) { setSelected(tile); dialog.current?.showModal(); }

  return (
    <main className="portfolio-v3">
      <a className="v3-skip" href="#visuals">Skip to work</a>
      <section id="home" className="v3-hero" aria-label="Introduction">
        <Announcement />
        <Link className="v3-corner" href="/playground" aria-label="Open the interactive playground"
          onPointerEnter={() => router.prefetch("/playground")}
          onFocus={() => router.prefetch("/playground")}
          onClick={event => {
          if (!peelPage || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.detail === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          event.preventDefault();
          const paper = event.currentTarget.querySelector<HTMLElement>(".v3-paper")!;
          const rect = paper.getBoundingClientRect();
          peelPage({ width: rect.width, baseWidth: paper.offsetWidth, height: rect.height, top: rect.top, right: rect.right,
            shade: Number(getComputedStyle(paper, "::after").opacity) });
        }}>
          <span className="v3-paper" aria-hidden="true"><img className="v3-fold" src="/figma/fold.svg" alt="" width="161" height="161" /></span>
          <span className="v3-desktop-peek" aria-hidden="true" inert>
            <DesktopBackdrop />
          </span>
        </Link>
        <div className="v3-intro">
          <h1>royli.<span>design</span></h1>
          <div className="v3-bio"><p>Designing + Building</p><p>CS &amp; HCI @ USC Iovine and Young Academy</p></div>
          <section className="v3-thoughts" aria-label="Recent thoughts">
            <div className="v3-thought-heading"><h2>Recent Thoughts</h2><span className="v3-unavailable" title="Writing archive coming soon">View All</span></div>
            {[0, 1].map(i => <div className="v3-thought" key={i} title="Draft — article link coming soon"><img src="/figma/thought-arrow.svg" alt="" width="24" height="24" /><span>Good design vs. Bad Design</span><span className="v3-draft">Draft</span></div>)}
          </section>
          <div className="v3-socials"><a href={`mailto:${EMAIL}`}>{EMAIL}</a>{["X", "LinkedIn", "Substack"].map(label => <span key={label} className="v3-unavailable" title={`${label} profile link coming soon`}>{label}</span>)}</div>
        </div>
      </section>
      <section id="visuals" className="v3-work v3-visuals" aria-label="Visuals">
        <VisualMosaic tiles={visuals} onPreview={preview} />
      </section>
      {SHOW_COMPONENTS && <section id="components" className="v3-work v3-home-studies" aria-labelledby="components-title">
        <div className="v3-gallery-heading"><h2 id="components-title">Components</h2><span>{components.length} pieces</span></div>
        <div className="v3-grid">
          {components.map(tile => <div className="v3-component" key={tile.src}>
            {tile.filler === "01-ask-bar.mp4" ? <AskBarLiveTile src={tile.src!} /> : tile.filler === "02-ready-to-add.mp4" ? <ReadyToAddLiveTile src={tile.src!} /> : <video src={tile.src} controls playsInline preload="metadata" aria-label={tile.alt} />}
          </div>)}
        </div>
      </section>}
      <section id="case-studies" className="v3-case-studies" aria-labelledby="home-studies-title">
        <h2 id="home-studies-title" className="v3-case-heading">Prop 1.2 Case Studies</h2>
        <div className="v3-case-projects"><ProjectCards /></div>
      </section>
      <footer className="v3-footer"><span>Roy Li · Designing + Building</span><a href={`mailto:${EMAIL}`}>Let’s make something together ↗</a></footer>
      <dialog aria-label={selected?.alt ? `Preview: ${selected.alt}` : "Image preview"} className="v3-lightbox" ref={dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} onClose={() => setSelected(null)}>
        <button className="v3-close" onClick={() => dialog.current?.close()} autoFocus>Close <span>Esc</span></button>
        {selected && <figure><PixelPreview key={selected.src} tile={selected} /><figcaption>{selected.alt}</figcaption></figure>}
      </dialog>
    </main>
  );
}

function ProjectCards() {
  return WORK.map(work => <Link className="v3-tile v3-project" key={work.slug} href={`/work/${work.slug}`}>
    {work.image && <img src={work.image.src} alt={work.image.alt} width={work.image.width} height={work.image.height} loading="lazy" />}
    <span className="v3-tile-label">{work.slug === "blueprint" ? "BluePrint" : "GTOStudio"}<span>View case study ↗</span></span>
  </Link>);
}

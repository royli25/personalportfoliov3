/** Everything you'd actually edit lives here. */

export const EMAIL = "royli@usc.edu";

export const SOCIALS = {
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
};

/* ------------------------------------------------- the shell's four panes */

/** Hand-drawn glyphs from public/Icons, cut down to nav size in icons/nav. */
export const TABS = [
  { id: "visuals", label: "Visuals", icon: "/icons/nav/visuals.webp" },
  { id: "components", label: "Components", icon: "/icons/nav/components.webp" },
  { id: "case-studies", label: "Case Studies", icon: "/icons/nav/case-studies.webp" },
  { id: "playground", label: "Playground", icon: "/icons/nav/playground.webp" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

/**
 * The rail's copy, one entry per destination.
 *
 * The hero isn't a fixed introduction — it changes with the pane beside it, so
 * each section says what it is while you're looking at it. Playground's copy
 * used to be a title alone because selecting it folded the rail away; the rail
 * stays now, so it carries a full entry like the rest.
 */
export const HEROES: Record<TabId | "home", { title: string; body?: string }> = {
  home: {
    title: "I’m Roy, Designer & Product Developer @ USC",
    body: "Shipping software right now is easier than ever. But making something people remember still takes exceptional care. I work across research, interface, and engineering to turn early ideas into sticky products people obsess with.",
  },
  visuals: {
    title: "Meticulous details in all taste profiles.",
    body: "Taste profiles generate recognizable brands, and meticulous design leads to strong products. I explore various visual systems, interactions, and aesthetics across different mediums and styles.",
  },
  components: {
    title: "Thoughtful interactions make products humane.",
    body: "A collections of interface experiments focused on how products should feel to human touch. The interactivity of designs turn functional products into experiences that humans can appreciate and fall in love with.",
  },
  "case-studies": {
    title: "Ideas developed around real-world problems.",
    body: "Case studies cover the research, product decisions, and design systems behind shipped work. Each project follows the path from an initial problem, through iteration, implementation, and measurable outcomes.",
  },
  playground: {
    title: "Ideas brought to MVP.",
    body: "Playground is a collection of fully coded demos and prototypes. Each project is a product I built that you can click through and play around with.",
  },
};

export type Work = {
  name: string;
  blurb: string;
  meta: string;
  /** The real asset. Cards without one fall back to a labelled blank. */
  image?: { src: string; alt: string; width: number; height: number };
  /** Stands in until `image` exists. */
  filler?: string;
  /** Placeholder frame. Omit to use the feature / rest defaults on the card. */
  ratio?: string;
  /** Present once the case study is written. */
  slug?: string;
  /** The lead card runs taller than the rest. */
  feature?: boolean;
};

export const WORK: Work[] = [
  {
    slug: "blueprint",
    name: "Surfacing 63 New Insights in Live Meetings for Admissions Consultants.",
    blurb:
      "BluePrint — research, design, and the full build. Live-meeting copilot for admissions consultants.",
    meta: "Founding work · 2025 —",
    image: {
      src: "/blueprint-dashboard.png",
      alt: "BluePrint's live meeting view: a student profile and running transcript on the left, with an insights rail surfacing matched profiles, research opportunities and summer programs on the right.",
      width: 3662,
      height: 2222,
    },
    feature: true,
  },
  {
    slug: "gtostudio",
    name: "A renewed interface for poker solvers.",
    blurb:
      "GTOStudio — a more approachable studying experience for game-theory optimal poker.",
    meta: "Notes · 2025",
    image: {
      src: "/projects/gtostudio/gtostudio-hero.jpg",
      alt: "GTOStudio — the optimal poker strategy.",
      width: 3082,
      height: 1756,
    },
  },
];

export type Tile = {
  /** Filename — the React key, and the label while there's no asset yet. */
  filler: string;
  /** Drives the masonry stagger — width is set by the column. */
  ratio: string;
  /** Set once a real file exists in the folder; see lib/gallery.ts. */
  src?: string;
  width?: number;
  height?: number;
  /** Read off the filename — the only place a dropped file can carry meaning. */
  alt?: string;
  /** Tiles sharing a row number render side by side (`02a-…` + `02b-…`). */
  row?: number;
  /** A dropped .mp4 — renders as a looping muted clip instead of an image. */
  video?: boolean;
};

/** Ratios vary on purpose: a masonry column with uniform tiles is just a list. */
export const VISUALS: Tile[] = [
  { filler: "visual-01.png", ratio: "3 / 4" },
  { filler: "visual-02.png", ratio: "4 / 3" },
  { filler: "visual-03.png", ratio: "1 / 1" },
  { filler: "visual-04.png", ratio: "4 / 5" },
  { filler: "visual-05.png", ratio: "16 / 9" },
  { filler: "visual-06.png", ratio: "3 / 4" },
  { filler: "visual-07.png", ratio: "1 / 1" },
  { filler: "visual-08.png", ratio: "4 / 3" },
  { filler: "visual-09.png", ratio: "3 / 4" },
];

/** The filename carries the component's name — the tiles stay uncaptioned. */
export const COMPONENTS: Tile[] = [
  { filler: "navigation-pill.png", ratio: "16 / 9" },
  { filler: "band-card.png", ratio: "4 / 3" },
  { filler: "insight-card.png", ratio: "1 / 1" },
  { filler: "command-bar.png", ratio: "4 / 3" },
  { filler: "live-transcript.png", ratio: "3 / 4" },
  { filler: "resource-drawer.png", ratio: "1 / 1" },
  { filler: "focus-deck.png", ratio: "16 / 9" },
  { filler: "stage-chips.png", ratio: "16 / 9" },
  { filler: "loop-video.png", ratio: "4 / 3" },
];

export const PRINCIPLES = [
  {
    eyebrow: "motion",
    title: "Every state has a transition",
    body: "Nothing snaps. If an element appears, it earns its entrance.",
    bg: "bg-[#0f766e]",
    ink: "text-white",
  },
  {
    eyebrow: "access",
    title: "Keyboard first, always",
    body: "Tab through it before you ship it. Focus rings stay visible.",
    bg: "bg-[#fbbf24]",
    ink: "text-neutral-900",
  },
  {
    eyebrow: "craft",
    title: "Ship it slow, ship it right",
    body: "The last ten percent is the part people actually remember.",
    bg: "bg-neutral-900",
    ink: "text-white",
  },
];

export const STACK = [
  { name: "React", use: "For interfaces", href: "react.dev" },
  { name: "TypeScript", use: "For type safety", href: "typescriptlang.org" },
  { name: "Next.js", use: "For product work", href: "nextjs.org" },
  { name: "Tailwind CSS", use: "For styling", href: "tailwindcss.com" },
  { name: "shadcn/ui", use: "For primitives", href: "ui.shadcn.com" },
  { name: "Supabase", use: "For data and auth", href: "supabase.com" },
  { name: "Express", use: "For services", href: "expressjs.com" },
  { name: "WebSockets", use: "For realtime", href: "developer.mozilla.org" },
  { name: "Twilio", use: "For voice and SMS", href: "twilio.com" },
  { name: "ElevenLabs", use: "For speech", href: "elevenlabs.io" },
  { name: "HeyGen", use: "For video agents", href: "heygen.com" },
  { name: "Gemini Pro", use: "For multimodal", href: "deepmind.google" },
  { name: "Figma", use: "For design", href: "figma.com" },
  { name: "Vercel", use: "For deploying", href: "vercel.com" },
];

export const TIMELINE = [
  {
    year: "2025 —",
    role: "Founder & Full-Stack",
    org: "BluePrint",
    note: "Education startup out of the USC Iovine and Young Academy incubator. Ran the UX research, designed the product, and shipped it.",
    tag: "USC IYA",
  },
  {
    year: "2025",
    role: "Product Developer",
    org: "YG Design Studio",
    note: "Client product work — turning brand direction into interfaces that survived contact with real users.",
    tag: "Studio",
  },
  {
    year: "2023 —",
    role: "President & Project Manager",
    org: "Ripples · Helen Keller Initiative",
    note: "Built and led the team. Two years of shipping programs, not slide decks.",
    tag: "Nonprofit",
  },
  {
    year: "2023",
    role: "Crew Member",
    org: "McDonald's",
    note: "First job. Rush hour is a systems problem, and it taught me more about throughput than any lecture did.",
    tag: "Where it started",
  },
];

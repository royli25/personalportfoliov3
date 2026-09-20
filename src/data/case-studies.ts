/**
 * Case study content. This is the file you edit.
 *
 * A study is a hero plus an ordered list of sections. Each section is a
 * heading, some paragraphs, and then any number of blocks (media, stats,
 * quotes, steps, notes) underneath it. Add, delete and reorder freely — the
 * page renders whatever is here, in this order.
 *
 * Every string below is a placeholder describing what belongs in the slot.
 * Replace them; don't leave the hints in.
 */

export type Tone = "cyan" | "emerald" | "amber" | "rose";

/** A media slot. `label` is the filename you'll eventually drop in. */
export type Media = {
  label: string;
  /** Public asset path. Omit it to render the labelled wireframe placeholder. */
  src?: string;
  /**
   * Public path to an mp4. Renders as a muted autoplaying loop and wins over
   * `src`; still set `width`/`height` to the video's pixel size so the slot
   * keeps its aspect before the file loads.
   */
  video?: string;
  alt?: string;
  width?: number;
  height?: number;
  /**
   * Chrome to wrap the shot in. `plain` is a bare bordered image; `diagram` is
   * an explanatory graphic that brings its own card, so it gets no border and
   * scrolls sideways on narrow screens instead of shrinking its labels away.
   */
  frame?: "browser" | "laptop" | "phone" | "plain" | "diagram";
  /** Fake address bar text. Only read for `frame: "browser"`. */
  url?: string;
  /** e.g. "16 / 9". Ignored by the phone frame, which fixes its own height. */
  ratio?: string;
  caption?: string;
};

export type Block =
  /** One shot, breaking out past the reading column. */
  | { kind: "media"; width?: "wide" | "mid" | "narrow"; media: Media }
  /** Two or three shots side by side. */
  | {
      kind: "gallery";
      width?: "wide" | "mid" | "narrow";
      items: Media[];
    }
  /** A row of big numbers. Three reads best; two and four both work. */
  | { kind: "stats"; items: { value: string; label: string }[] }
  /** A pulled quote — use a real sentence someone said to you. */
  | { kind: "quote"; text: string; attribution?: string }
  /** Numbered walkthrough: how it works, how you got there. */
  | { kind: "steps"; items: { title: string; body: string }[] }
  /** Terse bullets. Constraints, decisions, things you cut. */
  | { kind: "notes"; title?: string; items: string[] }
  /**
   * Text columns hung under a hairline rule — the shape the page uses for
   * anything that reads as a set: workarounds, lessons, deferred scope.
   * `scale` sets the weight: `sm` for a terse list, `lg` when each column is
   * carrying a real argument.
   */
  | {
      kind: "columns";
      /** Optional label above the set. */
      title?: string;
      scale?: "sm" | "md" | "lg";
      items: { eyebrow?: string; title: string; body: string }[];
    }
  /** Illustrated feature cards, side by side. */
  | { kind: "cards"; items: { media: Media; title: string; body: string }[] }
  /** One slide at a time, with dots and arrows. Good for a tl;dr. */
  | { kind: "carousel"; items: { media: Media; title: string; body: string }[] }
  /** A design call, shown as one large shot of the change. */
  | {
      kind: "decisions";
      items: {
        eyebrow: string;
        title: string;
        body: string;
        media: Media;
      }[];
    }
  /** A reading-column paragraph, for prose that sits between other blocks. */
  | { kind: "prose"; text: string };

export type Section = {
  /** Small mono label above the heading. Lowercase reads best. Omit on a blog. */
  eyebrow?: string;
  /** The heading. `accent` is the trailing (or leading) phrase; omit for none. */
  title?: string;
  accent?: string;
  /** Put the accent in front of the title rather than after it. */
  accentLeads?: boolean;
  tone?: Tone;
  /** One paragraph per string. */
  body: string[];
  blocks?: Block[];
};

export type CaseStudy = {
  slug: string;
  /** Short name, used in metadata and in the next-study link. */
  name: string;
  /** Page title, split so the accent half can be styled independently. */
  title: string;
  accent?: string;
  tone?: Tone;
  /** The one-paragraph summary directly under the title. */
  deck?: string;
  /** A chip under the title — typically the project repo. */
  repo?: { href: string; label: string };
  /** The facts bar: role, dates, team, stack. Four entries fits the row. */
  meta?: { label: string; value: string }[];
  /** The lead image, full width, directly under the title. */
  cover: Media;
  sections: Section[];
  next?: { slug: string; name: string; blurb: string };
};

const blueprint: CaseStudy = {
  slug: "blueprint",
  name: "BluePrint",
  title: "Surfacing 63 New Insights in Live Meetings for",
  accent: "Admissions Consultants.",
  tone: "amber",
  deck: "University guidance counselors store thousands of data points in their brains. Advisors need a new and improved way to surface data in real-time during conversations.",

  meta: [
    { label: "role", value: "Founder, design + engineering" },
    { label: "timeline", value: "2025 — present" },
    { label: "team", value: "Who else, and what they owned" },
    { label: "stack", value: "Next.js, Supabase, Gemini" },
  ],

  /**
   * The export already carries its own window chrome and gradient field, so it
   * takes the flush default — wrapping it in `frame: "browser"` would stack a
   * second address bar on top of the one baked into the shot.
   */
  cover: {
    label: "blueprintHero.png",
    src: "/projects/blueprint/blueprintHero.png",
    alt: "BluePrint's live meeting view: a student profile and running transcript on the left, with an insights rail surfacing matched profiles, research opportunities and summer programs on the right.",
    width: 1520,
    height: 922,
  },

  sections: [
    {
      eyebrow: "impact",
      title: "Our product,",
      accent: "In the hands of real users.",
      tone: "amber",
      body: [],
      blocks: [
        {
          kind: "stats",
          items: [
            { value: "3", label: "Consultancies" },
            { value: "200+", label: "Students" },
            { value: "1000+", label: "Stored Student Profiles" },
          ],
        },
      ],
    },

    {
      eyebrow: "the problem",
      title: "What was broken",
      accent: "before this.",
      tone: "rose",
      body: [
        "At one high school I worked with, a single counselor carried 124 students through application season. At the start of every 30 minute session with students, she spent 10 minutes catching up with student transcripts, old notes, and re-asking about the students application goals. That's 1/3 of the meeting wasted before meaningful advising.",
      ],
      blocks: [
        {
          kind: "media",
          width: "narrow",
          media: {
            label: "problem-caseload.png",
            src: "/projects/blueprint/problem-caseload.png",
            alt: "One counselor beside a grid of 124 student figures — the caseload she carries at once every application season",
            width: 2250,
            height: 690,
            frame: "diagram",
          },
        },
        {
          kind: "prose",
          text: "The rest of the meeting runs on the advisors memory. A counselor may have successfully aided a nearly identical student 3 years earlier into a university of their dreams. But because advising sessions run on memory, this information is not retrievable when it's needed and students miss out on the personalized advice they need.",
        },
        {
          kind: "media",
          width: "narrow",
          media: {
            label: "problem-recall.png",
            src: "/projects/blueprint/problem-recall.png",
            alt: "A field of thirty faded student questions with only two pulled back into focus, threaded to a small brain labelled minimal context",
            width: 2250,
            height: 690,
            frame: "diagram",
          },
        },
      ],
    },

    {
      eyebrow: "the status quo",
      title: "of advisors through 2 design partners.",
      accent: "Understanding the workflows",
      accentLeads: true,
      tone: "cyan",
      body: [
        "23 interviews with counselors across independent consultancies and one public high school. What the current workflow actually is: the tools they open, in what order, and where the ten minutes go.",
        "Then the fixes they've already tried, and the specific reason each one stops working at 124 students.",
      ],
      blocks: [
        {
          kind: "media",
          width: "narrow",
          media: {
            label: "Research.png",
            src: "/projects/blueprint/Research.png",
            alt: "Research board from advisor interviews: user-profile findings, current workflows, and the key feature ideas they pointed to",
            width: 2526,
            height: 1382,
            frame: "diagram",
          },
        },
        {
          kind: "columns",
          items: [
            {
              title: "A shared tracker per cohort.",
              body: "Holds status, not context. It answers where a student is, never what worked for a student like them.",
            },
            {
              title: "A generic client CRM, repurposed.",
              body: "Built around deals and stages. Nothing in it understands a transcript, an activities list, or a college list.",
            },
            {
              title: "“Just write it down after every meeting.”",
              body: "Notes get written and never re-read. At 124 students, retrieval is the bottleneck, not capture.",
            },
          ],
        },
      ],
    },

    {
      eyebrow: "opportunity",
      title: "what the counselor can't recall.",
      accent: "AI can retrieve",
      accentLeads: true,
      tone: "amber",
      body: [
        "We worked with our design partners to identify high priorities in our first MVP.",
      ],
      blocks: [
        {
          kind: "cards",
          items: [
            {
              media: {
                label: "opportunity-01-match.png",
                src: "/projects/blueprint/opportunity-01-match.png",
                alt: "This student fanning out to three matched past students from the classes of 2021, 2022 and 2023",
                width: 729,
                height: 513,
                ratio: "243 / 171",
              },
              title: "Match this student to past students.",
              body: "Surfaces the closest profiles from earlier cycles, so advice starts from what worked before rather than from recall.",
            },
            {
              media: {
                label: "opportunity-02-brief.png",
                src: "/projects/blueprint/opportunity-02-brief.png",
                alt: "Chat logs, notes and transcripts condensing into a single five-minute brief",
                width: 729,
                height: 513,
                ratio: "243 / 171",
              },
              title: "Provide 5 minute pre-meeting briefs and summaries.",
              body: "Transcripts, prior notes and open goals condensed ahead of the session, replacing the ten minutes spent catching up.",
            },
            {
              media: {
                label: "opportunity-03-context.png",
                src: "/projects/blueprint/opportunity-03-context.png",
                alt: "A video call with matched-student and research-opportunity cards surfacing beside it mid-conversation",
                width: 729,
                height: 513,
                ratio: "243 / 171",
              },
              title: "Seamlessly surface in-meeting context.",
              body: "Relevant history moves into view as the conversation does, so the counselor never leaves the call to search for it.",
            },
          ],
        },
      ],
    },

    {
      eyebrow: "design decisions",
      title: "in a review.",
      accent: "Three calls I'd defend",
      accentLeads: true,
      tone: "emerald",
      body: [
        "Each one has a before, an after, and the specific thing that forced the change.",
      ],
      blocks: [
        {
          kind: "decisions",
          items: [
            {
              eyebrow: "decision 01",
              title: "Passive and Active Insights",
              body: "Discussions with advisors revealed that alongside AI suggestions, advisors want some control over what insights can be surfaced.",
              media: {
                label: "decision-01.mp4",
                video: "/projects/blueprint/decision-01.mp4",
                alt: "Looping animation of the improved live-meeting screen — surfaced insights slide into the vertical rail beside the transcript",
                width: 1744,
                height: 1090,
                ratio: "872 / 545",
              },
            },
            {
              eyebrow: "decision 02",
              title: "Screen Real-estate and Traceability",
              body: "During live meetings, advisors need accessibility to track new insights from their peripheral vision.",
              media: {
                label: "decision-02.mp4",
                video: "/projects/blueprint/decision-02.mp4",
                alt: "Looping animation starting from the old shelf geometry — surfaced insights sitting in a horizontal row beneath the live transcript",
                width: 1520,
                height: 952,
                ratio: "190 / 119",
              },
            },
            {
              eyebrow: "decision 03",
              title: "Color Coded Insight Blocks",
              body: "Color coding makes insights easier to categorize from the corner of the eye.",
              media: {
                label: "decision-03.mp4",
                video: "/projects/blueprint/decision-03.mp4",
                alt: "Looping animation of the vertical insight rail — profile, research opportunity and summer program cards each carrying Add to notes and Dismiss",
                width: 1520,
                height: 952,
                ratio: "190 / 119",
              },
            },
          ],
        },
      ],
    },

    {
      eyebrow: "the solution",
      title: "what we delivered to advisors.",
      accent: "Here's",
      accentLeads: true,
      tone: "emerald",
      body: [
        "Three flows carry the product: what the advisor sees before the call, what surfaces during it, and what's left behind after.",
      ],
      blocks: [
        {
          kind: "decisions",
          items: [
            {
              eyebrow: "flow 01",
              title: "Student Management System",
              body: "Walk the pre-meeting path the way you'd demo it: what they land on, what's already assembled for them, and the decision it lets them make in the first minute.",
              media: {
                label: "solution-flow-01.mp4",
                video: "/projects/blueprint/solution-flow-01.mp4",
                alt: "Screen recording of the pre-meeting path — the Student Database list, opening Cole Skeen's profile, reading the 5-minute summary and saving a note into the notes rail",
                width: 1744,
                height: 1182,
                ratio: "872 / 591",
              },
            },
            {
              eyebrow: "flow 02",
              title: "Live Inline Meeting Insights",
              body: "The main event — what the advisor does mid-conversation, what the system does on its own, and where the two meet on screen.",
              media: {
                label: "solution-flow-02.mp4",
                video: "/projects/blueprint/solution-flow-02.mp4",
                alt: "Screen recording of a live meeting with Nate Whitcomb — the transcript streams in while course, competition, research and summer-program insights surface one by one in the rail beside it",
                width: 1744,
                height: 1184,
                ratio: "872 / 592",
              },
            },
            {
              eyebrow: "flow 03",
              title: "Resource Management Kit",
              body: "What the session leaves behind, where it lands, and how it comes back the next time this student is on the calendar.",
              media: {
                label: "solution-flow-03.mp4",
                video: "/projects/blueprint/solution-flow-03.mp4",
                alt: "Screen recording of the Resource Kit — browsing the shared library by collection, opening the MIT Summer Research Program drawer to see why it surfaces, and adding it so it starts surfacing for matching students",
                width: 1744,
                height: 1184,
                ratio: "872 / 592",
              },
            },
          ],
        },
      ],
    },
  ],

};

/**
 * A blog, not a full study — title, a repo chip, then a reading column.
 */
const gtostudio: CaseStudy = {
  slug: "gtostudio",
  name: "GTOStudio",
  title: "A renewed interface for poker solvers.",
  tone: "cyan",
  repo: {
    href: "https://github.com/royli25/gtostudio",
    label: "royli25/gtostudio",
  },

  cover: {
    label: "gtostudio-hero.jpg",
    src: "/projects/gtostudio/gtostudio-hero.jpg",
    alt: "GTOStudio — the optimal poker strategy. A club mark on a technical field.",
    width: 3082,
    height: 1756,
  },

  sections: [
    {
      body: [
        "Game theory optimal, or GTO, is a mathematical approach to poker that has been around the poker world since the early 2000s. It helps players find the balanced decisions that don’t allow opponents to exploit. Players use GTO to study theory behind the game of poker and base strategies on its concepts.",
        "Players study GTO through poker solvers. These tools simulate hands and calculate strong strategies for both players. The results can include hundreds of card combinations, bet sizes, actions, and frequencies. Players review this data to find mistakes and improve their decision making.",
      ],
      blocks: [
        {
          kind: "prose",
          text: "This is GTO+, a software built in 2018.",
        },
        {
          kind: "media",
          media: {
            label: "existing-solver.png",
            src: "/projects/gtostudio/existing-solver.png",
            alt: "GTO+, a 2018 poker solver: combo tables, a dense hand matrix, and action frequencies packed into one view.",
            width: 1746,
            height: 928,
          },
        },
        {
          kind: "prose",
          text: "The huge amount of information that poker players ingest makes design an especially important aspect to a solver. Though GTO+ is a powerful, affordable and trusted tool, its interface has not been updated with usability improvements since its release.",
        },
        {
          kind: "prose",
          text: "The experience feels dense and technical, with information scattered across the screen in tables, menus, and panels. Visual hierarchy makes it difficult to know where to look, presenting a steep learning curve for beginning users.",
        },
        {
          kind: "prose",
          text: "I built GTOStudio to explore a more approachable studying experience. My goal is to help players navigate complex strategies with less visual clutter, focusing on the clarity of communicating data.",
        },
        {
          kind: "media",
          media: {
            label: "gtoprod.png",
            src: "/projects/gtostudio/gtoprod.png",
            alt: "GTOStudio's study view: configure a spot on the left, a 13×13 strategy matrix in the centre, and action frequencies on the right.",
            width: 2704,
            height: 1652,
          },
        },
      ],
    },
  ],
};

/** Anchor id for a section, so the rail has something to scroll to. */
export function sectionId(eyebrow: string) {
  return eyebrow
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CASE_STUDIES: Record<string, CaseStudy> = {
  [blueprint.slug]: blueprint,
  [gtostudio.slug]: gtostudio,
};

export const CASE_SLUGS = Object.keys(CASE_STUDIES);

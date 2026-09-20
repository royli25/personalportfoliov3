import type { Tone } from "../parts/primitives";

/**
 * BlueprintX — the Live Meeting content.
 *
 * The transcript and the insights are one dataset on purpose: every card
 * names the utterance that caused it (`becauseOf`), so the film can't drift
 * into surfacing something nobody mentioned. If a card here doesn't obviously
 * follow from the line above it, the card is wrong — that causal read is the
 * entire product claim.
 *
 * This is the *embed* cut: ~30s, five insights, deliberately faster than real
 * speech. It's a highlight of a session, not a recording of one.
 */

export type Utterance = {
  id: string;
  speaker: "advisor" | "student";
  text: string;
};

/**
 * Sophomore-summer planning with Nate Whitcomb — the arc runs goals →
 * interest → summer → local alternative → proof → next year's course, and
 * each turn hands the assistant something concrete to act on.
 */
export const TRANSCRIPT: Utterance[] = [
  { id: "u1", speaker: "advisor", text: "Sophomore summer is the one that counts. What are you thinking?" },
  { id: "u2", speaker: "student", text: "I don't know yet. I like bio — maybe environmental stuff?" },
  { id: "u3", speaker: "advisor", text: "Anything specific pull you in?" },
  { id: "u4", speaker: "student", text: "We did water testing in the river behind school. I liked that more than the labs." },
  { id: "u5", speaker: "advisor", text: "Then we build the summer around fieldwork, not a classroom." },
  { id: "u6", speaker: "student", text: "Is that even a real thing for tenth graders?" },
  { id: "u7", speaker: "advisor", text: "More than you'd think." },
  { id: "u8", speaker: "student", text: "That one's six weeks away though — my parents want me working." },
  { id: "u9", speaker: "advisor", text: "Paid, local, same work. That solves both." },
  { id: "u10", speaker: "student", text: "Okay, that's better." },
  { id: "u11", speaker: "advisor", text: "You'll also want something to point at by junior year." },
  { id: "u12", speaker: "student", text: "What should I be taking next year to set that up?" },
  { id: "u13", speaker: "advisor", text: "That one. Let's get the lab email out this week." },
];

export type MeetingInsight = {
  id: string;
  /** Card type — becomes the coloured label. */
  type: string;
  tone: Tone;
  title: string;
  subtitle: string;
  /** Dot-separated fact line under the rule. */
  facts: string;
  /** Compressed form for the row docked inside the transcript. */
  dockLabel: string;
  dockDetail: string;
  /** The utterance this card is a response to — keeps the film honest. */
  becauseOf: string;
};

export const MEETING_INSIGHTS: MeetingInsight[] = [
  {
    id: "maya-okonjo",
    type: "Similar Profile",
    tone: "match",
    title: "Maya Okonjo",
    subtitle: "Environmental Science · Brown",
    facts: "Started with river monitoring in 10th · Same coursework track",
    dockLabel: "Profile Surfaced",
    dockDetail: "Maya Okonjo · Env. Sci, Brown",
    // Fires on the interest itself, not the anecdote four turns later — the
    // rail should not sit empty for a third of a 30-second loop.
    becauseOf: "u2",
  },
  {
    id: "ssp-field",
    type: "Summer Program",
    tone: "program",
    title: "SSP Environmental Field Research",
    subtitle: "6 weeks · Residential",
    facts: "Open to rising juniors · Need-based aid · Applications open Feb 1",
    dockLabel: "Summer Program",
    dockDetail: "SSP Field Research · aid available",
    // The river-testing detail is what makes a *field* program the match.
    becauseOf: "u4",
  },
  {
    id: "umass-watershed",
    type: "Research Opportunity",
    tone: "safety",
    title: "UMass Amherst — Watershed Lab",
    subtitle: "High-school research assistant",
    facts: "Paid · 12 hrs/week · 40 min from Deerfield",
    dockLabel: "Research Opportunity",
    dockDetail: "UMass Watershed Lab · paid, local",
    becauseOf: "u8",
  },
  {
    id: "sjwp",
    type: "Competition",
    tone: "reach",
    title: "Stockholm Junior Water Prize",
    subtitle: "Regional entry · Massachusetts",
    facts: "Deadline Apr 1 · Individual or team · Fieldwork qualifies",
    dockLabel: "Competition",
    dockDetail: "Stockholm Junior Water Prize · Apr 1",
    becauseOf: "u11",
  },
  {
    id: "ap-enviro",
    type: "Course",
    tone: "course",
    title: "AP Environmental Science",
    subtitle: "Offered to juniors at Deerfield",
    facts: "Course selection closes Mar 15 · No prerequisite",
    dockLabel: "Course",
    dockDetail: "AP Environmental Science · Mar 15",
    becauseOf: "u12",
  },
];

/**
 * The meeting is with a sophomore in the "Exploring" stage — no built school
 * list yet, just three early ideas. That's the honest state for 10th grade,
 * and it's why every card here is about *finding* something rather than
 * finishing an application.
 */
export const MEETING_STUDENT = {
  name: "Nate Whitcomb",
  meta: "10th · Deerfield Academy",
  stats: "GPA 3.81 · PSAT 1290 · Interest: Environmental Sci",
  initials: "NW",
  targets: [
    { name: "Brown", fit: "Reach", tone: "reach" as Tone },
    { name: "UMass Amherst", fit: "Target", tone: "match" as Tone },
    { name: "Vermont", fit: "Safety", tone: "safety" as Tone },
  ],
};

/**
 * The Live pill starts here rather than at 00:00. A 30-second cut is a
 * highlight, not the whole session — a timer reading 00:07 with three
 * insights already surfaced is the one detail that would give that away.
 */
export const MEETING_CLOCK_OFFSET = 4 * 60 + 12;

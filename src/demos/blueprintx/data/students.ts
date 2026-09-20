import type { NavGroup } from "../parts/sidebar";

/**
 * BlueprintX — the one dataset every screen reads.
 *
 * Content is lifted verbatim from the Figma Flows page (file
 * YYbMTsn9jqq4BXdSL4OMZm): the table rows from `B2 — stage chips` (545:4823)
 * plus the three below-the-fold rows from animation still 02, the profile from
 * the canonical `02 — Student Profile` (535:13019), and the expanded school
 * list from still 05. The dashboard, the search dropdown and the profile all
 * derive from these records — which is what makes per-keystroke filtering
 * real instead of three hand-authored dropdown states.
 *
 * ORDER IS THE PRODUCT IDEA: booked meetings first, then longest-since-met to
 * most-recently-met. The array ships pre-sorted; don't re-sort in the UI.
 */

/* ------------------------------------------------------------------- tones */

export type Stage =
  | "Exploring"
  | "Building list"
  | "Applying"
  | "Drafting essays"
  | "Decisions"
  | "Submitted";

/** Application-stage chip palette — six hues, one per stage. */
export const STAGE_TONE: Record<Stage, { ink: string; bg: string }> = {
  Exploring: { ink: "#6b6b6b", bg: "#f1f1ef" },
  "Building list": { ink: "#4a2f91", bg: "#ece9f5" },
  Applying: { ink: "#1c5a70", bg: "#e4eef2" },
  "Drafting essays": { ink: "#8e2a5b", bg: "#f7ecef" },
  Decisions: { ink: "#6b5a12", bg: "#efeada" },
  Submitted: { ink: "#256b3b", bg: "#e9f0eb" },
};

export type MeetingStatus = {
  /** booked = blue, overdue = amber, recent = grey. */
  kind: "booked" | "overdue" | "recent";
  label: string;
};

export const STATUS_TONE: Record<
  MeetingStatus["kind"],
  { ink: string; bg: string }
> = {
  booked: { ink: "#2f5490", bg: "#e6eefb" },
  overdue: { ink: "#96530f", bg: "#fdecdc" },
  recent: { ink: "#6b6b6b", bg: "#f1f1ef" },
};

export type SchoolFit = "Reach" | "Target" | "Safety";

/** Target-school chip palette, keyed by fit tier. */
export const FIT_TONE: Record<SchoolFit, { ink: string; bg: string }> = {
  Reach: { ink: "#96530f", bg: "#fdecdc" },
  Target: { ink: "#2f5490", bg: "#e6eefb" },
  Safety: { ink: "#256b3b", bg: "#e2f3e7" },
};

/* ----------------------------------------------------------------- records */

export type StudentRecord = {
  id: string;
  name: string;
  school: string;
  grade: "10th" | "11th" | "12th";
  stage: Stage;
  status: MeetingStatus;
  noteCount: number;
  initials: string;
  /** Only Cole has a photo; everyone else renders a monogram. */
  photo?: string;
};

export const STUDENTS: StudentRecord[] = [
  { id: "cole-skeen", name: "Cole Skeen", school: "Princeton Day School", grade: "12th", stage: "Drafting essays", status: { kind: "booked", label: "Today · 2:00 PM" }, noteCount: 4, initials: "CS", photo: "/blueprintx/avatar.png" },
  { id: "amara-osei", name: "Amara Osei", school: "Bergen Academies", grade: "11th", stage: "Building list", status: { kind: "booked", label: "Tomorrow · 10:30 AM" }, noteCount: 7, initials: "AO" },
  { id: "priya-raman", name: "Priya Raman", school: "Lakeside School", grade: "12th", stage: "Applying", status: { kind: "booked", label: "Fri · 4:00 PM" }, noteCount: 2, initials: "PR" },
  { id: "marcus-bell", name: "Marcus Bell", school: "Trinity Preparatory", grade: "11th", stage: "Exploring", status: { kind: "overdue", label: "Last met 14 weeks ago" }, noteCount: 1, initials: "MB" },
  { id: "sofia-duarte", name: "Sofia Duarte", school: "Crossroads School", grade: "12th", stage: "Drafting essays", status: { kind: "overdue", label: "Last met 11 weeks ago" }, noteCount: 3, initials: "SD" },
  { id: "nate-whitcomb", name: "Nate Whitcomb", school: "Deerfield Academy", grade: "10th", stage: "Exploring", status: { kind: "overdue", label: "Last met 9 weeks ago" }, noteCount: 0, initials: "NW" },
  { id: "ivy-chen", name: "Ivy Chen", school: "The Harker School", grade: "12th", stage: "Submitted", status: { kind: "recent", label: "Last met 2 days ago" }, noteCount: 6, initials: "IC" },
  { id: "jonah-reyes", name: "Jonah Reyes", school: "St. Ignatius Prep", grade: "11th", stage: "Building list", status: { kind: "recent", label: "Last met 4 days ago" }, noteCount: 2, initials: "JR" },
  { id: "nicole-barrett", name: "Nicole Barrett", school: "Greenwich Academy", grade: "11th", stage: "Building list", status: { kind: "recent", label: "Last met 5 days ago" }, noteCount: 2, initials: "NB" },
  { id: "leila-haddad", name: "Leila Haddad", school: "Milton Academy", grade: "12th", stage: "Decisions", status: { kind: "recent", label: "Last met 6 days ago" }, noteCount: 5, initials: "LH" },
  { id: "dara-okonkwo", name: "Dara Okonkwo", school: "Riverdale Country", grade: "11th", stage: "Building list", status: { kind: "recent", label: "Last met 8 days ago" }, noteCount: 3, initials: "DO" },
  { id: "theo-lindqvist", name: "Theo Lindqvist", school: "Phillips Exeter", grade: "12th", stage: "Applying", status: { kind: "recent", label: "Last met 10 days ago" }, noteCount: 4, initials: "TL" },
  { id: "rina-patel", name: "Rina Patel", school: "Castilleja School", grade: "11th", stage: "Exploring", status: { kind: "recent", label: "Last met 12 days ago" }, noteCount: 1, initials: "RP" },
  { id: "owen-marsh", name: "Owen Marsh", school: "Choate Rosemary Hall", grade: "12th", stage: "Submitted", status: { kind: "recent", label: "Last met 14 days ago" }, noteCount: 2, initials: "OM" },
  { id: "zara-iqbal", name: "Zara Iqbal", school: "Horace Mann School", grade: "11th", stage: "Building list", status: { kind: "recent", label: "Last met 16 days ago" }, noteCount: 5, initials: "ZI" },
  { id: "felix-nowak", name: "Felix Nowak", school: "Groton School", grade: "10th", stage: "Exploring", status: { kind: "recent", label: "Last met 18 days ago" }, noteCount: 0, initials: "FN" },
  { id: "cole-whitfield", name: "Cole Whitfield", school: "Berkshire School", grade: "10th", stage: "Exploring", status: { kind: "recent", label: "Last met 3 weeks ago" }, noteCount: 1, initials: "CW" },
];

/**
 * Search over name + school, case-insensitive substring — "cole" matches
 * Nicole Barrett, Cole Skeen and Cole Whitfield, which is exactly the
 * dropdown the Figma S6 iteration shows. Capped at 3, like the mock.
 */
export function searchStudents(query: string): StudentRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q),
  ).slice(0, 3);
}

/* ------------------------------------------------------------------ profile */

export type TargetSchoolEntry = { name: string; fit: SchoolFit };

export type Note = {
  /** Row header, e.g. "Meeting note · You" or "From insight · Research Opportunity". */
  kind: string;
  /** Green header for insight-sourced notes, grey otherwise. */
  fromInsight?: boolean;
  date: string;
  body: string;
};

export type StudentProfile = {
  /** One line of academics, e.g. "GPA 3.94 · SAT 1480 · Major: Comp. Sci". */
  stats: string;
  targets: TargetSchoolEntry[];
  summary: {
    /** "Synthesised from 6 meetings and 12 notes · 2 min ago" */
    synthesised: string;
    studentSummary: string;
    programs: string[];
    discussion: string;
    concerns: string[];
  };
  /** Count chip on the Notes eyebrow — larger than the visible list. */
  noteTotal: number;
  meetingHistoryCount: number;
  notes: Note[];
};

const COLE_PROFILE: StudentProfile = {
  stats: "GPA 3.94 · SAT 1480 · Major: Comp. Sci",
  targets: [
    { name: "MIT", fit: "Reach" },
    { name: "Cornell", fit: "Reach" },
    { name: "UMich", fit: "Target" },
    { name: "Penn State", fit: "Safety" },
    { name: "Stanford", fit: "Reach" },
    { name: "Carnegie Mellon", fit: "Reach" },
    { name: "Caltech", fit: "Reach" },
    { name: "Georgia Tech", fit: "Target" },
    { name: "UIUC", fit: "Target" },
    { name: "Purdue", fit: "Target" },
    { name: "UW", fit: "Target" },
    { name: "UT Austin", fit: "Target" },
    { name: "Rutgers", fit: "Safety" },
    { name: "Ohio State", fit: "Safety" },
    { name: "Arizona State", fit: "Safety" },
  ],
  summary: {
    synthesised: "Synthesised from 6 meetings and 12 notes · 2 min ago",
    studentSummary:
      "Cole is a strong CS applicant who is ahead on testing and behind on narrative. The 3.94 and the 1480 are settled, but the Common App essay is three drafts in and still opens flat, and the robotics captaincy that actually differentiates him barely surfaces anywhere on the list. Since the aid conversation with his parents last month the list has widened at the bottom — Penn State came in as a second safety — and his own interest has moved from industry work toward research.",
    programs: [
      "MIT UROP — undergrad research, rolling deadline; email Prof. Wong this week.",
      "Cornell Summer College — 3 weeks, $6,800, aid available; opens Jan 5.",
      "RSI at MIT — free and the most selective of the five; teacher recommendation needed by Feb.",
      "Michigan MPulse Engineering — 2 weeks; doubles as the Midwest campus visit he has not made.",
      "Stanford AI4ALL — no cost, application only; the closest fit to the robotics work.",
    ],
    discussion:
      "Most of the hour went to the Common App essay. Cole read the third draft aloud and the robotics failure story only appeared in the final paragraph — which is where all the energy was — so we agreed to move it to the opening and cut the two framing sentences before it. He pushed back on dropping the summer internship search until we mapped the hours against the UROP commitment, at which point he made the call himself. The last ten minutes were his parents’ aid question: Penn State goes on the list as a second safety, and Cornell Summer College only works if the aid application goes in alongside it.",
    concerns: [
      "Essay timeline — three drafts in with no opening that works, and the ED deadline is six weeks out.",
      "List balance — no Midwest target, and both safeties are aid-dependent.",
      "Follow-through — he has missed the last two self-set draft dates without flagging either.",
    ],
  },
  noteTotal: 12,
  meetingHistoryCount: 6,
  notes: [
    { kind: "Meeting note · You", date: "Mar 12", body: "Wants to lead with the robotics failure story in the Common App essay — revisit the opening line before the next draft." },
    { kind: "From insight · Research Opportunity", fromInsight: true, date: "Mar 12", body: "MIT UROP — rolling deadline, 10 hrs a week, paid. Cole to email Prof. Wong this week." },
    { kind: "Meeting note · You", date: "Mar 5", body: "Parents are aid-sensitive. Added Penn State as a second safety; frame Cornell Summer College around the aid package." },
    { kind: "Follow-up · You", date: "Feb 26", body: "Ms. Alvarez confirmed the counsellor recommendation. No further chasing needed." },
    { kind: "Meeting note · You", date: "Feb 19", body: "Dropped the summer internship search — Cole is far more motivated by research than by industry work." },
    { kind: "Meeting note · You", date: "Feb 12", body: "First pass at the school list. MIT and Cornell are both reaches; still needs one more target in the Midwest." },
  ],
};

const PROFILES: Record<string, StudentProfile> = {
  "cole-skeen": COLE_PROFILE,
};

/**
 * Only Cole is fully authored (he's the one the flow opens). Anyone else gets
 * a thin generic profile so a stray click never renders a broken screen.
 */
export function getProfile(id: string): StudentProfile {
  const existing = PROFILES[id];
  if (existing) return existing;
  const record = STUDENTS.find((s) => s.id === id);
  return {
    stats: "GPA — · SAT — · Major: Undecided",
    targets: [],
    summary: {
      synthesised: `Synthesised from ${record?.noteCount ?? 0} notes · just now`,
      studentSummary: `${record?.name ?? "This student"} is early in the process — no synthesis yet. Open a meeting or add notes to build one.`,
      programs: [],
      discussion: "No meetings recorded yet.",
      concerns: [],
    },
    noteTotal: record?.noteCount ?? 0,
    meetingHistoryCount: 0,
    notes: [],
  };
}

/* --------------------------------------------------------------------- chrome */

/**
 * Sidebar nav. Rows carrying a `screen` are real navigation; the rest are
 * chrome for destinations this demo doesn't build. Which row reads as current
 * comes from state, not from this list.
 */
export const NAV: NavGroup[] = [
  {
    title: "Essentials",
    items: [
      { label: "Home", icon: "nav-home" },
      { label: "Student Database", icon: "nav-students", screen: "database" },
      { label: "Resource Kit", icon: "nav-resources", screen: "resources" },
    ],
  },
  {
    title: "Tools",
    items: [{ label: "Live Meeting", icon: "nav-live", screen: "meeting" }],
  },
  {
    title: "Settings",
    items: [{ label: "Settings", icon: "nav-settings" }],
  },
];

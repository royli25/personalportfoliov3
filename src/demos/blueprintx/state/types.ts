import type { Note } from "../data/students";

/** Progress of one spoken line: how much has been transcribed, and whether
 *  the transcription service has firmed it up from its interim guess. */
export type UtteranceState = {
  id: string;
  speaker: "advisor" | "student";
  words: number;
  settled: boolean;
};

export type MeetingState = {
  utterances: UtteranceState[];
  /** Assistant is working on the line that just landed. */
  processing: boolean;
  /** Insight ids, newest first — one id covers both the rail card and its
   *  docked transcript row, because they surface as a single paired event. */
  surfaced: string[];
  captured: string[];
  dismissed: string[];
};

export const INITIAL_MEETING: MeetingState = {
  utterances: [],
  processing: false,
  surfaced: [],
  captured: [],
  dismissed: [],
};

/**
 * BlueprintX demo state.
 *
 * THE RULE THAT KEEPS THIS RECORDABLE *AND* EMBEDDABLE: anything the flow
 * shows on screen lives here and changes only through the reducer. Screens
 * are pure renders of this object — no useState in `screens/` or `parts/`
 * for anything the film depicts. Today real input drives it (hand-driven for
 * Screen Studio); later a scripted driver can dispatch the same actions on a
 * timeline without touching a single screen.
 */
/** Add-resource modal, one stage at a time. `step` counts completed
 *  extraction steps (0..4) and is advanced by the extract script's beats;
 *  `done` flips on the script's final beat and turns the same page into the
 *  confirm — there is no separate review screen. The url is typed/pasted by
 *  the advisor on the link stage — nothing arrives pre-filled. */
export type AddResourceModal =
  | { stage: "source" }
  | { stage: "link"; url: string }
  | { stage: "extracting"; step: number; url: string; done: boolean };

/** Resource Kit. Browsing is user-driven throughout — search, collection,
 *  view and the detail drawer are all real controls, not staged states.
 *  The one time-driven part is the extraction pass, and that runs on the
 *  shared clock like everything else scripted. */
export type ResourceState = {
  query: string;
  /** Collection id from data/resources.ts — "all" is the rail's first row.
   *  The rail and the Type dropdown are two controls over this ONE value. */
  collection: string;
  /** Grade the student is in ("10th") or null for all. */
  grade: string | null;
  /** Subject filter or null for all. */
  subject: string | null;
  /** Which toolbar dropdown is open. */
  openMenu: "type" | "grade" | "subject" | null;
  view: "grid" | "list";
  /** Which record the detail drawer shows. */
  openId: string | null;
  modal: AddResourceModal | null;
  /** Saved this session: KIT_ADDITION is in the kit, ringed, toast up. */
  justAdded: boolean;
  toastOpen: boolean;
};

export const INITIAL_RESOURCES: ResourceState = {
  query: "",
  collection: "all",
  grade: null,
  subject: null,
  openMenu: null,
  view: "grid",
  openId: null,
  modal: null,
  justAdded: false,
  toastOpen: false,
};

export type DemoState = {
  screen: "database" | "profile" | "meeting" | "resources";
  /** Which student the profile screen shows. */
  openStudentId: string | null;

  /* search */
  query: string;
  /** Dropdown is open — true while the field has focus and a query. */
  searchOpen: boolean;
  /** Index of the armed (keyboard-selected) result row. */
  armed: number;

  /* profile */
  schoolsExpanded: boolean;
  summaryOpen: boolean;

  /* notes */
  noteDraft: string;
  /** Notes added this session, newest first, keyed by student id. */
  addedNotes: Record<string, Note[]>;

  /** Live Meeting. Driven by the script player, not by clicks — except
   *  capture/dismiss, which stay hand-driven mid-take. */
  meeting: MeetingState;

  /** Resource Kit — hand-driven. */
  resources: ResourceState;
};

export const INITIAL_STATE: DemoState = {
  screen: "database",
  openStudentId: null,
  query: "",
  searchOpen: false,
  armed: 0,
  schoolsExpanded: false,
  summaryOpen: false,
  noteDraft: "",
  addedNotes: {},
  meeting: INITIAL_MEETING,
  resources: INITIAL_RESOURCES,
};

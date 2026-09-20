/**
 * Every interaction the flow performs, as named events. This union *is* the
 * storyboard: search → arrow to a result → open → expand schools → open the
 * summary → write a note → save. Real events dispatch these today; a scripted
 * player can replay the same list later.
 */
export type DemoAction =
  | { type: "QUERY_CHANGED"; query: string }
  | { type: "SEARCH_DISMISSED" }
  | { type: "ARM_MOVED"; delta: 1 | -1 }
  /** Enter on the armed dropdown row. */
  | { type: "RESULT_COMMITTED" }
  /** Click on a table row or dropdown row. */
  | { type: "STUDENT_OPENED"; id: string }
  | { type: "BACKED_TO_DATABASE" }
  | { type: "SCHOOLS_TOGGLED" }
  | { type: "SUMMARY_TOGGLED" }
  | { type: "NOTE_DRAFTED"; text: string }
  | { type: "NOTE_SAVED" }
  /** Sidebar navigation — the product's own way between screens. */
  | { type: "NAV_SELECTED"; screen: "database" | "meeting" | "resources" }
  /* ---------------------------------------------------- resource kit */
  | { type: "RESOURCE_QUERY_CHANGED"; query: string }
  | { type: "COLLECTION_SELECTED"; id: string }
  | { type: "RESOURCE_VIEW_CHANGED"; view: "grid" | "list" }
  /** Opens the detail drawer. */
  | { type: "RESOURCE_OPENED"; id: string }
  | { type: "RESOURCE_CLOSED" }
  /** Toolbar dropdowns — toggling the open one closes it. */
  | { type: "FILTER_MENU_TOGGLED"; menu: "type" | "grade" | "subject" }
  | { type: "FILTER_MENU_DISMISSED" }
  /** Type menu writes the same collection the rail does — without clearing
   *  the query, because the dropdown refines a search in progress. */
  | { type: "TYPE_PICKED"; collection: string }
  | { type: "GRADE_PICKED"; grade: string | null }
  | { type: "SUBJECT_PICKED"; subject: string | null }
  | { type: "FILTERS_CLEARED" }
  /* ------------------------------------------- add resource (Flow C) */
  | { type: "ADD_RESOURCE_OPENED" }
  /** "Paste a link" — the modal's one live source. Opens the URL entry. */
  | { type: "SOURCE_CHOSEN" }
  /** Typing/pasting into the link field. */
  | { type: "URL_DRAFTED"; text: string }
  /** Continue (or Enter) with a non-empty link — starts extraction. */
  | { type: "LINK_SUBMITTED" }
  /** Rewind target for the extract script's replay. */
  | { type: "EXTRACT_RESET" }
  /** Extraction step `step` just completed (1-based). */
  | { type: "EXTRACT_ADVANCED"; step: number }
  | { type: "EXTRACT_FINISHED" }
  | { type: "RESOURCE_SAVED" }
  /** Toast's Undo — takes the addition back out. */
  | { type: "ADDITION_UNDONE" }
  | { type: "TOAST_DISMISSED" }
  | { type: "MODAL_DISMISSED" }
  /* ---------------------------------------------------- live meeting */
  /** Rewind target — the player dispatches this before replaying. */
  | { type: "MEETING_RESET" }
  /** Transcription progress: `words` of this utterance are now visible. */
  | { type: "UTTERANCE_STREAMED"; id: string; speaker: "advisor" | "student"; words: number }
  /** Interim guess firms up into final text. */
  | { type: "UTTERANCE_SETTLED"; id: string }
  | { type: "INSIGHT_PROCESSING" }
  | { type: "INSIGHT_SURFACED"; id: string }
  | { type: "INSIGHT_CAPTURED"; id: string }
  | { type: "INSIGHT_DISMISSED"; id: string };

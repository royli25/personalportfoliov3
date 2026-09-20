import { searchStudents } from "../data/students";
import type { DemoAction } from "./actions";
import { INITIAL_MEETING, INITIAL_STATE, type DemoState } from "./types";

export function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "QUERY_CHANGED":
      return {
        ...state,
        query: action.query,
        searchOpen: action.query.trim().length > 0,
        // A new query invalidates the old selection.
        armed: 0,
      };

    case "SEARCH_DISMISSED":
      return { ...state, searchOpen: false, query: "" };

    case "ARM_MOVED": {
      const count = searchStudents(state.query).length;
      if (!state.searchOpen || count === 0) return state;
      const armed = Math.min(Math.max(state.armed + action.delta, 0), count - 1);
      return { ...state, armed };
    }

    case "RESULT_COMMITTED": {
      const results = searchStudents(state.query);
      const hit = results[state.armed];
      if (!state.searchOpen || !hit) return state;
      return openStudent(state, hit.id);
    }

    case "STUDENT_OPENED":
      return openStudent(state, action.id);

    case "BACKED_TO_DATABASE":
      return {
        ...state,
        screen: "database",
        openStudentId: null,
        schoolsExpanded: false,
        summaryOpen: false,
        noteDraft: "",
      };

    case "SCHOOLS_TOGGLED":
      return { ...state, schoolsExpanded: !state.schoolsExpanded };

    case "SUMMARY_TOGGLED":
      return { ...state, summaryOpen: !state.summaryOpen };

    case "NOTE_DRAFTED":
      return { ...state, noteDraft: action.text };

    case "NAV_SELECTED":
      if (action.screen === "meeting") {
        // Opening the meeting rewinds it — you're starting a session, and the
        // clock resets alongside this in app.tsx.
        return {
          ...INITIAL_STATE,
          addedNotes: state.addedNotes,
          screen: "meeting",
          meeting: INITIAL_MEETING,
        };
      }
      return {
        ...INITIAL_STATE,
        addedNotes: state.addedNotes,
        screen: action.screen,
      };

    /* ------------------------------------------------------ resource kit */

    case "RESOURCE_QUERY_CHANGED":
      return {
        ...state,
        resources: { ...state.resources, query: action.query },
      };

    case "COLLECTION_SELECTED":
      // Switching collections clears the query — the count line would
      // otherwise describe a filter the toolbar no longer shows.
      return {
        ...state,
        resources: { ...state.resources, collection: action.id, query: "" },
      };

    case "RESOURCE_VIEW_CHANGED":
      return {
        ...state,
        resources: { ...state.resources, view: action.view },
      };

    case "RESOURCE_OPENED":
      return { ...state, resources: { ...state.resources, openId: action.id } };

    case "RESOURCE_CLOSED":
      return { ...state, resources: { ...state.resources, openId: null } };

    case "FILTER_MENU_TOGGLED":
      return {
        ...state,
        resources: {
          ...state.resources,
          openMenu:
            state.resources.openMenu === action.menu ? null : action.menu,
        },
      };

    case "FILTER_MENU_DISMISSED":
      return { ...state, resources: { ...state.resources, openMenu: null } };

    case "TYPE_PICKED":
      return {
        ...state,
        resources: {
          ...state.resources,
          collection: action.collection,
          openMenu: null,
        },
      };

    case "GRADE_PICKED":
      return {
        ...state,
        resources: { ...state.resources, grade: action.grade, openMenu: null },
      };

    case "SUBJECT_PICKED":
      return {
        ...state,
        resources: {
          ...state.resources,
          subject: action.subject,
          openMenu: null,
        },
      };

    case "FILTERS_CLEARED":
      return {
        ...state,
        resources: {
          ...state.resources,
          query: "",
          collection: "all",
          grade: null,
          subject: null,
          openMenu: null,
        },
      };

    /* ------------------------------------------- add resource (Flow C) */

    case "ADD_RESOURCE_OPENED":
      return {
        ...state,
        resources: { ...state.resources, modal: { stage: "source" } },
      };

    case "SOURCE_CHOSEN":
      // Nothing arrives pre-filled — the advisor drops the link in.
      return {
        ...state,
        resources: { ...state.resources, modal: { stage: "link", url: "" } },
      };

    case "URL_DRAFTED":
      if (state.resources.modal?.stage !== "link") return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          modal: { stage: "link", url: action.text },
        },
      };

    case "LINK_SUBMITTED": {
      const modal = state.resources.modal;
      if (modal?.stage !== "link" || !modal.url.trim()) return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          modal: {
            stage: "extracting",
            step: 0,
            url: modal.url.trim(),
            done: false,
          },
        },
      };
    }

    case "EXTRACT_RESET":
      // Only meaningful mid-extraction; a rewind after the modal moved on
      // (or closed) must not drag the flow backwards.
      if (state.resources.modal?.stage !== "extracting") return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          modal: { ...state.resources.modal, step: 0, done: false },
        },
      };

    case "EXTRACT_ADVANCED":
      if (state.resources.modal?.stage !== "extracting") return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          modal: { ...state.resources.modal, step: action.step },
        },
      };

    case "EXTRACT_FINISHED":
      // The extraction page IS the confirm — done arms its Add button.
      if (state.resources.modal?.stage !== "extracting") return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          modal: { ...state.resources.modal, done: true },
        },
      };

    case "RESOURCE_SAVED":
      if (
        state.resources.modal?.stage !== "extracting" ||
        !state.resources.modal.done
      )
        return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          modal: null,
          justAdded: true,
          toastOpen: true,
          // Land the take where the new card is: All resources, grid, no query.
          query: "",
          collection: "all",
          view: "grid",
        },
      };

    case "ADDITION_UNDONE":
      return {
        ...state,
        resources: {
          ...state.resources,
          justAdded: false,
          toastOpen: false,
        },
      };

    case "TOAST_DISMISSED":
      return { ...state, resources: { ...state.resources, toastOpen: false } };

    case "MODAL_DISMISSED":
      return { ...state, resources: { ...state.resources, modal: null } };

    /* ------------------------------------------------------ live meeting */

    case "MEETING_RESET":
      return { ...state, meeting: INITIAL_MEETING };

    case "UTTERANCE_STREAMED": {
      const { utterances } = state.meeting;
      const i = utterances.findIndex((u) => u.id === action.id);
      const next =
        i === -1
          ? [
              ...utterances,
              {
                id: action.id,
                speaker: action.speaker,
                words: action.words,
                settled: false,
              },
            ]
          : utterances.map((u, j) =>
              j === i ? { ...u, words: action.words } : u,
            );
      return { ...state, meeting: { ...state.meeting, utterances: next } };
    }

    case "UTTERANCE_SETTLED":
      return {
        ...state,
        meeting: {
          ...state.meeting,
          utterances: state.meeting.utterances.map((u) =>
            u.id === action.id ? { ...u, settled: true } : u,
          ),
        },
      };

    case "INSIGHT_PROCESSING":
      return { ...state, meeting: { ...state.meeting, processing: true } };

    case "INSIGHT_SURFACED":
      if (state.meeting.surfaced.includes(action.id)) return state;
      return {
        ...state,
        meeting: {
          ...state.meeting,
          processing: false,
          // Newest first — the rail reads top-down as most-recent-first.
          surfaced: [action.id, ...state.meeting.surfaced],
        },
      };

    case "INSIGHT_CAPTURED":
      if (state.meeting.captured.includes(action.id)) return state;
      return {
        ...state,
        meeting: {
          ...state.meeting,
          captured: [...state.meeting.captured, action.id],
        },
      };

    case "INSIGHT_DISMISSED":
      return {
        ...state,
        meeting: {
          ...state.meeting,
          dismissed: [...state.meeting.dismissed, action.id],
        },
      };

    case "NOTE_SAVED": {
      const id = state.openStudentId;
      const body = state.noteDraft.trim();
      if (!id || !body) return state;
      const mine = state.addedNotes[id] ?? [];
      return {
        ...state,
        noteDraft: "",
        addedNotes: {
          ...state.addedNotes,
          [id]: [
            { kind: "Meeting note · You", date: "Just now", body },
            ...mine,
          ],
        },
      };
    }
  }
}

function openStudent(state: DemoState, id: string): DemoState {
  return {
    ...INITIAL_STATE,
    addedNotes: state.addedNotes,
    screen: "profile",
    openStudentId: id,
  };
}

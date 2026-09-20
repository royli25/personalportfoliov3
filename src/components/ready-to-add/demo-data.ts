import type { AgentTask, ExtractedField } from "./ready-to-add";

/* Copied from the lab's demo.tsx alongside the component — sample data is the
   MSRP record from the Figma source. Every task carries real reasoning so
   every chevron has something true to disclose. */

const TASKS: AgentTask[] = [
  {
    id: "read",
    label: "Read the page",
    note: "Fetched the page and read it end to end — the overview, funding notes, dates, and the application FAQ.",
  },
  {
    id: "type",
    label: "Detected type — Research Opportunity",
    quote:
      "Students spend 10 weeks in an MIT lab with a faculty mentor, ending in a poster session.",
    note: "Nothing here is taught — no syllabus, no coursework, no tuition. That rules out Summer Program. A lab, a mentor and an output is a placement, so it files beside MIT UROP and the UMass Watershed Lab.",
  },
  {
    id: "dates",
    label: "Pulled deadline and cost",
    note: "The deadline sits in the FAQ, not the header — 22 January, with funding listed as a stipend plus housing, which reads as fully funded.",
  },
  {
    id: "dupes",
    label: "Checked your kit for duplicates",
    note: "No overlap. MIT UROP is the nearest neighbour, but UROP is term-time and this is residential summer — they can coexist.",
  },
];

const FIELDS: ExtractedField[] = [
  { label: "Title", value: "MIT Summer Research Program", wide: true },
  { label: "Type", value: "Research Opportunity" },
  { label: "Subject", value: "Research" },
  { label: "Grade", value: "12th" },
  { label: "Deadline", value: "22 January 2027" },
  { label: "Cost", value: "Fully funded" },
  { label: "Format", value: "Residential · 10 weeks" },
  {
    label: "Eligibility",
    value: "",
    wide: true,
    needsInput: true,
    hint: "e.g. Rising seniors, US residents",
  },
];

export const READY_TO_ADD = {
  url: "oge.mit.edu/msrp/",
  tasks: TASKS,
  fields: FIELDS,
};

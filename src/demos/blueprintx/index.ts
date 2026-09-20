/**
 * BlueprintX product demo — an app-within-the-app.
 *
 *   import { BlueprintXDemo } from "@/demos/blueprintx";
 *
 *   // Interactive, authored at 1440×900, transform-scaled into the column:
 *   <BlueprintXDemo scale={0.64} chrome />
 *
 * Screens are pure renders of the reducer's DemoState (state/), content comes
 * from one dataset (data/students.ts, lifted verbatim from the Figma Flows
 * page), and the visual vocabulary lives in parts/. The static Live Meeting
 * frame used by the case study remains available below.
 */

export { BlueprintXDemo } from "./app";
// FRAME lives in a server-safe module — Server Components read it (see frame.ts).
export { FRAME } from "./frame";

/* Live Meeting — now script-driven; see script/meeting-script.ts. */
export { LiveMeeting } from "./screens/live-meeting";
export { MEETING_DURATION, MEETING_SCRIPT } from "./script/meeting-script";
export {
  MEETING_INSIGHTS,
  TRANSCRIPT,
  type MeetingInsight,
  type Utterance,
} from "./data/meeting";

/* Shared frame — kept under its old name for existing callers. */
export { DeviceFrame as AppFrame } from "../_shared/device-frame";

/* Visual vocabulary. */
export {
  Card,
  CardHeader,
  Chevron,
  CollapsedCard,
  Dot,
  Icon,
  LIGHT_SCOPE,
  LivePill,
  Pill,
  TONE,
  type IconName,
  type Tone,
} from "./parts/primitives";
export { Sidebar, type NavGroup, type NavItem } from "./parts/sidebar";
export {
  ActionChips,
  Breadcrumb,
  CommandBar,
  StudentCard,
  TranscriptCard,
  type Action,
  type DockedInsight,
  type Message,
  type Student,
  type TargetSchool,
} from "./parts/meeting";
export { InsightCard, InsightsRail, type Insight } from "./parts/insights";
/** The banded card — one shell, the band's right slot varies by surface. */
export { BandActions, BandCard, UsageCount } from "./parts/band-card";

export { ResourceKit } from "./screens/resource-kit";

/* Dataset — the single source every screen reads. */
export {
  COLLECTIONS,
  RESOURCES,
  RESOURCE_TYPE,
  filterResources,
  getResource,
  type ResourceRecord,
  type ResourceType,
} from "./data/resources";
export {
  getProfile,
  searchStudents,
  STAGE_TONE,
  STATUS_TONE,
  STUDENTS,
  type Note,
  type Stage,
  type StudentProfile,
  type StudentRecord,
} from "./data/students";

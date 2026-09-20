/**
 * BlueprintX — the Resource Kit dataset.
 *
 * Content mirrors the Figma V2 page (`Resource Kit — Flows`, A1c/A2/A3). One
 * array feeds the grid, the list, the collections rail and the detail drawer,
 * so filtering and every count on screen are real rather than three
 * hand-authored states that drift apart.
 *
 * THE KIT IS THE BACK END OF THE LIVE MEETING. Each record carries the
 * `conditions` that make it surface mid-meeting — that pairing is the product
 * claim, and it's why `MEETING_INSIGHTS` and this file describe the same world.
 */

/* ------------------------------------------------------------------- types */

export type ResourceType =
  | "program"
  | "research"
  | "comp"
  | "course"
  | "aid"
  | "profile"
  | "template"
  | "contact";

/**
 * Band treatment per type, measured off the B9 insight card (`Insight /
 * Profile`, 270:11320). Profile / Research / Summer Program are verbatim from
 * the canvas; the rest follow the same construction — the ink hue at ~93%
 * for the fill and ~85% for the hairline.
 */
export const RESOURCE_TYPE: Record<
  ResourceType,
  { label: string; bg: string; line: string; ink: string }
> = {
  program: { label: "Summer Program", bg: "#f5eee7", line: "#e8d9ca", ink: "#96530f" },
  research: { label: "Research Opportunity", bg: "#e9f0eb", line: "#cfded4", ink: "#256b3b" },
  profile: { label: "Past Student", bg: "#eaeef4", line: "#d1d9e7", ink: "#2f5490" },
  comp: { label: "Competition", bg: "#f5eae9", line: "#e7cfcd", ink: "#a93f38" },
  course: { label: "Course", bg: "#eef1e7", line: "#d9e0c9", ink: "#4c6412" },
  aid: { label: "Scholarship", bg: "#f5eaef", line: "#e7cdd9", ink: "#8e2a5b" },
  template: { label: "Template", bg: "#f1f1ef", line: "#dedede", ink: "#4a4a4a" },
  contact: { label: "Contact", bg: "#e8eff2", line: "#cbdde3", ink: "#1c5a70" },
};

export type ResourceRecord = {
  id: string;
  type: ResourceType;
  title: string;
  /** One line under the title — format, length, where. */
  sub: string;
  /** Dot-separated fact line under the rule. */
  facts: string;
  /** Times this has surfaced in a meeting. The band's right slot. */
  uses: number;
  /** List-view column. "Rolling" and "—" are both real answers. */
  deadline: string;
  grade: string;
  /** Free-text the search reads in addition to title and subtitle. */
  subject: string;
};

/* ----------------------------------------------------------------- records */

export const RESOURCES: ResourceRecord[] = [
  { id: "ssp-field", type: "program", title: "SSP Environmental Field Research", sub: "6 weeks · Residential · Rising juniors", facts: "Deadline Feb 1 · Need-based aid · 3 sites", uses: 41, deadline: "Feb 1", grade: "10–11", subject: "Environmental Science fieldwork" },
  { id: "umass-watershed", type: "research", title: "UMass Amherst — Watershed Lab", sub: "High-school research assistant", facts: "Paid · 12 hrs/week · 40 min from Deerfield", uses: 18, deadline: "Rolling", grade: "10–12", subject: "Environmental Science water quality" },
  { id: "cornell-summer", type: "program", title: "Cornell Summer College", sub: "3 weeks · Pre-college", facts: "$6,800 · Aid available · Opens Jan 5", uses: 55, deadline: "Jan 5", grade: "10–12", subject: "Pre-college general" },
  { id: "mit-urop", type: "research", title: "MIT UROP", sub: "Undergraduate research · rolling", facts: "Email Prof. Wong · Comp. Sci · Paid", uses: 63, deadline: "Rolling", grade: "11–12", subject: "Computer Science research" },
  { id: "sjwp", type: "comp", title: "Stockholm Junior Water Prize", sub: "Regional entry · Massachusetts", facts: "Deadline Apr 1 · Individual or team", uses: 12, deadline: "Apr 1", grade: "10–12", subject: "Environmental Science water" },
  { id: "ap-enviro", type: "course", title: "AP Environmental Science", sub: "Offered to juniors at Deerfield", facts: "Selection closes Mar 15 · No prerequisite", uses: 27, deadline: "Mar 15", grade: "10–11", subject: "Environmental Science coursework" },
  { id: "maya-okonjo", type: "profile", title: "Maya Okonjo", sub: "Environmental Science · Brown ’24", facts: "River monitoring in 10th · Same track", uses: 9, deadline: "—", grade: "—", subject: "Environmental Science past student" },
  { id: "coca-cola", type: "aid", title: "Coca-Cola Scholars", sub: "National merit scholarship", facts: "Deadline Oct 31 · $20,000 · Seniors", uses: 31, deadline: "Oct 31", grade: "12", subject: "Scholarship merit" },
  { id: "rsi", type: "program", title: "RSI at MIT", sub: "6 weeks · Free · Most selective", facts: "Teacher rec by Feb · Rising seniors", uses: 22, deadline: "Feb 12", grade: "11", subject: "Research science institute" },
  { id: "recap-email", type: "template", title: "Post-meeting recap email", sub: "Summary for the student and family", facts: "Advisor-owned · 6 merge fields", uses: 26, deadline: "—", grade: "All", subject: "Template communication" },
  { id: "elena-marsh", type: "contact", title: "Dr. Elena Marsh", sub: "Watershed Lab · UMass Amherst", facts: "Replies in ~4 days · 2 placements made", uses: 4, deadline: "—", grade: "—", subject: "Environmental Science contact" },
  { id: "regeneron", type: "comp", title: "Regeneron Science Talent Search", sub: "National research competition", facts: "Deadline Nov 6 · Seniors only", uses: 14, deadline: "Nov 6", grade: "12", subject: "Research competition" },
  { id: "seascape", type: "program", title: "SEA Semester — SEAScape", sub: "3 weeks · Woods Hole, MA", facts: "Deadline Mar 1 · $4,900 · Rising 10–12", uses: 17, deadline: "Mar 1", grade: "10–12", subject: "Environmental Science oceanography" },
  { id: "hutton", type: "program", title: "Hutton Junior Fisheries Biology", sub: "8 weeks · Paid mentorship", facts: "Deadline Feb 14 · $3,000 stipend · Grades 10–12", uses: 23, deadline: "Feb 14", grade: "10–12", subject: "Environmental Science fisheries" },
  { id: "sca", type: "program", title: "Student Conservation Association", sub: "4 weeks · Field crew", facts: "Rolling · Room & board · Ages 15+", uses: 11, deadline: "Rolling", grade: "10–12", subject: "Environmental Science conservation" },
  { id: "earthwatch", type: "program", title: "Earthwatch Student Expeditions", sub: "2 weeks · Costa Rica", facts: "Deadline Apr 15 · Aid available · Rising 10–12", uses: 8, deadline: "Apr 15", grade: "10–12", subject: "Environmental Science ecology" },
  { id: "garcia", type: "program", title: "Garcia Summer Research (Stony Brook)", sub: "7 weeks · Materials science", facts: "Deadline Feb 7 · $4,300 · Rising 11–12", uses: 19, deadline: "Feb 7", grade: "11–12", subject: "Materials science research" },
  { id: "clark-scholars", type: "program", title: "Clark Scholars — Texas Tech", sub: "7 weeks · Stipend · 12 places", facts: "Deadline Feb 20 · Free · Rising seniors", uses: 6, deadline: "Feb 20", grade: "11–12", subject: "Research general" },
  { id: "noaa-hollings", type: "research", title: "NOAA Hollings Mentorship", sub: "Summer placement · coastal labs", facts: "Deadline Jan 31 · Paid · Grades 11–12", uses: 13, deadline: "Jan 31", grade: "11–12", subject: "Environmental Science oceanography" },
  { id: "smith-hs-lab", type: "research", title: "Smith College — Ecology Lab", sub: "Term-time assistant · 2 places", facts: "Rolling · Unpaid · 25 min from campus", uses: 5, deadline: "Rolling", grade: "10–12", subject: "Environmental Science ecology" },
  { id: "envirothon", type: "comp", title: "NCF Envirothon", sub: "Team competition · state qualifier", facts: "Registration Dec 15 · Teams of 5", uses: 10, deadline: "Dec 15", grade: "9–12", subject: "Environmental Science team competition" },
  { id: "ap-bio", type: "course", title: "AP Biology", sub: "Offered to juniors at Deerfield", facts: "Selection closes Mar 15 · Chem prerequisite", uses: 21, deadline: "Mar 15", grade: "11–12", subject: "Biology coursework" },
  { id: "marine-elective", type: "course", title: "Marine Science elective", sub: "Spring term · Deerfield", facts: "Selection closes Mar 15 · Sophomores welcome", uses: 7, deadline: "Mar 15", grade: "10–12", subject: "Environmental Science coursework" },
  { id: "jack-kent", type: "aid", title: "Jack Kent Cooke Young Scholars", sub: "Need-based · 7th–8th entry", facts: "Deadline Apr 20 · Full support to college", uses: 15, deadline: "Apr 20", grade: "9", subject: "Scholarship need-based" },
  { id: "theo-lindqvist", type: "profile", title: "Theo Lindqvist", sub: "Environmental Engineering · Vermont ’25", facts: "Same fieldwork route · aid-sensitive family", uses: 3, deadline: "—", grade: "—", subject: "Environmental Science past student" },

  { id: "cosmos-uc", type: "program", title: "COSMOS — UC Santa Cruz", sub: "4 weeks · Residential · STEM clusters", facts: "Deadline Feb 6 · $4,970 · Aid available", uses: 38, deadline: "Feb 6", grade: "9–12", subject: "Engineering marine science cluster" },
  { id: "bu-rise", type: "program", title: "Boston University RISE", sub: "6 weeks · Research track", facts: "Deadline Feb 14 · $3,500 · Rising seniors", uses: 29, deadline: "Feb 14", grade: "11", subject: "Biology research practicum" },
  { id: "simons-summer", type: "program", title: "Simons Summer Research", sub: "7 weeks · Stony Brook labs", facts: "Deadline Feb 7 · Stipend · Rising seniors", uses: 33, deadline: "Feb 7", grade: "11", subject: "Physics biology research" },
  { id: "jax-ssp", type: "program", title: "Jackson Laboratory SSP", sub: "10 weeks · Genetics · Residential", facts: "Deadline Jan 29 · $6,500 stipend", uses: 21, deadline: "Jan 29", grade: "11–12", subject: "Biology genetics genomics" },
  { id: "stanford-simr", type: "program", title: "Stanford SIMR", sub: "8 weeks · Medical research", facts: "Deadline Feb 22 · Stipend up to $7,500", uses: 44, deadline: "Feb 22", grade: "11–12", subject: "Biology medicine immunology" },
  { id: "penn-mtsi", type: "program", title: "Penn M&TSI", sub: "3 weeks · Tech + business", facts: "Deadline Feb 1 · $8,000 · Aid available", uses: 17, deadline: "Feb 1", grade: "11", subject: "Business engineering entrepreneurship" },
  { id: "mites-summer", type: "program", title: "MITES Summer at MIT", sub: "6 weeks · Free · Residential", facts: "Deadline Feb 1 · Rising seniors · Highly selective", uses: 41, deadline: "Feb 1", grade: "11", subject: "Engineering Computer Science STEM" },
  { id: "beaverworks", type: "program", title: "MIT Beaver Works Summer", sub: "4 weeks · Project-based", facts: "Deadline Mar 31 · Free · CS prerequisite course", uses: 26, deadline: "Mar 31", grade: "11–12", subject: "Computer Science autonomous systems" },
  { id: "promys", type: "program", title: "PROMYS — Boston University", sub: "6 weeks · Number theory", facts: "Deadline Mar 15 · $6,000 · Aid to $0", uses: 19, deadline: "Mar 15", grade: "10–12", subject: "Mathematics number theory proofs" },
  { id: "ross-math", type: "program", title: "Ross Mathematics Program", sub: "6 weeks · Residential", facts: "Deadline Mar 15 · $7,000 · Aid available", uses: 16, deadline: "Mar 15", grade: "10–12", subject: "Mathematics number theory" },
  { id: "sumac", type: "program", title: "Stanford SUMaC", sub: "4 weeks · Online or residential", facts: "Deadline Feb 3 · $3,550–$8,250", uses: 22, deadline: "Feb 3", grade: "10–11", subject: "Mathematics abstract algebra" },
  { id: "mathcamp", type: "program", title: "Canada/USA Mathcamp", sub: "5 weeks · Roving campus", facts: "Deadline Mar 6 · $5,500 · Need-blind aid", uses: 14, deadline: "Mar 6", grade: "9–12", subject: "Mathematics problem solving" },
  { id: "tasp-tass", type: "program", title: "Telluride TASS", sub: "6 weeks · Free · Seminar-based", facts: "Deadline Jan 3 · Critical theory tracks", uses: 11, deadline: "Jan 3", grade: "10–11", subject: "Writing humanities seminar" },
  { id: "iowa-writers", type: "program", title: "Iowa Young Writers' Studio", sub: "2 weeks · Residential", facts: "Deadline Feb 3 · $2,500 · Aid available", uses: 13, deadline: "Feb 3", grade: "10–12", subject: "Writing creative fiction poetry" },
  { id: "kenyon-writers", type: "program", title: "Kenyon Review Young Writers", sub: "2 weeks · Residential", facts: "Deadline Mar 1 · $2,675 · Aid available", uses: 9, deadline: "Mar 1", grade: "10–12", subject: "Writing workshop" },
  { id: "interlochen", type: "program", title: "Interlochen Arts Camp", sub: "3–6 weeks · Conservatory", facts: "Deadline rolling · Aid available", uses: 7, deadline: "Rolling", grade: "9–12", subject: "Art music theatre" },
  { id: "cmu-sams", type: "program", title: "CMU SAMS", sub: "6 weeks · Free · STEM access", facts: "Deadline Mar 1 · Rising seniors", uses: 24, deadline: "Mar 1", grade: "11", subject: "Engineering Computer Science math" },
  { id: "njgss", type: "program", title: "NJ Governor's School — Sciences", sub: "3 weeks · Free · Nomination", facts: "School nomination by Dec 18", uses: 8, deadline: "Dec 18", grade: "11", subject: "Physics chemistry research" },
  { id: "gwc-sip", type: "program", title: "Girls Who Code SIP", sub: "2 weeks · Virtual · Free", facts: "Deadline Apr 11 · Grades 9–11", uses: 27, deadline: "Apr 11", grade: "9–11", subject: "Computer Science web development" },
  { id: "ai4all", type: "program", title: "Stanford AI4ALL", sub: "3 weeks · No cost", facts: "Deadline Feb 27 · Application only", uses: 31, deadline: "Feb 27", grade: "10–11", subject: "Computer Science AI ethics" },
  { id: "launchx", type: "program", title: "LaunchX Entrepreneurship", sub: "4 weeks · Startup teams", facts: "Deadline Feb 12 · $6,900 · Aid available", uses: 12, deadline: "Feb 12", grade: "10–12", subject: "Business entrepreneurship startup" },
  { id: "wharton-gyp", type: "program", title: "Wharton Global Youth — LBW", sub: "4 weeks · Residential", facts: "Deadline Apr 2 · $10,499 · Aid limited", uses: 15, deadline: "Apr 2", grade: "11", subject: "Business finance leadership" },
  { id: "yygs", type: "program", title: "Yale Young Global Scholars", sub: "2 weeks · Residential", facts: "Deadline Jan 10 · $6,500 · Need-based aid", uses: 36, deadline: "Jan 10", grade: "10–11", subject: "Humanities politics economics" },
  { id: "nih-histep", type: "program", title: "NIH HiSTEP", sub: "5 weeks · Paid · Bethesda", facts: "Deadline Feb 2 · $2,500+ · First-gen focus", uses: 18, deadline: "Feb 2", grade: "11", subject: "Biology public health" },
  { id: "boa-leaders", type: "program", title: "Bank of America Student Leaders", sub: "8 weeks · Paid internship", facts: "Deadline Jan 15 · Nonprofit placement", uses: 10, deadline: "Jan 15", grade: "11–12", subject: "Business community leadership" },
  { id: "earthwatch-teen", type: "program", title: "Earthwatch Teen Expeditions", sub: "2 weeks · Field research", facts: "Deadline Apr 15 · Aid available", uses: 8, deadline: "Apr 15", grade: "10–12", subject: "Environmental Science ecology field" },
  { id: "ssp-astro", type: "program", title: "SSP — Astrophysics", sub: "6 weeks · Residential", facts: "Deadline Feb 1 · Orbit determination project", uses: 23, deadline: "Feb 1", grade: "10–11", subject: "Physics astronomy astrophysics" },
  { id: "uchicago-ysp", type: "program", title: "UChicago Summer Immersion", sub: "3 weeks · Residential", facts: "Deadline Mar 20 · $7,500 · Aid available", uses: 13, deadline: "Mar 20", grade: "9–12", subject: "Humanities economics writing" },
  { id: "brown-precollege", type: "program", title: "Brown Pre-College", sub: "1–4 weeks · 300+ courses", facts: "Rolling · $3,000–$8,000 · Aid available", uses: 20, deadline: "Rolling", grade: "9–12", subject: "Humanities STEM electives" },
  { id: "smith-ssc", type: "program", title: "Smith Summer Science & Engineering", sub: "4 weeks · Residential", facts: "Deadline May 1 · $5,000 · Aid available", uses: 9, deadline: "May 1", grade: "9–12", subject: "Engineering biology chemistry" },
  { id: "uw-ysp-genome", type: "program", title: "UW Genome Sciences YSP", sub: "1 week · Free · Day program", facts: "Deadline Mar 24 · Seattle area", uses: 6, deadline: "Mar 24", grade: "10–12", subject: "Biology genomics" },
  { id: "hutchins-swim", type: "program", title: "Hutchins Program — Debate", sub: "4 weeks · Residential", facts: "Deadline Feb 28 · $4,200 · Aid available", uses: 5, deadline: "Feb 28", grade: "10–11", subject: "Writing debate rhetoric" },
  { id: "rockefeller-ssrp", type: "research", title: "Rockefeller SSRP", sub: "7 weeks · NYC labs", facts: "Deadline Jan 8 · Stipend · Highly selective", uses: 28, deadline: "Jan 8", grade: "11–12", subject: "Biology neuroscience lab" },
  { id: "nasa-sees", type: "research", title: "NASA SEES Internship", sub: "Summer · UT Austin + remote", facts: "Deadline Feb 24 · Earth science data", uses: 25, deadline: "Feb 24", grade: "10–11", subject: "Physics earth science satellite data" },
  { id: "fredhutch-ship", type: "research", title: "Fred Hutch SHIP", sub: "8 weeks · Paid · Seattle", facts: "Deadline Mar 3 · Cancer research", uses: 12, deadline: "Mar 3", grade: "11–12", subject: "Biology cancer research" },
  { id: "mdanderson-hssrp", type: "research", title: "MD Anderson HSSRP", sub: "10 weeks · Paid · Houston", facts: "Deadline Jan 6 · Age 18 by June", uses: 9, deadline: "Jan 6", grade: "12", subject: "Biology oncology research" },
  { id: "broad-scholars", type: "research", title: "Broad Summer Scholars", sub: "6 weeks · Stipend · Cambridge", facts: "Deadline Jan 14 · Genomics focus", uses: 19, deadline: "Jan 14", grade: "11", subject: "Biology genomics computational" },
  { id: "lincoln-lab", type: "research", title: "MIT Lincoln Lab — LLRISE", sub: "2 weeks · Free · Radar build", facts: "Deadline Mar 31 · Rising seniors", uses: 14, deadline: "Mar 31", grade: "11", subject: "Engineering physics radar" },
  { id: "whoi-guest", type: "research", title: "WHOI Guest Student", sub: "Term-time · Woods Hole", facts: "Rolling · Faculty sponsor needed", uses: 4, deadline: "Rolling", grade: "11–12", subject: "Environmental Science oceanography" },
  { id: "scripps-surf", type: "research", title: "Scripps SURF", sub: "10 weeks · Paid · La Jolla", facts: "Deadline Feb 9 · Ocean science", uses: 7, deadline: "Feb 9", grade: "12", subject: "Environmental Science ocean biology" },
  { id: "cityofhope-eugene", type: "research", title: "City of Hope — Eugene Roberts", sub: "10 weeks · $4,000 · LA area", facts: "Deadline Mar 12 · Age 16+", uses: 11, deadline: "Mar 12", grade: "11–12", subject: "Biology medical research" },
  { id: "stonybrook-garcia", type: "research", title: "Garcia Polymer Research", sub: "7 weeks · Stony Brook", facts: "Deadline Feb 7 · $4,300 · Publication track", uses: 19, deadline: "Feb 7", grade: "11–12", subject: "Materials science polymers" },
  { id: "ucsb-sra", type: "research", title: "UCSB Research Mentorship", sub: "6 weeks · Residential", facts: "Deadline Mar 17 · $12,474 · Aid available", uses: 16, deadline: "Mar 17", grade: "10–11", subject: "Engineering physics interdisciplinary" },
  { id: "bnl-hsrp", type: "research", title: "Brookhaven Lab HSRP", sub: "6 weeks · Unpaid · Long Island", facts: "Deadline Feb 28 · DOE lab access", uses: 8, deadline: "Feb 28", grade: "11", subject: "Physics particle accelerator" },
  { id: "tufts-teamlab", type: "research", title: "Tufts Neuro Teen Lab", sub: "Term-time · 6 hrs/week", facts: "Rolling · Boston area · Unpaid", uses: 5, deadline: "Rolling", grade: "10–12", subject: "Biology neuroscience" },
  { id: "mgh-youth", type: "research", title: "MGH Youth Scholars", sub: "Year-round · Paid · Boston", facts: "Deadline May 30 · Boston residents", uses: 6, deadline: "May 30", grade: "10–12", subject: "Biology medicine hospital" },
  { id: "amherst-ecology", type: "research", title: "Amherst College — Field Ecology", sub: "Term-time assistant", facts: "Rolling · 20 min away · Unpaid", uses: 3, deadline: "Rolling", grade: "11–12", subject: "Environmental Science ecology field" },
  { id: "hmc-cs-lab", type: "research", title: "Harvey Mudd CS REU shadow", sub: "4 weeks · Remote", facts: "Deadline Apr 5 · CS coursework needed", uses: 7, deadline: "Apr 5", grade: "11–12", subject: "Computer Science algorithms" },
  { id: "regeneron-isef", type: "comp", title: "Regeneron ISEF", sub: "International fair · via regionals", facts: "Regional deadlines Dec–Feb", uses: 34, deadline: "Dec 15", grade: "9–12", subject: "Research all sciences fair" },
  { id: "conrad-challenge", type: "comp", title: "Conrad Challenge", sub: "Team innovation · 2–5 students", facts: "Deadline Nov 1 · Commercialization round", uses: 9, deadline: "Nov 1", grade: "9–12", subject: "Business engineering innovation" },
  { id: "diamond-challenge", type: "comp", title: "Diamond Challenge", sub: "Startup pitch · $100k pool", facts: "Deadline Jan 10 · Teams of 2–4", uses: 8, deadline: "Jan 10", grade: "9–12", subject: "Business entrepreneurship pitch" },
  { id: "usabo", type: "comp", title: "USA Biolympiad", sub: "Exam track · school-based", facts: "Open exam Feb 3 · Camp for top 20", uses: 15, deadline: "Feb 3", grade: "9–12", subject: "Biology olympiad exam" },
  { id: "usnco", type: "comp", title: "US Chemistry Olympiad", sub: "Exam track · local sections", facts: "Local exam Mar 8 · Study group forming", uses: 12, deadline: "Mar 8", grade: "9–12", subject: "Chemistry olympiad exam" },
  { id: "fma-usapho", type: "comp", title: "F=ma → USAPhO", sub: "Physics olympiad track", facts: "F=ma exam Feb 12 · AP Physics helps", uses: 13, deadline: "Feb 12", grade: "9–12", subject: "Physics olympiad exam" },
  { id: "amc-aime", type: "comp", title: "AMC 10/12 → AIME", sub: "Math olympiad track", facts: "AMC Nov 8 · School registers", uses: 30, deadline: "Nov 8", grade: "9–12", subject: "Mathematics olympiad exam" },
  { id: "first-robotics", type: "comp", title: "FIRST Robotics — Team 2876", sub: "Build season Jan–Apr", facts: "Kickoff Jan 4 · No experience needed", uses: 22, deadline: "Jan 4", grade: "9–12", subject: "Engineering robotics team" },
  { id: "vex-worlds", type: "comp", title: "VEX Robotics", sub: "Regional → Worlds", facts: "Season opens Sep · Team slots limited", uses: 10, deadline: "Sep 15", grade: "9–12", subject: "Engineering robotics" },
  { id: "congress-app", type: "comp", title: "Congressional App Challenge", sub: "District coding contest", facts: "Deadline Oct 30 · Solo or team", uses: 11, deadline: "Oct 30", grade: "9–12", subject: "Computer Science app development" },
  { id: "nhd", type: "comp", title: "National History Day", sub: "Research + exhibit", facts: "School round Feb · Theme: Frontiers", uses: 7, deadline: "Feb 20", grade: "9–12", subject: "Humanities history research" },
  { id: "scholastic-aw", type: "comp", title: "Scholastic Art & Writing", sub: "Portfolio awards", facts: "Regional deadlines Dec · Gold Key track", uses: 17, deadline: "Dec 1", grade: "9–12", subject: "Writing art portfolio" },
  { id: "deca-icdc", type: "comp", title: "DECA — ICDC track", sub: "Role-play + written events", facts: "Chapter dues Oct 15 · States in Feb", uses: 14, deadline: "Oct 15", grade: "9–12", subject: "Business marketing roleplay" },
  { id: "ecybermission", type: "comp", title: "eCYBERMISSION", sub: "STEM team challenge", facts: "Deadline Feb 25 · Army-sponsored · Free", uses: 5, deadline: "Feb 25", grade: "9", subject: "Engineering STEM team" },
  { id: "exploravision", type: "comp", title: "Toshiba ExploraVision", sub: "Future tech concept", facts: "Deadline Jan 31 · Teacher-sponsored", uses: 6, deadline: "Jan 31", grade: "9–12", subject: "Engineering concept design" },
  { id: "stockholm-jwp", type: "comp", title: "Stockholm Junior Water Prize — Nationals", sub: "National round", facts: "State win required · June nationals", uses: 4, deadline: "Jun 1", grade: "10–12", subject: "Environmental Science water research" },
  { id: "ap-chem", type: "course", title: "AP Chemistry", sub: "Offered to juniors at Deerfield", facts: "Selection closes Mar 15 · Bio prerequisite", uses: 25, deadline: "Mar 15", grade: "11–12", subject: "Chemistry coursework" },
  { id: "ap-physics-c", type: "course", title: "AP Physics C — Mechanics", sub: "Calculus co-requisite", facts: "Selection closes Mar 15 · Seniors priority", uses: 18, deadline: "Mar 15", grade: "12", subject: "Physics coursework calculus" },
  { id: "ap-cs-a", type: "course", title: "AP Computer Science A", sub: "Java · no prerequisite", facts: "Selection closes Mar 15 · Two sections", uses: 29, deadline: "Mar 15", grade: "10–12", subject: "Computer Science coursework Java" },
  { id: "ap-stats", type: "course", title: "AP Statistics", sub: "Alg II prerequisite", facts: "Selection closes Mar 15", uses: 21, deadline: "Mar 15", grade: "11–12", subject: "Mathematics statistics coursework" },
  { id: "ap-seminar", type: "course", title: "AP Seminar", sub: "Capstone year one", facts: "Selection closes Mar 15 · Sophomores welcome", uses: 9, deadline: "Mar 15", grade: "10–11", subject: "Writing research capstone" },
  { id: "multivar-cc", type: "course", title: "Multivariable Calc — GCC dual-enroll", sub: "Community college evening", facts: "Enroll by Aug 20 · BC 5 required", uses: 8, deadline: "Aug 20", grade: "12", subject: "Mathematics calculus dual enrollment" },
  { id: "honors-anatomy", type: "course", title: "Honors Anatomy & Physiology", sub: "Lab-heavy elective", facts: "Selection closes Mar 15 · Juniors+", uses: 12, deadline: "Mar 15", grade: "11–12", subject: "Biology anatomy coursework" },
  { id: "astronomy-elective", type: "course", title: "Astronomy elective", sub: "Fall term · observatory nights", facts: "Selection closes Mar 15 · All grades", uses: 10, deadline: "Mar 15", grade: "9–12", subject: "Physics astronomy elective" },
  { id: "data-science-elective", type: "course", title: "Intro Data Science", sub: "Python · spring term", facts: "Selection closes Mar 15 · Stats co-req", uses: 15, deadline: "Mar 15", grade: "10–12", subject: "Computer Science data Python" },
  { id: "ib-ess", type: "course", title: "IB Environmental Systems", sub: "Two-year SL course", facts: "Selection closes Mar 15 · 10th entry", uses: 11, deadline: "Mar 15", grade: "10–11", subject: "Environmental Science IB coursework" },
  { id: "creative-writing-sem", type: "course", title: "Creative Writing Seminar", sub: "Portfolio by application", facts: "Submit portfolio by Apr 5", uses: 7, deadline: "Apr 5", grade: "10–12", subject: "Writing fiction seminar" },
  { id: "econ-honors", type: "course", title: "Honors Economics", sub: "Micro + macro survey", facts: "Selection closes Mar 15 · Seniors", uses: 13, deadline: "Mar 15", grade: "12", subject: "Business economics coursework" },
  { id: "arabic-1", type: "course", title: "Arabic I", sub: "New language track", facts: "Selection closes Mar 15 · All grades", uses: 4, deadline: "Mar 15", grade: "9–12", subject: "Humanities language" },
  { id: "questbridge-prep", type: "aid", title: "QuestBridge College Prep Scholars", sub: "Junior-year program", facts: "Deadline Mar 19 · Low-income · Full rides later", uses: 26, deadline: "Mar 19", grade: "11", subject: "Scholarship access low-income" },
  { id: "gates-scholarship", type: "aid", title: "The Gates Scholarship", sub: "Full cost of attendance", facts: "Deadline Sep 15 · Pell-eligible seniors", uses: 20, deadline: "Sep 15", grade: "12", subject: "Scholarship full ride" },
  { id: "horatio-alger", type: "aid", title: "Horatio Alger Scholarship", sub: "$25,000 · adversity focus", facts: "Deadline Oct 25 · 2.0+ GPA", uses: 13, deadline: "Oct 25", grade: "11", subject: "Scholarship need adversity" },
  { id: "elks-mvs", type: "aid", title: "Elks Most Valuable Student", sub: "$4,000–$50,000", facts: "Deadline Nov 12 · Leadership weighted", uses: 11, deadline: "Nov 12", grade: "12", subject: "Scholarship leadership merit" },
  { id: "cameron-impact", type: "aid", title: "Cameron Impact Scholarship", sub: "Full four-year", facts: "Deadline May 23 · 3.7+ GPA juniors", uses: 9, deadline: "May 23", grade: "11", subject: "Scholarship merit service" },
  { id: "amazon-fe", type: "aid", title: "Amazon Future Engineer", sub: "$40,000 + internship", facts: "Deadline Jan 30 · CS seniors", uses: 16, deadline: "Jan 30", grade: "12", subject: "Scholarship Computer Science" },
  { id: "ron-brown", type: "aid", title: "Ron Brown Scholar Program", sub: "$40,000 · Black seniors", facts: "Deadline Dec 15 · Service weighted", uses: 12, deadline: "Dec 15", grade: "12", subject: "Scholarship service leadership" },
  { id: "dell-scholars", type: "aid", title: "Dell Scholars", sub: "$20,000 + support", facts: "Deadline Dec 1 · College-readiness program req", uses: 10, deadline: "Dec 1", grade: "12", subject: "Scholarship persistence" },
  { id: "davidson-fellows", type: "aid", title: "Davidson Fellows", sub: "$10k–$50k · project-based", facts: "Deadline Feb 11 · Significant work required", uses: 6, deadline: "Feb 11", grade: "9–12", subject: "Scholarship research project" },
  { id: "national-merit", type: "aid", title: "National Merit track", sub: "PSAT-qualified", facts: "PSAT Oct 14 · Semifinalist cutoffs vary", uses: 35, deadline: "Oct 14", grade: "11", subject: "Scholarship PSAT merit" },
  { id: "coolidge", type: "aid", title: "Coolidge Scholarship", sub: "Full ride · any major", facts: "Deadline Jan 21 · Juniors apply", uses: 8, deadline: "Jan 21", grade: "11", subject: "Scholarship merit full ride" },
  { id: "theo-lindqvist-2", type: "profile", title: "Priya Shah", sub: "Biomedical Eng · Johns Hopkins ’25", facts: "SIMR alum · research essay spine", uses: 7, deadline: "—", grade: "—", subject: "Biology engineering past student" },
  { id: "marcus-oduya", type: "profile", title: "Marcus Oduya", sub: "Computer Science · Georgia Tech ’26", facts: "MITES → AP CS A TA · first-gen", uses: 11, deadline: "—", grade: "—", subject: "Computer Science past student" },
  { id: "elena-rios", type: "profile", title: "Elena Rios", sub: "Environmental Policy · Middlebury ’24", facts: "Envirothon captain · policy internship route", uses: 6, deadline: "—", grade: "—", subject: "Environmental Science policy past student" },
  { id: "sam-whitfield", type: "profile", title: "Sam Whitfield", sub: "Mathematics · UChicago ’25", facts: "PROMYS twice · Putnam as freshman", uses: 9, deadline: "—", grade: "—", subject: "Mathematics past student" },
  { id: "aisha-bello", type: "profile", title: "Aisha Bello", sub: "English · Kenyon ’24", facts: "Kenyon workshop → Gold Key portfolio", uses: 5, deadline: "—", grade: "—", subject: "Writing past student" },
  { id: "derek-yamamoto", type: "profile", title: "Derek Yamamoto", sub: "Physics · UC Berkeley ’26", facts: "SSP astro · F=ma camp", uses: 8, deadline: "—", grade: "—", subject: "Physics past student" },
  { id: "noor-hassan", type: "profile", title: "Noor Hassan", sub: "Economics · Penn ’25", facts: "LaunchX team lead · DECA nationals", uses: 6, deadline: "—", grade: "—", subject: "Business economics past student" },
  { id: "jade-collins", type: "profile", title: "Jade Collins", sub: "Marine Biology · U Miami ’24", facts: "Sea camp → WHOI guest student", uses: 4, deadline: "—", grade: "—", subject: "Environmental Science marine past student" },
  { id: "aid-onepager", type: "template", title: "Financial aid one-pager", sub: "Parent-facing summary", facts: "Advisor-owned · 4 merge fields", uses: 18, deadline: "—", grade: "All", subject: "Template communication aid" },
  { id: "rec-request", type: "template", title: "Recommendation request email", sub: "Teacher outreach · junior spring", facts: "Advisor-owned · tone: warm", uses: 22, deadline: "—", grade: "All", subject: "Template communication recommendation" },
  { id: "deadline-reminder", type: "template", title: "Deadline reminder sequence", sub: "3 texts + 1 email", facts: "Advisor-owned · auto-fills dates", uses: 15, deadline: "—", grade: "All", subject: "Template communication reminders" },
  { id: "college-list-sheet", type: "template", title: "College list one-pager", sub: "Reach/target/safety table", facts: "Advisor-owned · exports to PDF", uses: 19, deadline: "—", grade: "All", subject: "Template list planning" },
  { id: "interview-prep", type: "template", title: "Interview prep sheet", sub: "Common questions + notes", facts: "Advisor-owned · student-facing", uses: 9, deadline: "—", grade: "All", subject: "Template interview" },
  { id: "visit-itinerary", type: "template", title: "Campus visit itinerary", sub: "Day plan + questions to ask", facts: "Advisor-owned · 6 merge fields", uses: 7, deadline: "—", grade: "All", subject: "Template visit planning" },
  { id: "prof-wong", type: "contact", title: "Prof. J. Wong", sub: "EECS · MIT", facts: "UROP contact · replies in ~1 week", uses: 8, deadline: "—", grade: "—", subject: "Computer Science contact MIT" },
  { id: "dr-ferreira", type: "contact", title: "Dr. Ana Ferreira", sub: "Marine Science · WHOI", facts: "Guest-student sponsor · 2 placements", uses: 5, deadline: "—", grade: "—", subject: "Environmental Science contact oceanography" },
  { id: "coach-daniels", type: "contact", title: "Coach R. Daniels", sub: "FIRST 2876 mentor", facts: "Weeknight builds · welcomes rookies", uses: 6, deadline: "—", grade: "—", subject: "Engineering contact robotics" },
  { id: "ms-okafor", type: "contact", title: "Ms. L. Okafor", sub: "Admissions · UMass Amherst", facts: "Regional rep · fall visit scheduled", uses: 7, deadline: "—", grade: "—", subject: "Contact admissions" },
  { id: "dr-klein", type: "contact", title: "Dr. S. Klein", sub: "Chemistry · Smith College", facts: "Lab shadow days · spring only", uses: 3, deadline: "—", grade: "—", subject: "Chemistry contact lab" },
  { id: "mr-alvarez", type: "contact", title: "Mr. T. Alvarez", sub: "Financial aid office · Vermont", facts: "Aid-night speaker · parent Q&A", uses: 4, deadline: "—", grade: "—", subject: "Contact financial aid" },
];

/* ------------------------------------------------------------ the addition */

/**
 * The record Flow C adds. NOT in `RESOURCES` — the kit genuinely gains a card
 * when the advisor saves it. The take is shot against the real page at
 * https://oge.mit.edu/msrp/ (the URL the advisor pastes on camera), so the
 * facts here mirror what that page actually says: 10 weeks, June 8 – Aug 8,
 * residential, research with MIT faculty, closing poster session.
 */
export const KIT_ADDITION: ResourceRecord = {
  id: "mit-msrp",
  type: "research",
  title: "MIT Summer Research Program",
  sub: "10 weeks · Residential · Funded",
  facts: "June 8 – Aug 8 · Research with MIT faculty · Poster session",
  uses: 0,
  deadline: "Jan 22",
  grade: "12",
  subject: "Research general MIT graduate readiness",
};

/** What the extraction pass "reads" off the page, in the order the modal
 *  shows the steps. Content, not timing — timing lives in the script. */
export const EXTRACTION = {
  url: "oge.mit.edu/msrp/",
  steps: [
    "Read the page",
    "Detected type — Research Opportunity",
    "Pulling dates, funding and eligibility",
    "Matching against your students",
  ],
  suggestedRules: [
    "Interest · Research",
    "Grade 12 · college-bound",
    "Topic · summer planning",
  ],
  matchNote: "Would have matched 8 students this term.",
  toast: "Now surfacing for 8 students · Research · 12th",
} as const;

/* ------------------------------------------------------------- collections */

export type Collection = {
  id: string;
  label: string;
  /** null means "everything" — the rail's first row. */
  type: ResourceType | null;
};

export const COLLECTIONS: Collection[] = [
  { id: "all", label: "All resources", type: null },
  { id: "program", label: "Summer programs", type: "program" },
  { id: "research", label: "Research", type: "research" },
  { id: "comp", label: "Competitions", type: "comp" },
  { id: "course", label: "Courses", type: "course" },
  { id: "aid", label: "Scholarships", type: "aid" },
  { id: "profile", label: "Past students", type: "profile" },
  { id: "template", label: "Templates", type: "template" },
];

/** Rail counts are derived, never typed in — the number matches what filtering returns. */
export function collectionCount(collection: Collection): number {
  return collection.type === null
    ? RESOURCES.length
    : RESOURCES.filter((r) => r.type === collection.type).length;
}

export const MAINTENANCE = [
  { id: "review", label: "Needs review", count: 6 },
  { id: "shared", label: "Shared with team", count: 41 },
] as const;

/* ----------------------------------------------------------- filter menus */

/** Grade dropdown. Values are the grade a student is IN, not a range. */
export const GRADE_OPTIONS = ["9th", "10th", "11th", "12th"] as const;

/** Subject dropdown — the subjects the dataset actually contains. */
export const SUBJECT_OPTIONS = [
  "Environmental Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Computer Science",
  "Engineering",
  "Writing",
] as const;

/**
 * Does a record's grade range cover a selected grade? Ranges are authored
 * strings — "10–12", "11", "All", "—" — so this parses rather than guesses.
 * "—" (past students, contacts) never matches a specific grade: filtering to
 * 10th means "things a 10th-grader can act on".
 */
export function gradeCovers(range: string, grade: string | null): boolean {
  if (!grade) return true;
  if (range === "All") return true;
  if (range === "—") return false;
  const g = parseInt(grade, 10);
  const parts = range.split("–").map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return false;
  return parts.length === 1
    ? parts[0] === g
    : g >= parts[0] && g <= parts[1];
}

export function subjectCovers(
  subject: string,
  selected: string | null,
): boolean {
  if (!selected) return true;
  return subject.toLowerCase().includes(selected.toLowerCase());
}

/* ---------------------------------------------------------------- querying */

/**
 * Collection first, then a case-insensitive substring over the text an
 * advisor would actually type: title, subtitle, fact line and subject tags.
 * "environ" reaches the fieldwork programs through `subject`, which is the
 * whole reason that field exists.
 */
export function filterResources(
  query: string,
  collectionId: string,
  grade: string | null = null,
  subject: string | null = null,
): ResourceRecord[] {
  return RESOURCES.filter((r) =>
    matchesFilter(r, query, collectionId, grade, subject),
  );
}

function matchesQuery(r: ResourceRecord, q: string): boolean {
  return `${r.title} ${r.sub} ${r.facts} ${r.subject}`
    .toLowerCase()
    .includes(q);
}

/** Every active filter, one record — the grid, the count line and the
 *  just-added KIT_ADDITION all go through this same predicate. */
export function matchesFilter(
  record: ResourceRecord,
  query: string,
  collectionId: string,
  grade: string | null = null,
  subject: string | null = null,
): boolean {
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  if (collection?.type && record.type !== collection.type) return false;
  if (!gradeCovers(record.grade, grade)) return false;
  if (!subjectCovers(record.subject, subject)) return false;
  const q = query.trim().toLowerCase();
  return !q || matchesQuery(record, q);
}

export function getResource(id: string): ResourceRecord | undefined {
  if (id === KIT_ADDITION.id) return KIT_ADDITION;
  return RESOURCES.find((r) => r.id === id);
}

/* ------------------------------------------------------------------ detail */

export type ResourceDetail = {
  /** Label/value rows in the drawer. */
  facts: [string, string][];
  /** What makes this surface mid-meeting — the link back to Live Meeting. */
  conditions: string[];
  matched: string;
  /** Initials of students it has been used with. */
  usedWith: string[];
  others: number;
};

const DETAILS: Record<string, ResourceDetail> = {
  "ssp-field": {
    facts: [
      ["Deadline", "Feb 1 · applications open now"],
      ["Cost", "$7,400 · need-based aid available"],
      ["Eligibility", "Rising juniors · 3.3 GPA · one science course"],
      ["Location", "Amherst MA · Socorro NM · Boulder CO"],
      ["Commitment", "6 weeks residential · June 22 – Aug 2"],
    ],
    conditions: [
      "Interest · Environmental Science",
      "Grade 9–10",
      "Topic · summer planning",
      "Fieldwork over lab",
    ],
    matched: "Surfaced in 41 meetings · added to 6 students this term",
    usedWith: ["NW", "MB", "RP", "FN"],
    others: 2,
  },
};

/**
 * Only SSP is fully authored — it's the record the flow opens. Everything else
 * gets a detail derived from its own row, so a stray click never renders an
 * empty drawer.
 */
export function getDetail(record: ResourceRecord): ResourceDetail {
  const authored = DETAILS[record.id];
  if (authored) return authored;
  return {
    facts: [
      ["Deadline", record.deadline === "—" ? "No deadline" : record.deadline],
      ["Grade", record.grade === "—" ? "Any" : record.grade],
      ["Details", record.facts],
      ["Type", RESOURCE_TYPE[record.type].label],
    ],
    conditions: [`Subject · ${record.subject.split(" ").slice(0, 2).join(" ")}`],
    matched: `Surfaced in ${record.uses} meetings`,
    usedWith: [],
    others: 0,
  };
}

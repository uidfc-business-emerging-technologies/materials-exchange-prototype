// Invented sample content for the prototype. All people and most institutions are fictional.

export type DisciplineKey = "fin" | "audit" | "tax" | "ais" | "mgmt" | "data" | "emtech" | "other";
export type IncludeKey = "dataset" | "note" | "sol";
export type LicenseName = "CC BY 4.0" | "CC BY-NC 4.0" | "CC BY-NC-SA 4.0";
export type ResourceType = "Case" | "Data exercise" | "Teaching module";

/** Lucide icon names used by data rows; components map these to lucide-react icons. */
export type FileIconName = "file-text" | "file-spreadsheet" | "book-open" | "key-round" | "file-code";

export interface Include {
  key: IncludeKey;
  label: string;
  icon: "database" | "book-open" | "key-round";
  /** True when the file kind is only for verified instructors. */
  gated: boolean;
}

export interface Resource {
  id: string;
  d: DisciplineKey;
  /** Discipline filter value. */
  disc: string;
  /** Discipline line shown on cards (can combine two areas). */
  discipline: string;
  type: ResourceType;
  title: string;
  summary: string;
  authors: string;
  inst: string;
  level: string;
  time: string;
  tools: string[];
  inc: IncludeKey[];
  includes: Include[];
  used: number;
  license: LicenseName;
  /** Recency rank; higher is newer. */
  added: number;
}

const INC: Record<IncludeKey, [string, Include["icon"], boolean]> = {
  dataset: ["Dataset", "database", false],
  note: ["Teaching note", "book-open", true],
  sol: ["Solution", "key-round", true],
};

function R(o: Omit<Resource, "includes">): Resource {
  return { ...o, includes: o.inc.map((k) => ({ key: k, label: INC[k][0], icon: INC[k][1], gated: INC[k][2] })) };
}

export const resources: Resource[] = [
  R({ id: "TME-0142", d: "fin", disc: "Financial accounting", discipline: "Financial accounting", type: "Case", title: "Revenue Recognition at Lakeside Fitness: A Membership Bundle Case", summary: "Find the performance obligations in a bundled gym membership, allocate the price, and build the revenue schedule.", authors: "Dana Whitfield, Marcus Osei", inst: "Riverbend State University, University of Illinois Urbana-Champaign", level: "Upper undergraduate", time: "75 minutes", tools: ["Excel"], inc: ["dataset", "note", "sol"], used: 9, license: "CC BY 4.0", added: 12 }),
  R({ id: "TME-0157", d: "audit", disc: "Audit", discipline: "Audit", type: "Case", title: "Going Concern Judgments at Northfield Ceramics", summary: "Weigh a liquidity forecast, a covenant breach, and management’s plans to decide whether substantial doubt exists.", authors: "Ruth Abernathy, Kenji Sato", inst: "Eastmoor University", level: "Upper undergraduate", time: "75 minutes", tools: ["Excel"], inc: ["dataset", "note", "sol"], used: 7, license: "CC BY 4.0", added: 15 }),
  R({ id: "TME-0118", d: "tax", disc: "Tax", discipline: "Tax", type: "Case", title: "Partnership Basis at Harlow Brewing", summary: "Track inside and outside basis through three years of contributions, distributions, and a partner buyout.", authors: "Theo Brandt", inst: "Eastmoor University", level: "Graduate", time: "75 minutes", tools: ["Excel"], inc: ["note", "sol"], used: 6, license: "CC BY-NC 4.0", added: 3 }),
  R({ id: "TME-0127", d: "audit", disc: "Audit", discipline: "Audit and analytics", type: "Data exercise", title: "Testing Journal Entries with Python", summary: "Screen a year of journal entries for unusual timing, round amounts, and unexpected posters in Jupyter.", authors: "Priya Raman", inst: "Riverbend State University", level: "Graduate", time: "Two class sessions", tools: ["Python", "Jupyter", "pandas"], inc: ["dataset", "note", "sol"], used: 5, license: "CC BY-NC 4.0", added: 8 }),
  R({ id: "TME-0133", d: "mgmt", disc: "Managerial accounting", discipline: "Managerial accounting and analytics", type: "Data exercise", title: "Inventory Shrinkage Dashboard in Power BI", summary: "Build a store-level shrinkage dashboard and explain which locations need a closer look.", authors: "Jordan Lee", inst: "Riverbend State University", level: "Introductory undergraduate", time: "50 minutes", tools: ["Power BI", "Excel"], inc: ["dataset", "sol"], used: 4, license: "CC BY-NC-SA 4.0", added: 10 }),
  R({ id: "TME-0149", d: "data", disc: "Data analytics", discipline: "Data analytics", type: "Data exercise", title: "Benford's Law on Travel and Expense Claims", summary: "Compare first-digit frequencies across 40,000 expense claims and decide which departments to sample.", authors: "Omar Haddad", inst: "Kessler College", level: "Upper undergraduate", time: "75 minutes", tools: ["Python", "pandas", "Jupyter", "Tableau"], inc: ["dataset", "note", "sol"], used: 4, license: "CC BY 4.0", added: 14 }),
  R({ id: "TME-0109", d: "ais", disc: "Accounting information systems", discipline: "Accounting information systems", type: "Teaching module", title: "Mapping Order-to-Cash at Copperline Supply", summary: "Diagram the order-to-cash process from interview notes, then find the gaps in its controls.", authors: "Grace Okafor", inst: "Prairie Lakes College", level: "Introductory undergraduate", time: "50 minutes", tools: ["Lucidchart"], inc: ["note", "sol"], used: 3, license: "CC BY 4.0", added: 2 }),
  R({ id: "TME-0161", d: "other", disc: "Other", discipline: "Other", type: "Teaching module", title: "Earnings Guidance Under Pressure: A Role-Play", summary: "Students play the CFO, the audit partner, and an analyst in the week before a missed quarter.", authors: "Martin Duval", inst: "Riverbend State University", level: "MBA", time: "90 minutes", tools: [], inc: ["note"], used: 2, license: "CC BY 4.0", added: 16 }),
  R({ id: "TME-0166", d: "emtech", disc: "Emerging technology", discipline: "Emerging technology", type: "Case", title: "Tokenized Treasury Bills on the Balance Sheet", summary: "Decide how a mid-size manufacturer should classify and measure tokenized T-bills it holds for cash management.", authors: "Lena Park", inst: "Kessler College", level: "Graduate", time: "75 minutes", tools: ["Excel"], inc: ["note", "sol"], used: 1, license: "CC BY 4.0", added: 17 }),
];

/** Published resources that appear on author pages but not in the default browse set. */
export const extraResources: Resource[] = [
  R({ id: "TME-0088", d: "fin", disc: "Financial accounting", discipline: "Financial accounting", type: "Case", title: "Lease Modifications at Corvid Air", summary: "Remeasure a regional airline’s aircraft leases after a fleet renegotiation and explain the effect on the balance sheet.", authors: "Dana Whitfield", inst: "Riverbend State University", level: "Upper undergraduate", time: "75 minutes", tools: ["Excel"], inc: ["dataset", "note", "sol"], used: 8, license: "CC BY 4.0", added: 1 }),
  R({ id: "TME-0101", d: "fin", disc: "Financial accounting", discipline: "Financial accounting", type: "Case", title: "Contingent Consideration in the Brightwater Acquisition", summary: "Measure an earnout at acquisition and at each reporting date, then trace the changes through the income statement.", authors: "Dana Whitfield, Marcus Osei", inst: "Riverbend State University, University of Illinois Urbana-Champaign", level: "Graduate", time: "75 minutes", tools: ["Excel"], inc: ["note", "sol"], used: 4, license: "CC BY 4.0", added: 4 }),
];

export const allResources = (): Resource[] => resources.concat(extraResources);
export const byId = (id: string): Resource | undefined => allResources().find((r) => r.id === id);

export const LICENSE_LINES: Record<LicenseName, string> = {
  "CC BY 4.0": "You can share and adapt this with credit.",
  "CC BY-NC 4.0": "You can share and adapt this with credit, but not for commercial use.",
  "CC BY-NC-SA 4.0": "You can share and adapt this with credit, not for commercial use, and you share your changes under the same license.",
};

export interface FileEntry {
  role: string;
  icon: FileIconName;
  name: string;
  format: string;
  size: string;
  /** Only verified instructors can download. */
  gated: boolean;
  /** Automatic check flag shown to the author while in review. */
  flag?: string;
}

export interface Author {
  initials: string;
  name: string;
  title: string;
  inst: string;
}

export interface ResourceDetail {
  id: string;
  d: DisciplineKey;
  discipline: string;
  type: ResourceType;
  aboutTitle: string;
  title: string;
  summary: string;
  byline: { name: string; after: string }[];
  meta: string;
  about: string;
  objectives: string[];
  time: string;
  level: string;
  tested: string;
  tools: string[];
  authors: Author[];
  files: FileEntry[];
  totalAll: string;
  allLabel: string;
  allMeta: string;
  publicMeta: string;
  cite: { lead: string; italic: string; tail: string };
  citeNote?: string;
  license: LicenseName;
  downloads: number;
  courses: number;
  versions: string;
  versionList: { v: string; date: string; note: string }[];
  related: string[];
}

const lakeside: ResourceDetail = {
  id: "TME-0142", d: "fin", discipline: "Financial accounting", type: "Case", aboutTitle: "About this case",
  title: "Revenue Recognition at Lakeside Fitness: A Membership Bundle Case",
  summary: "Students find the performance obligations in a bundled gym membership, allocate the price, and build the revenue schedule in Excel.",
  byline: [{ name: "Dana Whitfield", after: ", Riverbend State University, and " }, { name: "Marcus Osei", after: ", University of Illinois Urbana-Champaign" }],
  meta: "Updated September 2026 · Version 2 · CC BY 4.0",
  about: "Lakeside Fitness sells a twelve-month membership bundled with four personal training sessions and a branded water bottle. The controller has to decide how much revenue to recognize each month. Students work from the membership data to identify each promise in the bundle, estimate standalone selling prices, and turn the allocation into a monthly schedule.",
  objectives: ["Identify distinct performance obligations in a bundled membership.", "Allocate the transaction price using standalone selling prices.", "Build the revenue schedule in Excel."],
  time: "75 minutes", level: "Upper undergraduate", tested: "Fall 2025, Spring 2026", tools: ["Excel"],
  authors: [
    { initials: "DW", name: "Dana Whitfield", title: "Associate Professor of Accountancy", inst: "Riverbend State University" },
    { initials: "MO", name: "Marcus Osei", title: "Clinical Assistant Professor", inst: "University of Illinois Urbana-Champaign" },
  ],
  files: [
    { role: "Case", icon: "file-text", name: "lakeside-fitness-case.pdf", format: "PDF", size: "1.2 MB", gated: false },
    { role: "Membership data", icon: "file-spreadsheet", name: "lakeside-memberships.xlsx", format: "XLSX", size: "340 KB", gated: false },
    { role: "Teaching note", icon: "book-open", name: "lakeside-teaching-note.pdf", format: "PDF", size: "620 KB", gated: true },
    { role: "Solution workbook", icon: "key-round", name: "lakeside-solution.xlsx", format: "XLSX", size: "410 KB", gated: true },
  ],
  totalAll: "4 files · 2.6 MB", allLabel: "Download all 4 files", allMeta: "One ZIP file, 2.6 MB", publicMeta: "2 files in one ZIP, 1.5 MB",
  cite: { lead: "Whitfield, D., & Osei, M. (2026). ", italic: "Revenue recognition at Lakeside Fitness: A membership bundle case", tail: " (Version 2) [Teaching case]. Teaching Materials Exchange. https://tme.illinois.edu/r/0142" },
  license: "CC BY 4.0", downloads: 412, courses: 9, versions: "2 versions",
  versionList: [{ v: "Version 2", date: "September 2026", note: "Updated the membership data for 2026 prices." }, { v: "Version 1", date: "August 2025", note: "First published." }],
  related: ["TME-0133", "TME-0118", "TME-0157"],
};

const genai: ResourceDetail = {
  id: "TME-0171", d: "emtech", discipline: "Emerging technology", type: "Case", aboutTitle: "About this case",
  title: "Generative AI in the Monthly Close",
  summary: "Students review how a controller's team used a generative AI assistant during the monthly close and decide which uses need new review controls.",
  byline: [{ name: "Elena Fischer", after: " and " }, { name: "Sam Ortega", after: ", Prairie Lakes College" }],
  meta: "Submitted October 2026 · Version 1 · CC BY 4.0",
  about: "Halverson Supply's controller let her team try a generative AI assistant during the September close. It drafted reconciliation notes, explained journal entries, and summarized variances. Students read the prompt log, find where the assistant was wrong or went unchecked, and propose review controls for the next close.",
  objectives: ["Map where generative AI fits in a monthly close checklist.", "Find errors in AI-drafted reconciliation notes and journal entry explanations.", "Design review controls for AI-assisted close work."],
  time: "90 minutes", level: "MBA", tested: "Spring 2026", tools: ["Generative AI", "Excel"],
  authors: [
    { initials: "EF", name: "Elena Fischer", title: "Associate Professor of Accounting", inst: "Prairie Lakes College" },
    { initials: "SO", name: "Sam Ortega", title: "Assistant Professor of Information Systems", inst: "Prairie Lakes College" },
  ],
  files: [
    { role: "Case", icon: "file-text", name: "genai-monthly-close-case.pdf", format: "PDF", size: "1.4 MB", gated: false },
    { role: "Prompt log exhibit", icon: "file-text", name: "prompt-log-exhibit.pdf", format: "PDF", size: "880 KB", gated: false, flag: "Flagged: possible personal data on page 3" },
    { role: "Teaching note", icon: "book-open", name: "genai-close-teaching-note.pdf", format: "PDF", size: "2.1 MB", gated: true },
  ],
  totalAll: "3 files · 4.4 MB", allLabel: "Download all 3 files", allMeta: "One ZIP file, 4.4 MB", publicMeta: "2 files in one ZIP, 2.3 MB",
  cite: { lead: "Fischer, E., & Ortega, S. (2026). ", italic: "Generative AI in the monthly close", tail: " (Version 1) [Teaching case]. Teaching Materials Exchange." },
  citeNote: "The link is added when this is published.",
  license: "CC BY 4.0", downloads: 0, courses: 0, versions: "1 version",
  versionList: [{ v: "Version 1", date: "October 2026", note: "Submitted for review." }],
  related: ["TME-0166", "TME-0127", "TME-0109"],
};

const genaiPublished: ResourceDetail = {
  ...genai,
  meta: "Published October 2026 · Version 1 · CC BY 4.0",
  citeNote: "",
  cite: { lead: "Fischer, E., & Ortega, S. (2026). ", italic: "Generative AI in the monthly close", tail: " (Version 1) [Teaching case]. Teaching Materials Exchange. https://tme.illinois.edu/r/0171" },
  files: genai.files.map((f) => ({ ...f, flag: "" })),
  versionList: [{ v: "Version 1", date: "October 2026", note: "First published." }],
};

export const details = { lakeside, genai, genaiPublished };

const TITLES: Record<string, string> = { "Priya Raman": "Assistant Professor of Accountancy", "Jordan Lee": "Lecturer" };

const SPECIAL_FILES: Record<string, FileEntry[]> = {
  "TME-0127": [
    { role: "Case brief", icon: "file-text", name: "je-testing-brief.pdf", format: "PDF", size: "780 KB", gated: false },
    { role: "Journal entry dataset", icon: "file-spreadsheet", name: "journal-entries-fy25.csv", format: "CSV", size: "8.4 MB", gated: false },
    { role: "Starter notebook", icon: "file-code", name: "je-testing-starter.ipynb", format: "IPYNB", size: "96 KB", gated: false },
    { role: "Solution notebook", icon: "key-round", name: "je-testing-solution.ipynb", format: "IPYNB", size: "210 KB", gated: true },
    { role: "Teaching note", icon: "book-open", name: "je-testing-teaching-note.pdf", format: "PDF", size: "540 KB", gated: true },
  ],
  "TME-0133": [
    { role: "Instructions", icon: "file-text", name: "shrinkage-instructions.pdf", format: "PDF", size: "620 KB", gated: false },
    { role: "Store data", icon: "file-spreadsheet", name: "shrinkage-store-data.xlsx", format: "XLSX", size: "1.8 MB", gated: false },
    { role: "Solution walkthrough", icon: "key-round", name: "shrinkage-solution.pdf", format: "PDF", size: "2.2 MB", gated: true },
  ],
};

const DOWNLOADS: Record<string, number> = { "TME-0127": 268, "TME-0133": 155 };

const sentence = (t: string) =>
  t.charAt(0) +
  t
    .slice(1)
    .toLowerCase()
    .replace(/\b(python|power bi|benford's|t-bills|copperline|harlow|northfield|lakeside|jupyter)\b/gi, (m) => m.replace(/\b\w/g, (c) => c.toUpperCase()));

/** Full resource page content. Falls back to the Lakeside case for unknown IDs. */
export function detailFor(id?: string, opts: { published?: boolean } = {}): ResourceDetail {
  if (id === "TME-0142" || !id) return lakeside;
  if (id === "TME-0171") return opts.published ? genaiPublished : genai;
  const r = byId(id);
  if (!r) return lakeside;
  const names = r.authors.split(", ");
  const insts = names.length > 1 && r.inst.indexOf(", ") > -1 ? r.inst.split(", ") : names.map(() => r.inst);
  const sameInst = insts.every((x) => x === insts[0]);
  const byline = sameInst
    ? names.map((n, i) => ({ name: n, after: i < names.length - 1 ? " and " : ", " + insts[0] }))
    : names.map((n, i) => ({ name: n, after: ", " + insts[i] + (i < names.length - 1 ? ", and " : "") }));
  const slug = r.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").slice(0, 3).join("-");
  const py = r.tools.indexOf("Python") > -1;
  const main: FileEntry =
    r.type === "Case"
      ? { role: "Case", icon: "file-text", name: slug + "-case.pdf", format: "PDF", size: "1.1 MB", gated: false }
      : r.type === "Data exercise"
        ? { role: "Instructions", icon: "file-text", name: slug + "-instructions.pdf", format: "PDF", size: "540 KB", gated: false }
        : { role: "Module guide", icon: "file-text", name: slug + "-guide.pdf", format: "PDF", size: "900 KB", gated: false };
  const files: FileEntry[] =
    SPECIAL_FILES[id] ||
    [main].concat(
      r.inc.map((k): FileEntry =>
        k === "dataset"
          ? { role: "Dataset", icon: "file-spreadsheet", name: slug + (py ? "-data.csv" : "-data.xlsx"), format: py ? "CSV" : "XLSX", size: "2.3 MB", gated: false }
          : k === "note"
            ? { role: "Teaching note", icon: "book-open", name: slug + "-teaching-note.pdf", format: "PDF", size: "610 KB", gated: true }
            : { role: "Solution", icon: "key-round", name: slug + (py ? "-solution.ipynb" : "-solution.xlsx"), format: py ? "IPYNB" : "XLSX", size: "480 KB", gated: true },
      ),
    );
  const pub = files.filter((f) => !f.gated).length;
  const apa = names.map((n) => {
    const p = n.split(" ");
    return p[p.length - 1] + ", " + p[0][0] + ".";
  });
  const apaStr = apa.length === 1 ? apa[0] : apa.slice(0, -1).join(", ") + ", & " + apa[apa.length - 1];
  return {
    id: r.id, d: r.d, discipline: r.discipline, type: r.type, aboutTitle: "About this " + r.type.toLowerCase(),
    title: r.title, summary: r.summary, byline,
    meta: "Updated 2026 · Version 1 · " + r.license,
    about: r.summary, objectives: [], time: r.time, level: r.level, tested: "Spring 2026", tools: r.tools,
    authors: names.map((n, i) => ({ initials: n.split(" ").map((p) => p[0]).join(""), name: n, title: TITLES[n] || "", inst: insts[i] })),
    files, totalAll: files.length + " files", allLabel: "Download all " + files.length + " files", allMeta: "One ZIP file", publicMeta: pub + " files in one ZIP",
    cite: { lead: apaStr + " (2026). ", italic: sentence(r.title), tail: " (Version 1) [Teaching " + r.type.toLowerCase() + "]. Teaching Materials Exchange. https://tme.illinois.edu/r/" + r.id.slice(4) },
    license: r.license, downloads: DOWNLOADS[id] || r.used * 38 + 21, courses: r.used, versions: "1 version",
    versionList: [{ v: "Version 1", date: "2026", note: "First published." }],
    related: resources.filter((x) => x.id !== id).filter((x, i) => x.d === r.d || i < 4).slice(0, 3).map((x) => x.id),
  };
}

export type FilterKey = "disc" | "type" | "level" | "tools" | "inc" | "license";

export interface FilterDef {
  key: FilterKey;
  title: string;
  options: { label: string; count: number }[];
  more?: string;
}

const opt = (arr: [string, number][]) => arr.map(([label, count]) => ({ label, count }));

export const filterDefs: FilterDef[] = [
  { key: "disc", title: "Discipline", options: opt([["Financial accounting", 31], ["Audit", 24], ["Managerial accounting", 17], ["Data analytics", 15], ["Tax", 14], ["Accounting information systems", 12], ["Emerging technology", 9], ["Other", 6]]) },
  { key: "type", title: "Type", options: opt([["Case", 52], ["Data exercise", 41], ["Teaching module", 35]]) },
  { key: "level", title: "Course level", options: opt([["Introductory undergraduate", 22], ["Upper undergraduate", 54], ["Graduate", 33], ["MBA", 19]]) },
  { key: "tools", title: "Tools", options: opt([["Excel", 71], ["Python", 18], ["Power BI", 11], ["Tableau", 9], ["Generative AI", 8]]), more: "Show 9 more tools" },
  { key: "inc", title: "Includes", options: opt([["Dataset", 64], ["Teaching note", 102], ["Solution", 77]]) },
  { key: "license", title: "License", options: opt([["CC BY 4.0", 81], ["CC BY-NC 4.0", 33], ["CC BY-NC-SA 4.0", 14]]) },
];

export function matches(r: Resource, key: FilterKey, label: string): boolean {
  switch (key) {
    case "type":
      return r.type === label;
    case "disc":
      return r.disc === label;
    case "level":
      return r.level === label;
    case "tools":
      return r.tools.indexOf(label) > -1;
    case "inc":
      return r.includes.some((i) => i.label === label);
    case "license":
      return r.license === label;
  }
}

export interface Discipline {
  d: DisciplineKey;
  label: string;
  pattern: string;
}

export const disciplines: Discipline[] = (
  [
    ["fin", "Financial accounting", "Bloks"], ["audit", "Audit", "Maze"], ["tax", "Tax", "Trigram"], ["ais", "Accounting information systems", "Metro"],
    ["mgmt", "Managerial accounting", "Weave"], ["data", "Data analytics", "Terrain"], ["emtech", "Emerging technology", "Comet"], ["other", "Other", "Tesserae"],
  ] as [DisciplineKey, string, string][]
).map(([d, label, pattern]) => ({ d, label, pattern }));

/** Signature color per discipline; the fourth swatch in the Illini palette. */
export const DISCIPLINE_SWATCH: Record<DisciplineKey, string> = {
  fin: "#FCB316", audit: "#1D58A7", tax: "#7D3E13", ais: "#009FD4", mgmt: "#007E8E", data: "#006230", emtech: "#5C0E41", other: "#707372",
};

/** Approved cover palettes contributors can choose from. */
export function palettesFor(d: DisciplineKey): { name: string; colors: string[] }[] {
  return [
    { name: "Illini", colors: ["#F4F4F4", "#13294B", "#FF5F05", DISCIPLINE_SWATCH[d]] },
    { name: "Blue", colors: ["#F4F4F4", "#13294B", "#1D58A7", "#009FD4"] },
    { name: "Orange", colors: ["#F4F4F4", "#FF5F05", "#FCB316", "#13294B"] },
  ];
}

export const disciplineByLabel = (label: string) => disciplines.find((x) => x.label === label);

/** URL for a resource page, matching the citation links (https://tme.illinois.edu/r/0142). */
export const resourceHref = (id: string, params?: Record<string, string | number | boolean | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== false && v !== "") q.set(k, String(v === true ? 1 : v));
  });
  const s = q.toString();
  return "/r/" + id.replace(/^TME-/, "") + (s ? "?" + s : "");
};

/** Turns a route slug ("0142" or "TME-0142") back into a resource ID. */
export const resourceIdFromSlug = (slug: string) => (slug.startsWith("TME-") ? slug : "TME-" + slug);

export const authorSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const authorHref = (name: string) => "/authors/" + authorSlug(name);

export interface Person {
  key: "priya" | "elena";
  name: string;
  first: string;
  initials: string;
  title: string;
  inst: string;
  email: string;
  orcid: string;
}

export const PEOPLE: Record<Person["key"], Person> = {
  priya: { key: "priya", name: "Priya Raman", first: "Priya", initials: "PR", title: "Assistant Professor of Accountancy", inst: "Riverbend State University", email: "praman@riverbend.edu", orcid: "" },
  elena: { key: "elena", name: "Elena Fischer", first: "Elena", initials: "EF", title: "Associate Professor of Accounting", inst: "Prairie Lakes College", email: "efischer@prairielakes.edu", orcid: "0000-0002-7134-5580" },
};

export const SITE = {
  name: "Teaching Materials Exchange",
  center: "UI-Deloitte Foundation Center for Business Emerging Technologies",
  college: "Gies College of Business, University of Illinois Urbana-Champaign",
  centerUrl: "https://giesbusiness.illinois.edu/",
};

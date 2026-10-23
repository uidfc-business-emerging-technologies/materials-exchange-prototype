// Sample data for the admin screens. All people are fictional.

export type CheckTone = "ok" | "bad" | "none" | "doc";

export interface Applicant {
  id: string;
  name: string;
  first: string;
  email: string;
  inst: string;
  when: string;
  wait: string;
  page: string;
  label: "Instructor" | "Not instructor" | "None" | "Document";
  sug: "Auto-approved" | "Needs review";
  doc?: boolean;
  repeat?: string;
  checks: [CheckTone, string][];
  quote: string;
  why: string;
  history: { when: string; what: string; icon: "link" | "mail" | "refresh" | "warn" | "user" | "upload" | "ok"; tone: "info" | "warn" | "ok"; detail: string; email?: string }[];
}

const ML = "Thanks for applying. We couldn't open the page you sent. Could you reply with another page on your school's website that lists your name and title?";

export const APPLICANTS: Record<string, Applicant> = {
  mblake: {
    id: "mblake",
    name: "Morgan Blake",
    first: "Morgan",
    email: "mblake@prairielakes.edu",
    inst: "Prairie Lakes College",
    when: "Today 10:41",
    wait: "Waiting 37 min",
    page: "prairielakes.edu/directory/morgan-blake",
    label: "None",
    sug: "Needs review",
    repeat: "2nd request",
    checks: [
      ["ok", "Domain match"],
      ["bad", "Page couldn't be read"],
      ["none", "Name not checked"],
    ],
    quote: "",
    why: "The page needs JavaScript to load, so the system couldn't read it.",
    history: [
      { when: "Oct 3, 2:15 PM", what: "Applied with a faculty page", icon: "link", tone: "info", detail: "prairielakes.edu/directory/morgan-blake" },
      { when: "Oct 3, 3:02 PM", what: "Asked for a different link, by Jamie Morales", icon: "mail", tone: "info", detail: "The page couldn't be read.", email: ML },
      { when: "Today 10:41", what: "Sent the same page again", icon: "refresh", tone: "warn", detail: "The page still needs JavaScript to load." },
    ],
  },
  akim: {
    id: "akim",
    name: "Alex Kim",
    first: "Alex",
    email: "akim@riverbend.edu",
    inst: "Riverbend State University",
    when: "Today 10:52",
    wait: "Waiting 26 min",
    page: "riverbend.edu/accountancy/people/alex-kim",
    label: "Not instructor",
    sug: "Needs review",
    checks: [
      ["ok", "Domain match"],
      ["ok", "Page read"],
      ["ok", "Name found"],
    ],
    quote: "Alex Kim, PhD student and teaching assistant, Department of Accountancy",
    why: "The page lists Alex as a PhD student and teaching assistant, so the system did not label them an instructor.",
    history: [
      { when: "Today 10:52", what: "Applied with a faculty page", icon: "link", tone: "info", detail: "riverbend.edu/accountancy/people/alex-kim" },
      { when: "Today 10:52", what: 'Labeled "Not instructor" by the system', icon: "warn", tone: "warn", detail: "The page lists a PhD student and teaching assistant." },
    ],
  },
  jnoor: {
    id: "jnoor",
    name: "Jamal Noor",
    first: "Jamal",
    email: "jnoor@kessler.edu",
    inst: "Kessler College",
    when: "Today 11:05",
    wait: "Waiting 14 min",
    page: "appointment-letter-2026.pdf",
    label: "Document",
    sug: "Needs review",
    doc: true,
    checks: [
      ["ok", "Domain match"],
      ["doc", "Document, 1 page"],
      ["ok", "Name found"],
    ],
    quote: "We are pleased to appoint Jamal Noor as Lecturer in Accountancy for the 2026–27 academic year, teaching ACCY 201 and ACCY 302.",
    why: "Jamal uploaded a document instead of a faculty page. Documents are always reviewed by a person, even when every check passes.",
    history: [
      { when: "Oct 12, 9:30 AM", what: "Created an account", icon: "user", tone: "info", detail: "Chose “I'll do this later” for verification." },
      { when: "Today 11:05", what: "Uploaded a document", icon: "upload", tone: "info", detail: "appointment-letter-2026.pdf" },
    ],
  },
  praman: {
    id: "praman",
    name: "Priya Raman",
    first: "Priya",
    email: "praman@riverbend.edu",
    inst: "Riverbend State University",
    when: "Today 10:41",
    wait: "Approved automatically",
    page: "riverbend.edu/accountancy/faculty/priya-raman",
    label: "Instructor",
    sug: "Auto-approved",
    checks: [
      ["ok", "Domain match"],
      ["ok", "Page read"],
      ["ok", "Name found"],
    ],
    quote: "Priya Raman, Assistant Professor of Accountancy, teaches Intermediate Accounting and Data Analytics.",
    why: "Shown for spot checks. The page lists Priya as an assistant professor who teaches.",
    history: [
      { when: "Oct 17, 2025", what: "Approved automatically", icon: "ok", tone: "ok", detail: "Domain, page and title matched." },
      { when: "Today 10:41", what: "Renewed automatically", icon: "ok", tone: "ok", detail: "Same faculty page, checked again." },
    ],
  },
};

export const APPLICANT_ORDER = ["mblake", "akim", "jnoor", "praman"];

export const DECLINE_REASONS = ["Not an instructor (student or staff)", "Name isn't on the page", "Page isn't on a school website", "Something else"];

export const VERIFY_MESSAGES = {
  decline:
    "Thanks for applying. We couldn't confirm from your page that you teach a course, so we can't unlock teaching notes yet. If you're the instructor of record for a course, reply with a page that shows it, like a course schedule or syllabus.",
  doc: "Thanks for applying. We couldn't use the document you sent. Could you reply with a recent appointment letter, teaching contract, or course schedule that shows your name and that you teach?",
  link: ML,
};

export interface Submission {
  id: string;
  d: import("./data").DisciplineKey;
  title: string;
  type: string;
  authors: string;
  inst: string;
  /** First-time or trusted contributor. */
  ct: "first" | "trusted";
  when: string;
  wait: string;
  status: "waiting" | "changes" | "published" | "declined";
  flags: string[];
  files: number;
  history: { when: string; what: string }[];
}

export const SUBMISSIONS: Submission[] = [
  {
    id: "TME-0171",
    d: "emtech",
    title: "Generative AI in the Monthly Close",
    type: "Case",
    authors: "Elena Fischer, Sam Ortega",
    inst: "Prairie Lakes College",
    ct: "first",
    when: "Oct 22, 11:20 AM",
    wait: "Resubmitted, waiting 1 day",
    status: "waiting",
    flags: [],
    files: 3,
    history: [
      {
        when: "Oct 22",
        what: "Resubmitted with a new exhibit",
      },
      {
        when: "Oct 14",
        what: "Changes requested by Jamie Morales",
      },
      {
        when: "Oct 13",
        what: "Submitted",
      },
    ],
  },
  {
    id: "TME-0175",
    d: "fin",
    title: "Lease Accounting Practice Set",
    type: "Data exercise",
    authors: "Kenji Sato",
    inst: "Eastmoor University",
    ct: "trusted",
    when: "Oct 23, 8:40 AM",
    wait: "Waiting 3 hours",
    status: "waiting",
    flags: ["Possible personal data: 3 names in the lease schedule"],
    files: 4,
    history: [
      {
        when: "Oct 23",
        what: "Submitted. Held for review because of a flag",
      },
    ],
  },
  {
    id: "TME-0176",
    d: "emtech",
    title: "Blockchain Audit Trails at Meridian Freight",
    type: "Case",
    authors: "Lena Park",
    inst: "Kessler College",
    ct: "trusted",
    when: "Oct 22, 4:10 PM",
    wait: "Waiting 19 hours",
    status: "waiting",
    flags: ["Possible personal data: 2 email addresses in exhibit B", "Company name may not be public"],
    files: 3,
    history: [
      {
        when: "Oct 22",
        what: "Submitted. Held for review because of 2 flags",
      },
    ],
  },
  {
    id: "TME-0177",
    d: "mgmt",
    title: "Inventory Count Simulation",
    type: "Teaching module",
    authors: "Aisha Bello",
    inst: "University of Illinois Urbana-Champaign",
    ct: "first",
    when: "Oct 23, 10:02 AM",
    wait: "Waiting 1 hour",
    status: "waiting",
    flags: [],
    files: 2,
    history: [
      {
        when: "Oct 23",
        what: "Submitted",
      },
    ],
  },
  {
    id: "TME-0172",
    d: "audit",
    title: "Sampling Vendor Payments in Python",
    type: "Data exercise",
    authors: "Priya Raman",
    inst: "Riverbend State University",
    ct: "trusted",
    when: "Oct 15, 2:30 PM",
    wait: "Waiting on the author since Oct 16",
    status: "changes",
    flags: ["Possible personal data: vendor bank details in the dataset"],
    files: 3,
    history: [
      {
        when: "Oct 16",
        what: "Changes requested by Jamie Morales: mask vendor bank details",
      },
      {
        when: "Oct 15",
        what: "Submitted. Held for review because of a flag",
      },
    ],
  },
  {
    id: "TME-0169",
    d: "tax",
    title: "Tax Provision Walkthrough",
    type: "Data exercise",
    authors: "Theo Brandt",
    inst: "Eastmoor University",
    ct: "trusted",
    when: "Oct 14, 9:15 AM",
    wait: "Waiting on the author since Oct 15",
    status: "changes",
    flags: ["Solution workbook set to Anyone"],
    files: 3,
    history: [
      {
        when: "Oct 15",
        what: "Changes requested by Jamie Morales: set the solution to verified instructors only",
      },
      {
        when: "Oct 14",
        what: "Submitted",
      },
    ],
  },
  {
    id: "TME-0170",
    d: "data",
    title: "Data Visualization Ethics Mini-Case",
    type: "Case",
    authors: "Daniel Ng",
    inst: "University of Illinois Urbana-Champaign",
    ct: "first",
    when: "Oct 19, 1:45 PM",
    wait: "Waiting on the author since Oct 20",
    status: "changes",
    flags: [],
    files: 2,
    history: [
      {
        when: "Oct 20",
        what: "Changes requested by Jamie Morales: add learning objectives",
      },
      {
        when: "Oct 19",
        what: "Submitted",
      },
    ],
  },
  {
    id: "TME-0173",
    d: "mgmt",
    title: "Cost Allocation at Hartwell Clinics",
    type: "Teaching module",
    authors: "Jordan Lee",
    inst: "Riverbend State University",
    ct: "trusted",
    when: "Oct 20, 10:30 AM",
    wait: "Decided Oct 21",
    status: "published",
    flags: [],
    files: 3,
    history: [
      {
        when: "Oct 21",
        what: "Approved by Jamie Morales",
      },
      {
        when: "Oct 20",
        what: "Submitted",
      },
    ],
  },
  {
    id: "TME-0166",
    d: "emtech",
    title: "Tokenized Treasury Bills on the Balance Sheet",
    type: "Case",
    authors: "Lena Park",
    inst: "Kessler College",
    ct: "first",
    when: "Oct 16, 3:05 PM",
    wait: "Decided Oct 17",
    status: "published",
    flags: [],
    files: 3,
    history: [
      {
        when: "Oct 17",
        what: "Approved by Jamie Morales",
      },
      {
        when: "Oct 16",
        what: "Submitted",
      },
    ],
  },
  {
    id: "TME-0161",
    d: "other",
    title: "Earnings Guidance Under Pressure: A Role-Play",
    type: "Teaching module",
    authors: "Martin Duval",
    inst: "Riverbend State University",
    ct: "trusted",
    when: "Oct 16, 9:00 AM",
    wait: "Published right away",
    status: "published",
    flags: [],
    files: 1,
    history: [
      {
        when: "Oct 16",
        what: "Published automatically for a trusted contributor",
      },
    ],
  },
  {
    id: "TME-0157",
    d: "audit",
    title: "Going Concern Judgments at Northfield Ceramics",
    type: "Case",
    authors: "Ruth Abernathy, Kenji Sato",
    inst: "Eastmoor University",
    ct: "trusted",
    when: "Oct 15, 11:40 AM",
    wait: "Published right away",
    status: "published",
    flags: [],
    files: 4,
    history: [
      {
        when: "Oct 15",
        what: "Published automatically for a trusted contributor",
      },
    ],
  },
  {
    id: "TME-0168",
    d: "audit",
    title: "Fraud Interview Role-Play",
    type: "Teaching module",
    authors: "Martin Duval",
    inst: "Riverbend State University",
    ct: "trusted",
    when: "Oct 9, 4:20 PM",
    wait: "Decided Oct 10",
    status: "declined",
    flags: ["Company name may not be public"],
    files: 2,
    history: [
      {
        when: "Oct 10",
        what: "Declined by Jamie Morales: rights to share are unclear",
      },
      {
        when: "Oct 9",
        what: "Submitted. Held for review because of a flag",
      },
    ],
  },
  {
    id: "TME-0149",
    d: "data",
    title: "Benford's Law on Travel and Expense Claims",
    type: "Data exercise",
    authors: "Omar Haddad",
    inst: "Kessler College",
    ct: "trusted",
    when: "Oct 13, 2:00 PM",
    wait: "Published right away",
    status: "published",
    flags: [],
    files: 4,
    history: [
      {
        when: "Oct 13",
        what: "Published automatically for a trusted contributor",
      },
    ],
  },
];

/** Submissions with a full review or edit screen in the prototype. */
export const KNOWN_SUBMISSIONS = ["TME-0171", "TME-0172", "TME-0166", "TME-0161", "TME-0157", "TME-0149"];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  inst: string;
  title: string;
  role: "Instructor" | "Admin";
  status: "verified" | "review" | "none" | "renewal";
  joined: string;
  last: string;
  ver: string;
  work: string;
  history: { when: string; what: string }[];
  suspended: boolean;
}

export const USERS: AdminUser[] = [
  {
    id: "praman",
    name: "Priya Raman",
    email: "praman@riverbend.edu",
    inst: "Riverbend State University",
    title: "Assistant Professor of Accountancy",
    role: "Instructor",
    status: "verified",
    joined: "Aug 2025",
    last: "Today",
    ver: "Faculty page, until Oct 17, 2027",
    work: "4 resources, 2 course reports",
    history: [
      {
        when: "Oct 17, 2026",
        what: "Re-verified with her faculty page",
      },
      {
        when: "Oct 15, 2026",
        what: "Submitted Sampling Vendor Payments in Python",
      },
      {
        when: "Aug 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "dwhitfield",
    name: "Dana Whitfield",
    email: "dwhitfield@riverbend.edu",
    inst: "Riverbend State University",
    title: "Associate Professor of Accountancy",
    role: "Instructor",
    status: "verified",
    joined: "Mar 2025",
    last: "Oct 19",
    ver: "Faculty page, until Mar 2, 2027",
    work: "3 resources",
    history: [
      {
        when: "Sep 2026",
        what: "Published version 2 of Revenue Recognition at Lakeside Fitness",
      },
      {
        when: "Mar 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "mosei",
    name: "Marcus Osei",
    email: "mosei@illinois.edu",
    inst: "University of Illinois Urbana-Champaign",
    title: "Clinical Assistant Professor",
    role: "Instructor",
    status: "verified",
    joined: "Mar 2025",
    last: "Oct 8",
    ver: "Faculty page, until Apr 1, 2027",
    work: "2 resources",
    history: [
      {
        when: "Mar 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "efischer",
    name: "Elena Fischer",
    email: "efischer@prairielakes.edu",
    inst: "Prairie Lakes College",
    title: "Associate Professor of Accounting",
    role: "Instructor",
    status: "verified",
    joined: "Sep 2026",
    last: "Oct 22",
    ver: "Faculty page, until Sep 30, 2027",
    work: "1 resource in review",
    history: [
      {
        when: "Oct 22, 2026",
        what: "Resubmitted Generative AI in the Monthly Close",
      },
      {
        when: "Oct 14, 2026",
        what: "Changes requested by Jamie Morales",
      },
      {
        when: "Sep 2026",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "sortega",
    name: "Sam Ortega",
    email: "sortega@prairielakes.edu",
    inst: "Prairie Lakes College",
    title: "Assistant Professor of Information Systems",
    role: "Instructor",
    status: "verified",
    joined: "Sep 2026",
    last: "Oct 14",
    ver: "Faculty page, until Sep 30, 2027",
    work: "1 resource in review",
    history: [
      {
        when: "Sep 2026",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "akim",
    name: "Alex Kim",
    email: "akim@riverbend.edu",
    inst: "Riverbend State University",
    title: "PhD student",
    role: "Instructor",
    status: "review",
    joined: "Oct 21",
    last: "Oct 21",
    ver: "Faculty page, waiting since Oct 21",
    work: "None",
    history: [
      {
        when: "Oct 21, 2026",
        what: "Applied with a faculty page",
      },
    ],
    suspended: false,
  },
  {
    id: "mblake",
    name: "Morgan Blake",
    email: "mblake@prairielakes.edu",
    inst: "Prairie Lakes College",
    title: "Lecturer",
    role: "Instructor",
    status: "review",
    joined: "Oct 3",
    last: "Yesterday",
    ver: "Faculty page, 2nd request",
    work: "None",
    history: [
      {
        when: "Oct 3, 2026",
        what: "Asked for a different link",
      },
      {
        when: "Oct 3, 2026",
        what: "Applied with a faculty page",
      },
    ],
    suspended: false,
  },
  {
    id: "jnoor",
    name: "Jordan Noor",
    email: "jnoor@kessler.edu",
    inst: "Kessler College",
    title: "Instructor",
    role: "Instructor",
    status: "review",
    joined: "Oct 12",
    last: "Oct 21",
    ver: "Document, waiting since Oct 21",
    work: "None",
    history: [
      {
        when: "Oct 21, 2026",
        what: "Uploaded a document",
      },
      {
        when: "Oct 12, 2026",
        what: "Created an account and chose to verify later",
      },
    ],
    suspended: false,
  },
  {
    id: "tbrandt",
    name: "Theo Brandt",
    email: "tbrandt@eastmoor.edu",
    inst: "Eastmoor University",
    title: "Professor of Accounting",
    role: "Instructor",
    status: "renewal",
    joined: "Oct 2025",
    last: "Sep 30",
    ver: "Faculty page, ended Oct 20, 2026",
    work: "1 resource",
    history: [
      {
        when: "Sep 20, 2026",
        what: "Sent a renewal reminder",
      },
      {
        when: "Oct 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "vreyes",
    name: "Victor Reyes",
    email: "vreyes@riverbend.edu",
    inst: "Riverbend State University",
    title: "Lecturer in Accountancy",
    role: "Instructor",
    status: "renewal",
    joined: "Oct 2025",
    last: "Aug 28",
    ver: "Faculty page, ended Oct 12, 2026",
    work: "None",
    history: [
      {
        when: "Sep 12, 2026",
        what: "Sent a renewal reminder",
      },
      {
        when: "Oct 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "clyle",
    name: "Chris Lyle",
    email: "clyle@eastmoor.edu",
    inst: "Eastmoor University",
    title: "",
    role: "Instructor",
    status: "none",
    joined: "Oct 20",
    last: "Oct 20",
    ver: "Not started",
    work: "None",
    history: [
      {
        when: "Oct 20, 2026",
        what: "Created an account and chose to verify later",
      },
    ],
    suspended: false,
  },
  {
    id: "hcole",
    name: "Hannah Cole",
    email: "hcole@kessler.edu",
    inst: "Kessler College",
    title: "",
    role: "Instructor",
    status: "none",
    joined: "Oct 9",
    last: "Oct 9",
    ver: "Not started",
    work: "None",
    history: [
      {
        when: "Oct 9, 2026",
        what: "Created an account and chose to verify later",
      },
    ],
    suspended: false,
  },
  {
    id: "ktanaka",
    name: "Kai Tanaka",
    email: "ktanaka@eastmoor.edu",
    inst: "Eastmoor University",
    title: "Adjunct Instructor",
    role: "Instructor",
    status: "verified",
    joined: "Jan 2026",
    last: "Oct 2",
    ver: "Faculty page, until Jan 9, 2027",
    work: "None",
    history: [
      {
        when: "Oct 2, 2026",
        what: "Suspended: shared locked files publicly (Jamie Morales)",
      },
    ],
    suspended: true,
  },
  {
    id: "gokafor",
    name: "Grace Okafor",
    email: "gokafor@prairielakes.edu",
    inst: "Prairie Lakes College",
    title: "Associate Professor of Accounting",
    role: "Instructor",
    status: "verified",
    joined: "Feb 2025",
    last: "Oct 18",
    ver: "Faculty page, until Feb 3, 2027",
    work: "1 resource",
    history: [
      {
        when: "Feb 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "ohaddad",
    name: "Omar Haddad",
    email: "ohaddad@kessler.edu",
    inst: "Kessler College",
    title: "Assistant Professor of Accounting",
    role: "Instructor",
    status: "verified",
    joined: "Apr 2025",
    last: "Oct 20",
    ver: "Faculty page, until Apr 22, 2027",
    work: "1 resource",
    history: [
      {
        when: "Apr 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "lpark",
    name: "Lena Park",
    email: "lpark@kessler.edu",
    inst: "Kessler College",
    title: "Assistant Professor of Finance",
    role: "Instructor",
    status: "verified",
    joined: "May 2025",
    last: "Oct 17",
    ver: "Faculty page, until May 6, 2027",
    work: "1 resource",
    history: [
      {
        when: "May 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "mduval",
    name: "Martin Duval",
    email: "mduval@riverbend.edu",
    inst: "Riverbend State University",
    title: "Professor of Accountancy",
    role: "Instructor",
    status: "verified",
    joined: "Jan 2025",
    last: "Oct 11",
    ver: "Document, until Jan 20, 2027",
    work: "1 resource",
    history: [
      {
        when: "Jan 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "jlee",
    name: "Jordan Lee",
    email: "jlee@riverbend.edu",
    inst: "Riverbend State University",
    title: "Lecturer",
    role: "Instructor",
    status: "verified",
    joined: "Jun 2025",
    last: "Oct 6",
    ver: "Faculty page, until Jun 2, 2027",
    work: "1 resource",
    history: [
      {
        when: "Jun 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "rabernathy",
    name: "Ruth Abernathy",
    email: "rabernathy@eastmoor.edu",
    inst: "Eastmoor University",
    title: "Professor of Accounting",
    role: "Instructor",
    status: "verified",
    joined: "Feb 2025",
    last: "Sep 29",
    ver: "Faculty page, until Feb 14, 2027",
    work: "1 resource",
    history: [
      {
        when: "Feb 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "ksato",
    name: "Kenji Sato",
    email: "ksato@eastmoor.edu",
    inst: "Eastmoor University",
    title: "Assistant Professor of Accounting",
    role: "Instructor",
    status: "verified",
    joined: "Feb 2025",
    last: "Oct 1",
    ver: "Faculty page, until Feb 14, 2027",
    work: "1 resource",
    history: [
      {
        when: "Feb 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "abello",
    name: "Aisha Bello",
    email: "abello@illinois.edu",
    inst: "University of Illinois Urbana-Champaign",
    title: "Teaching Associate Professor",
    role: "Instructor",
    status: "verified",
    joined: "Aug 2025",
    last: "Oct 22",
    ver: "Faculty page, until Aug 30, 2027",
    work: "3 course reports",
    history: [
      {
        when: "Aug 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "dng",
    name: "Daniel Ng",
    email: "dng@illinois.edu",
    inst: "University of Illinois Urbana-Champaign",
    title: "Lecturer in Accountancy",
    role: "Instructor",
    status: "verified",
    joined: "Sep 2025",
    last: "Oct 13",
    ver: "Faculty page, until Sep 8, 2027",
    work: "1 course report",
    history: [
      {
        when: "Sep 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "smarin",
    name: "Sofia Marin",
    email: "smarin@eastmoor.edu",
    inst: "Eastmoor University",
    title: "Assistant Professor of Accounting",
    role: "Instructor",
    status: "verified",
    joined: "Nov 2025",
    last: "Oct 4",
    ver: "Document, until Nov 18, 2026",
    work: "None",
    history: [
      {
        when: "Nov 2025",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "npatel",
    name: "Noah Patel",
    email: "npatel@kessler.edu",
    inst: "Kessler College",
    title: "Instructor",
    role: "Instructor",
    status: "verified",
    joined: "Jan 2026",
    last: "Sep 21",
    ver: "Faculty page, until Jan 27, 2027",
    work: "None",
    history: [
      {
        when: "Jan 2026",
        what: "Created an account",
      },
    ],
    suspended: false,
  },
  {
    id: "bcarter",
    name: "Ben Carter",
    email: "bcarter@prairielakes.edu",
    inst: "Prairie Lakes College",
    title: "",
    role: "Instructor",
    status: "none",
    joined: "Sep 30",
    last: "Sep 30",
    ver: "Not started",
    work: "None",
    history: [
      {
        when: "Sep 30, 2026",
        what: "Created an account and chose to verify later",
      },
    ],
    suspended: false,
  },
  {
    id: "jmorales",
    name: "Jamie Morales",
    email: "jmorales@illinois.edu",
    inst: "University of Illinois Urbana-Champaign",
    title: "Verification team",
    role: "Admin",
    status: "verified",
    joined: "Jan 2025",
    last: "Now",
    ver: "Center staff",
    work: "None",
    history: [
      {
        when: "Jan 2025",
        what: "Given admin access",
      },
    ],
    suspended: false,
  },
];

/** The signed-in admin, who can't remove their own access. */
export const ADMIN_ID = "jmorales";

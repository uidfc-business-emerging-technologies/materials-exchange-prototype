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
    id: "mblake", name: "Morgan Blake", first: "Morgan", email: "mblake@prairielakes.edu", inst: "Prairie Lakes College", when: "Today 10:41", wait: "Waiting 37 min", page: "prairielakes.edu/directory/morgan-blake", label: "None", sug: "Needs review", repeat: "2nd request",
    checks: [["ok", "Domain match"], ["bad", "Page couldn't be read"], ["none", "Name not checked"]], quote: "", why: "The page needs JavaScript to load, so the system couldn't read it.",
    history: [
      { when: "Oct 3, 2:15 PM", what: "Applied with a faculty page", icon: "link", tone: "info", detail: "prairielakes.edu/directory/morgan-blake" },
      { when: "Oct 3, 3:02 PM", what: "Asked for a different link, by Jamie Morales", icon: "mail", tone: "info", detail: "The page couldn't be read.", email: ML },
      { when: "Today 10:41", what: "Sent the same page again", icon: "refresh", tone: "warn", detail: "The page still needs JavaScript to load." },
    ],
  },
  akim: {
    id: "akim", name: "Alex Kim", first: "Alex", email: "akim@riverbend.edu", inst: "Riverbend State University", when: "Today 10:52", wait: "Waiting 26 min", page: "riverbend.edu/accountancy/people/alex-kim", label: "Not instructor", sug: "Needs review",
    checks: [["ok", "Domain match"], ["ok", "Page read"], ["ok", "Name found"]], quote: "Alex Kim, PhD student and teaching assistant, Department of Accountancy", why: "The page lists Alex as a PhD student and teaching assistant, so the system did not label them an instructor.",
    history: [
      { when: "Today 10:52", what: "Applied with a faculty page", icon: "link", tone: "info", detail: "riverbend.edu/accountancy/people/alex-kim" },
      { when: "Today 10:52", what: 'Labeled "Not instructor" by the system', icon: "warn", tone: "warn", detail: "The page lists a PhD student and teaching assistant." },
    ],
  },
  jnoor: {
    id: "jnoor", name: "Jamal Noor", first: "Jamal", email: "jnoor@kessler.edu", inst: "Kessler College", when: "Today 11:05", wait: "Waiting 14 min", page: "appointment-letter-2026.pdf", label: "Document", sug: "Needs review", doc: true,
    checks: [["ok", "Domain match"], ["doc", "Document, 1 page"], ["ok", "Name found"]], quote: "We are pleased to appoint Jamal Noor as Lecturer in Accountancy for the 2026–27 academic year, teaching ACCY 201 and ACCY 302.", why: "Jamal uploaded a document instead of a faculty page. Documents are always reviewed by a person, even when every check passes.",
    history: [
      { when: "Oct 12, 9:30 AM", what: "Created an account", icon: "user", tone: "info", detail: "Chose “I'll do this later” for verification." },
      { when: "Today 11:05", what: "Uploaded a document", icon: "upload", tone: "info", detail: "appointment-letter-2026.pdf" },
    ],
  },
  praman: {
    id: "praman", name: "Priya Raman", first: "Priya", email: "praman@riverbend.edu", inst: "Riverbend State University", when: "Today 10:41", wait: "Approved automatically", page: "riverbend.edu/accountancy/faculty/priya-raman", label: "Instructor", sug: "Auto-approved",
    checks: [["ok", "Domain match"], ["ok", "Page read"], ["ok", "Name found"]], quote: "Priya Raman, Assistant Professor of Accountancy, teaches Intermediate Accounting and Data Analytics.", why: "Shown for spot checks. The page lists Priya as an assistant professor who teaches.",
    history: [
      { when: "Oct 17, 2025", what: "Approved automatically", icon: "ok", tone: "ok", detail: "Domain, page and title matched." },
      { when: "Today 10:41", what: "Renewed automatically", icon: "ok", tone: "ok", detail: "Same faculty page, checked again." },
    ],
  },
};

export const APPLICANT_ORDER = ["mblake", "akim", "jnoor", "praman"];

export const DECLINE_REASONS = ["Not an instructor (student or staff)", "Name isn't on the page", "Page isn't on a school website", "Something else"];

export const VERIFY_MESSAGES = {
  decline: "Thanks for applying. We couldn't confirm from your page that you teach a course, so we can't unlock teaching notes yet. If you're the instructor of record for a course, reply with a page that shows it, like a course schedule or syllabus.",
  doc: "Thanks for applying. We couldn't use the document you sent. Could you reply with a recent appointment letter, teaching contract, or course schedule that shows your name and that you teach?",
  link: ML,
};

"use client";

import { Progress } from "@base-ui/react/progress";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Info,
  LoaderCircle,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Trash2,
  TriangleAlert,
  Trophy,
  Upload,
  UserPlus,
  X,
  Circle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { disciplines, palettesFor, resourceHref, type DisciplineKey, type FileIconName, type LicenseName, type ResourceDetail, type ResourceType } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { PATTERN_LABEL, patternSlugFor } from "@/lib/pattern";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, RadioCards, Select, TextField } from "@/components/ui/controls";
import { DataIcon } from "@/components/ui/DataIcon";
import { infoToast } from "@/components/ui/overlays";
import { Illustration } from "@/components/site/Illustration";
import { PatternCover } from "@/components/site/PatternCover";
import { signInHref } from "@/components/site/SiteHeader";
import styles from "./Contribute.module.css";

// ---------- Model ----------

type Status = "uploading" | "accepted" | "flagged" | "rejected";
type Phase = "empty" | "reading" | "uploaded" | "drafted";

interface Upload {
  id: number;
  name: string;
  meta: string;
  icon: FileIconName;
  role: string;
  anyone: boolean;
  aiRole: boolean;
  status: Status;
  pct: number;
  final: Exclude<Status, "uploading">;
  msg: string;
}

interface AuthorRow {
  id: string;
  name: string;
  title: string;
  inst: string;
  link: string;
  you?: boolean;
  editing?: boolean;
  isNew?: boolean;
  found?: boolean;
}

type AiKey = "title" | "type" | "disc" | "level" | "time" | "summary" | "objectives" | "tools" | "topics";

interface State {
  n: number;
  phase: Phase;
  autofill: boolean;
  readStep: number;
  dragOver: boolean;
  drafted: boolean;
  seedN: number;
  pal: number;
  lic: number;
  type: ResourceType;
  discs: DisciplineKey[];
  cover: DisciplineKey | null;
  level: string;
  time: string;
  title: string;
  summary: string;
  objectives: string[];
  tools: string[];
  topics: string[];
  toolDraft: string;
  topicDraft: string;
  authors: AuthorRow[];
  corresponding: string;
  showErrors: boolean;
  nextId: number;
  uploads: Upload[];
  ai: Partial<Record<AiKey, boolean | "check">>;
  attest: boolean[];
  awards: boolean;
}

const GATED = ["Teaching note", "Solution"];
const ROLES = ["Case", "Dataset", "Teaching note", "Solution", "Exhibit", "Slides", "Starter file", "Instructions", "Other"];
const LEVELS = ["Introductory undergraduate", "Upper undergraduate", "Graduate", "MBA"];
const STEP_LABELS = ["Files", "Basics", "Authors", "License", "Review"];
const LICENSES: { code: LicenseName; name: string; rec?: boolean; text: string }[] = [
  { code: "CC BY 4.0", name: "Attribution", rec: true, text: "Others can share and adapt your work for any purpose, including commercial use, as long as they credit you." },
  { code: "CC BY-NC 4.0", name: "Attribution-NonCommercial", text: "Others can share and adapt your work with credit, but not for commercial purposes." },
  { code: "CC BY-NC-SA 4.0", name: "Attribution-NonCommercial-ShareAlike", text: "Others can share and adapt your work with credit, not commercially, and must share their versions under the same license." },
];
const ATTESTATIONS = [
  "I have the right to share these materials.",
  "They contain no student records or other personal data.",
  "Company information is public or used with permission.",
  "They have not been published elsewhere under a copyright transfer, or I have permission to share them.",
];

const SAMPLE = [
  { name: "genai-monthly-close-case.pdf", meta: "PDF, 1.4 MB" },
  { name: "prompt-log-exhibit.pdf", meta: "PDF, 880 KB", flag: "Possible personal data: 2 email addresses on page 3. Mask them before you submit, or an admin will ask you to." },
  { name: "genai-close-teaching-note.pdf", meta: "PDF, 2.1 MB" },
  { name: "close-workpapers.xlsm", meta: "XLSM, 3.2 MB" },
];

function iconFor(role: string, name: string): FileIconName {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (role === "Teaching note") return "book-open";
  if (role === "Solution") return "key-round";
  if (/^(xlsx|xls|xlsm|csv)$/.test(ext)) return "file-spreadsheet";
  if (ext === "ipynb") return "file-code";
  return "file-text";
}

function makeFile(f: { name: string; meta: string; flag?: string }, id: number): Upload {
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  let final: Upload["final"] = "accepted";
  let msg = "";
  if (/^(xlsm|docm|pptm|xlsb)$/.test(ext)) {
    final = "rejected";
    msg = "Files with macros can't be shared. Save it as .xlsx and upload it again.";
  } else if (/^(exe|dmg|app|bat|sh|js|msi)$/.test(ext)) {
    final = "rejected";
    msg = "This file type can't be shared.";
  } else if (f.flag) {
    final = "flagged";
    msg = f.flag;
  }
  return { id, name: f.name, meta: f.meta, icon: iconFor("", f.name), role: "", anyone: true, aiRole: false, status: "uploading", pct: 0, final, msg };
}

function guessRole(name: string) {
  const low = name.toLowerCase();
  const ext = low.split(".").pop() || "";
  if (/teaching|note/.test(low)) return "Teaching note";
  if (/solution|answer|key/.test(low)) return "Solution";
  if (/exhibit|appendix/.test(low)) return "Exhibit";
  if (/slide/.test(low) || /^pptx?$/.test(ext)) return "Slides";
  if (/^(csv|xlsx|xls)$/.test(ext)) return "Dataset";
  if (ext === "ipynb") return "Starter file";
  if (/instruction|assignment/.test(low)) return "Instructions";
  return "Case";
}

function roleFiles(list: Upload[], existing: Upload[] = []): Upload[] {
  let caseSeen = existing.some((f) => f.role === "Case");
  return list.map((f) => {
    if (f.final === "rejected" || f.role) return f;
    let role = guessRole(f.name);
    if (role === "Case") {
      if (caseSeen) role = "Other";
      caseSeen = true;
    }
    return { ...f, role, anyone: !GATED.includes(role), aiRole: true, icon: iconFor(role, f.name) };
  });
}

const DRAFT: Partial<State> = {
  title: "Generative AI in the Monthly Close",
  type: "Case",
  discs: ["emtech", "ais"],
  cover: null,
  level: "MBA",
  time: "90 minutes",
  pal: 0,
  summary: "Students review how a controller's team used a generative AI assistant during the monthly close and decide which uses need new review controls.",
  objectives: ["Map where generative AI fits in a monthly close checklist.", "Find errors in AI-drafted reconciliation notes and journal entry explanations.", "Design review controls for AI-assisted close work."],
  tools: ["Generative AI", "Excel"],
  topics: ["monthly close", "internal controls", "AI governance"],
  ai: { title: true, type: true, disc: true, level: "check", time: true, summary: true, objectives: true, tools: true, topics: true },
};

const CO_AUTHORS: AuthorRow[] = [{ id: "so", name: "Sam Ortega", title: "Assistant Professor of Information Systems", inst: "Prairie Lakes College", link: "", found: true }];

function fileMeta(f: File) {
  const ext = (f.name.split(".").pop() || "file").toUpperCase();
  const kb = (f.size || 0) / 1024;
  return ext + ", " + (kb < 1024 ? Math.max(1, Math.round(kb)) + " KB" : (kb / 1024).toFixed(1) + " MB");
}

const DraftedTag = ({ check }: { check?: boolean }) =>
  check ? (
    <Badge tone="warn" icon={<TriangleAlert size={12} aria-hidden />} className={styles.aiTag}>
      Check this
    </Badge>
  ) : (
    <Badge tone="info" icon={<Sparkles size={12} aria-hidden />} className={styles.aiTag}>
      Drafted
    </Badge>
  );

const SourceNote = ({ children }: { children: React.ReactNode }) => (
  <p className={styles.source}>
    <FileText size={13} aria-hidden />
    <span>{children}</span>
  </p>
);

// ---------- Component ----------

export function ContributeView() {
  const demo = useDemo();
  const me = demo.me;
  const fresh = (): State => ({
    n: 1,
    phase: "empty",
    autofill: true,
    readStep: 0,
    dragOver: false,
    drafted: false,
    seedN: 0,
    pal: 0,
    lic: 0,
    type: "Case",
    discs: [],
    cover: null,
    level: "Upper undergraduate",
    time: "",
    title: "",
    summary: "",
    objectives: [""],
    tools: [],
    topics: [],
    toolDraft: "",
    topicDraft: "",
    authors: [{ id: "me", name: me.name, you: true, title: me.title, inst: me.inst, link: "" }],
    corresponding: "me",
    showErrors: false,
    nextId: 20,
    uploads: [],
    ai: {},
    attest: ATTESTATIONS.map(() => false),
    awards: false,
  });
  const [s, setS] = useState<State>(fresh);
  const [outcome, setOutcome] = useState<"review" | "published" | null>(null);
  const upd = (patch: Partial<State> | ((st: State) => Partial<State>)) => setS((st) => ({ ...st, ...(typeof patch === "function" ? patch(st) : patch) }));
  const fileRef = useRef<HTMLInputElement>(null);
  const readTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const summaryRef = useRef<HTMLDivElement>(null);
  const uploading = s.uploads.some((f) => f.status === "uploading");

  // Simulated upload progress.
  useEffect(() => {
    if (!uploading) return;
    const t = setInterval(() => {
      setS((st) => ({
        ...st,
        uploads: st.uploads.map((f) => {
          if (f.status !== "uploading") return f;
          const pct = Math.min(100, f.pct + 6 + (f.id % 3) * 4);
          return pct >= 100 ? { ...f, pct: 100, status: f.final } : { ...f, pct };
        }),
      }));
    }, 200);
    return () => clearInterval(t);
  }, [uploading]);
  useEffect(() => () => clearTimeout(readTimer.current), []);

  const scrollTop = () => window.scrollTo({ top: 0 });
  const goTo = (n: number) => {
    upd({ n, showErrors: false });
    scrollTop();
  };

  const read = () => {
    clearTimeout(readTimer.current);
    const tick = (k: number) => {
      readTimer.current = setTimeout(
        () => {
          if (k < 4) {
            upd({ readStep: k + 1 });
            tick(k + 1);
            return;
          }
          upd((st) => ({ ...DRAFT, uploads: roleFiles(st.uploads), authors: st.authors.filter((x) => x.you).concat(CO_AUTHORS), phase: "drafted", drafted: true }));
        },
        k === 0 ? 600 : 900,
      );
    };
    tick(0);
  };

  const addFiles = (list: { name: string; meta: string; flag?: string }[]) => {
    const first = s.phase === "empty";
    let files = list.map((f, i) => makeFile(f, s.nextId + i));
    if (!first && s.drafted && s.autofill) files = roleFiles(files, s.uploads);
    upd({
      uploads: s.uploads.concat(files),
      nextId: s.nextId + files.length,
      phase: first ? (s.autofill ? "reading" : "uploaded") : s.phase,
      readStep: first ? 0 : s.readStep,
      showErrors: false,
      dragOver: false,
    });
    if (first && s.autofill) read();
  };

  const updFile = (id: number, patch: Partial<Upload>) => upd((st) => ({ uploads: st.uploads.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const updAuthor = (i: number, patch: Partial<AuthorRow>) => upd((st) => ({ authors: st.authors.map((a, j) => (j === i ? { ...a, ...patch } : a)) }));
  const unAi = (k: AiKey) => (st: State) => ({ ai: { ...st.ai, [k]: false } });

  const focusId = (id: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.getElementById(id)?.focus();
  };

  const errorsFor = (n: number) => {
    const out: { text: string; go: (e?: React.MouseEvent) => void }[] = [];
    if (n === 1) {
      if (!s.uploads.length) out.push({ text: "Add at least one file", go: focusId("c-drop") });
      if (s.phase === "reading") out.push({ text: "Wait while we finish reading your files", go: focusId("c-drop") });
      s.uploads.filter((f) => f.status === "rejected").forEach((f) => out.push({ text: "Remove " + f.name + ", which can't be shared", go: focusId("up-" + f.id) }));
      s.uploads.filter((f) => f.status === "uploading").forEach((f) => out.push({ text: "Wait for " + f.name + " to finish uploading", go: focusId("up-" + f.id) }));
      if (s.phase !== "reading") s.uploads.filter((f) => f.final !== "rejected" && f.status !== "uploading" && !f.role).forEach((f) => out.push({ text: "Choose a role for " + f.name, go: focusId("up-" + f.id) }));
    }
    if (n === 2) {
      if (!s.title.trim()) out.push({ text: "Enter a title", go: focusId("c-title") });
      if (!s.discs.length) out.push({ text: "Choose at least one discipline", go: focusId("c-disc") });
      if (!s.summary.trim()) out.push({ text: "Enter a summary", go: focusId("c-sum") });
      if (!s.objectives.some((o) => o.trim())) out.push({ text: "Add at least one learning objective", go: focusId("c-obj-0") });
    }
    if (n === 3) s.authors.forEach((a, i) => !a.name.trim() && out.push({ text: "Enter a name for author " + (i + 1), go: focusId("a-name-" + a.id) }));
    if (n === 5 && !s.attest.every(Boolean)) out.push({ text: "Check all four statements before you submit", go: focusId("attest") });
    return out;
  };

  const coverD: DisciplineKey = s.cover || s.discs[0] || "other";
  const pals = palettesFor(coverD);
  const pal = Math.min(s.pal, pals.length - 1);
  const seed = "TME-0171" + (s.seedN ? "-" + s.seedN : "");
  const discLabels = s.discs.map((k) => disciplines.find((d) => d.d === k)?.label).filter(Boolean) as string[];
  const discLabel = discLabels.join(", ") || "Discipline";
  const names = s.authors.map((a) => a.name).filter(Boolean);
  const authorNames = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0] || "";
  const caseName = s.uploads.find((f) => f.role === "Case")?.name || "your case file";
  const noteName = s.uploads.find((f) => f.role === "Teaching note")?.name || "your teaching note";

  const buildDetail = (status: "review" | "published"): ResourceDetail & { seed: string; palette: string[] } => {
    const insts = s.authors.map((a) => a.inst);
    const same = insts.every((x) => x === insts[0]);
    const byline = same
      ? names.map((n, i) => ({ name: n, after: i < names.length - 1 ? (i === names.length - 2 ? " and " : ", ") : ", " + insts[0] }))
      : s.authors.map((a, i) => ({ name: a.name, after: ", " + a.inst + (i < s.authors.length - 1 ? ", and " : "") }));
    const apa = names.map((n) => {
      const p = n.split(" ");
      return p[p.length - 1] + ", " + p[0][0] + ".";
    });
    const apaStr = apa.length === 1 ? apa[0] : apa.slice(0, -1).join(", ") + ", & " + apa[apa.length - 1];
    const files = s.uploads
      .filter((f) => f.status !== "rejected")
      .map((f) => {
        const [format, size] = f.meta.split(", ");
        return { role: f.role || "Other", icon: f.icon, name: f.name, format, size, gated: !f.anyone, flag: status === "review" && f.status === "flagged" ? "Flagged: possible personal data" : "" };
      });
    const pub = files.filter((f) => !f.gated).length;
    const lic = LICENSES[s.lic].code;
    const title = s.title.trim() || "Untitled";
    return {
      id: "TME-0171",
      d: coverD,
      seed,
      palette: pals[pal].colors,
      discipline: discLabels.join(", ") || "Other",
      type: s.type,
      aboutTitle: "About this " + s.type.toLowerCase(),
      title,
      summary: s.summary,
      byline,
      about: s.summary,
      meta: (status === "review" ? "Submitted" : "Published") + " October 2026 · Version 1 · " + lic,
      objectives: s.objectives.filter((o) => o.trim()),
      time: s.time,
      level: s.level,
      tested: "Spring 2026",
      tools: s.tools,
      authors: s.authors.map((a) => ({ initials: a.name.split(" ").map((x) => x[0]).join(""), name: a.name, title: a.title, inst: a.inst })),
      files,
      totalAll: files.length + " files",
      allLabel: "Download all " + files.length + " files",
      allMeta: "One ZIP file",
      publicMeta: pub + " files in one ZIP",
      cite: { lead: apaStr + " (2026). ", italic: title.charAt(0) + title.slice(1).toLowerCase(), tail: " (Version 1) [Teaching " + s.type.toLowerCase() + "]. Teaching Materials Exchange." + (status === "review" ? "" : " https://tme.illinois.edu/r/0171") },
      citeNote: status === "review" ? "The link is added when this is published." : "",
      license: lic,
      downloads: 0,
      courses: 0,
      versions: "1 version",
      versionList: [{ v: "Version 1", date: "October 2026", note: status === "review" ? "Submitted for review." : "First published." }],
      related: ["TME-0166", "TME-0127", "TME-0109"],
    };
  };

  const next = () => {
    if (errorsFor(s.n).length) {
      upd({ showErrors: true });
      scrollTop();
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    if (s.n === 3) upd((st) => ({ authors: st.authors.map((a) => ({ ...a, editing: false, isNew: false })) }));
    if (s.n === 5) {
      const result = "review";
      demo.set({ submitted: { status: result, detail: buildDetail(result) } });
      setOutcome(result);
      scrollTop();
      return;
    }
    goTo(s.n + 1);
  };

  const saveExit = () => infoToast("Draft saved. You can finish it from My resources.");

  // ---------- Gate for people who can't share yet ----------
  if (demo.auth !== "verified") {
    const gate = {
      out: { Icon: Lock, note: "Sign in with your school email, then verify you teach. Most instructors are verified in a few seconds.", label: "Sign in to start", href: signInHref("/contribute", { verify: true }) },
      member: { Icon: Shield, note: "Verify you teach first. Most instructors are verified in a few seconds.", label: "Verify you teach", href: "/verify" },
      review: { Icon: Clock, note: "Your verification is in review. A person will check it within 2 business days, and then you can share.", label: "See verification status", href: "/verify?state=review" },
      renewal: { Icon: RefreshCw, note: "Your verification is due for renewal. Re-check your page to share materials.", label: "Re-check your page", href: "/verify?state=expired" },
    }[demo.auth];
    return (
      <div className={styles.page}>
        <div className={styles.narrowCenter}>
          <Illustration name="contribute" className={styles.gateArt} eager />
          <p className={styles.eyebrow}>Contribute</p>
          <h1 className={styles.h1}>Share your teaching materials</h1>
          <p className={styles.lead}>Verified instructors can share cases, data exercises, and teaching modules. Your work is published under a Creative Commons license with full credit to you.</p>
          <p className={styles.gateNote}>
            <gate.Icon size={18} aria-hidden />
            <span>{gate.note}</span>
          </p>
          <ButtonLink href={gate.href} size="lg" className={styles.gateBtn}>
            {gate.label}
            <ArrowRight size={16} aria-hidden />
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ---------- Submitted ----------
  if (outcome) {
    const flagged = s.uploads.some((f) => f.status === "flagged");
    return (
      <div className={styles.page}>
        <div className={styles.narrowCenter}>
          <Illustration name="contribute-done" className={styles.gateArt} eager />
          <Badge tone="info" icon={<Clock size={16} aria-hidden />} className={styles.stateBadge}>
            In review
          </Badge>
          <h1 className={styles.h1Result}>Thanks. Your materials are in review.</h1>
          <p role="status" className={styles.lead}>
            This is your first contribution, so a person on our team will check it within 2 business days.
          </p>
          <div className={styles.summaryCard}>
            <PatternCover discipline={coverD} seed={seed} palette={pals[pal].colors} className={styles.summaryCover} cellSize={20} />
            <div className={styles.summaryCardText}>
              <span className={styles.kicker}>
                {s.type} · {discLabel}
              </span>
              <span className={styles.summaryCardTitle}>{s.title.trim() || "Your title"}</span>
              <span className={styles.summaryCardAuthors}>{authorNames}</span>
            </div>
          </div>
          <h2 className={styles.h2small}>What happens next</h2>
          <ol className={styles.nextList}>
            <li>{flagged ? "We check the files and details, including the flagged file." : "We check the files and details."}</li>
            <li>We email you at {me.email} when it&apos;s published, or if something needs a change.</li>
            <li>Once it&apos;s published, it appears in Browse and on your author page, ready to cite.</li>
          </ol>
          <div className={styles.resultActions}>
            <ButtonLink href={resourceHref("TME-0171", { own: true })} size="lg">
              View your resource page
            </ButtonLink>
            <ButtonLink href="/account#resources" variant="secondary" size="lg">
              Go to My resources
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const errors = s.showErrors ? errorsFor(s.n) : [];
  const err = (t: string) => errors.some((e) => e.text === t);
  const ai = s.ai;
  const anyAi = Object.values(ai).some(Boolean);
  const live = s.uploads.filter((f) => f.final !== "rejected");
  const found = s.authors.filter((x) => x.found).map((x) => x.name);
  const wide = s.n === 2;

  return (
    <div className={styles.page}>
      <div className={wide ? styles.wide : styles.narrow}>
        <div className={styles.titleRow}>
          <h1 className={`${styles.h1} ${styles.titleH1}`}>
            <Illustration name="contribute" className={styles.titleArt} eager />
            Share your materials
          </h1>
          <span className={styles.saved}>
            <Check size={16} aria-hidden />
            Draft saved at 10:42 AM
          </span>
        </div>

        {/* Stepper */}
        <nav aria-label="Steps" className={styles.stepper}>
          <p className={styles.stepNow}>
            Step {s.n} of 5: {STEP_LABELS[s.n - 1]}
          </p>
          <ol className={styles.steps}>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const done = n < s.n;
              const current = n === s.n;
              return (
                <li key={label} className={[styles.stepItem, done || current ? styles.stepOn : ""].join(" ")}>
                  {done ? (
                    <button type="button" className={styles.stepBtn} onClick={() => goTo(n)}>
                      <Check size={14} aria-hidden />
                      {label}
                      <span className="sr-only">, done</span>
                    </button>
                  ) : (
                    <span className={[styles.stepLabel, current ? styles.stepCurrent : ""].join(" ")} aria-current={current ? "step" : undefined}>
                      {n}. {label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {errors.length ? (
          <div role="alert" tabIndex={-1} ref={summaryRef} className={styles.errorSummary}>
            <CircleAlert size={20} aria-hidden className={styles.errorIcon} />
            <div>
              <p className={styles.errorTitle}>{errors.length === 1 ? "There is 1 problem on this step" : `There are ${errors.length} problems on this step`}</p>
              <ul className={styles.errorList}>
                {errors.map((e) => (
                  <li key={e.text}>
                    <a href="#" onClick={e.go}>
                      {e.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className={wide ? styles.basicsGrid : undefined}>
          <div className={styles.stepBody}>
            {/* ---------- Step 1: Files ---------- */}
            {s.n === 1 ? (
              <section aria-labelledby="s1-h">
                <h2 id="s1-h" className={styles.h2}>
                  Files
                </h2>
                <p className={styles.stepLead}>Add everything an instructor needs to teach this: the case, data, teaching note, and solution. Teaching notes and solutions start as verified instructors only, so students can&apos;t find them.</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    const fl = Array.from(e.target.files || []);
                    e.target.value = "";
                    if (fl.length) addFiles(fl.map((f) => ({ name: f.name, meta: fileMeta(f) })));
                  }}
                />
                <div
                  className={[s.phase === "empty" ? styles.dropBig : styles.dropSmall, s.dragOver ? styles.dropOver : ""].join(" ")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!s.dragOver) upd({ dragOver: true });
                  }}
                  onDragLeave={() => upd({ dragOver: false })}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fl = Array.from(e.dataTransfer?.files || []);
                    if (!fl.length) return upd({ dragOver: false });
                    addFiles(fl.map((f) => ({ name: f.name, meta: fileMeta(f) })));
                  }}
                >
                  {s.phase === "empty" ? (
                    <>
                      <span className={styles.dropIconBig}>
                        <Upload size={22} aria-hidden />
                      </span>
                      <h3 className={styles.dropTitle}>Drop your files here</h3>
                      <p className={styles.dropLine}>{s.autofill ? "We'll read them and fill in the rest of the form for you. You check everything before you submit." : "Add the case, data, teaching note, and solution."}</p>
                      <Button id="c-drop" onClick={() => fileRef.current?.click()}>
                        Choose files
                      </Button>
                      <p className={styles.dropTypes}>PDF, Word, Excel, CSV, PowerPoint, and Jupyter notebooks</p>
                    </>
                  ) : (
                    <>
                      <Upload size={18} aria-hidden className={styles.dropIconSmall} />
                      <span className={styles.dropMore}>Drop more files here, or</span>
                      <Button id="c-drop" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                        Choose files
                      </Button>
                    </>
                  )}
                </div>

                {s.phase === "empty" ? (
                  <>
                    <div className={styles.autofillBox}>
                      <Checkbox
                        size="md"
                        checked={s.autofill}
                        onCheckedChange={(v) => upd({ autofill: v })}
                        description="We draft the title, summary, learning objectives, authors, and file roles. Nothing is published until you check it and submit."
                      >
                        <Sparkles size={17} aria-hidden className={styles.sparkle} />
                        Fill in the form from my files
                      </Checkbox>
                    </div>
                    <button type="button" className={styles.sampleBtn} onClick={() => addFiles(SAMPLE)}>
                      <FileText size={18} aria-hidden />
                      <span>
                        <span className={styles.sampleTitle}>Prototype only: use the sample files</span>
                        <span className={styles.sampleSub}>Stands in for dropping the Generative AI case files.</span>
                      </span>
                    </button>
                  </>
                ) : null}

                {s.phase === "reading" ? (
                  <div className={styles.reading} aria-live="polite">
                    <div className={styles.readingHead}>
                      <Sparkles size={18} aria-hidden className={styles.sparkle} />
                      <div>
                        <p className={styles.readingTitle}>Reading your files</p>
                        <p className={styles.readingSub}>This takes a few seconds. You can keep adding files.</p>
                      </div>
                    </div>
                    <ol className={styles.readList}>
                      {["Reading " + s.uploads.length + (s.uploads.length === 1 ? " file" : " files"), "Finding the title, summary, and learning objectives", "Finding authors and institutions", "Sorting file roles and who can download them"].map((label, i) => (
                        <li key={label}>
                          {i < s.readStep ? <CircleCheck size={20} className={styles.okIcon} aria-hidden /> : i === s.readStep ? <LoaderCircle size={20} className={styles.spin} aria-hidden /> : <Circle size={20} className={styles.waitIcon} aria-hidden />}
                          <span className={styles.readLabel}>{label}</span>
                          <span className={styles.readState}>{i < s.readStep ? "Done" : i === s.readStep ? "Working" : "Next"}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {s.phase === "drafted" && s.drafted ? (
                  <div className={styles.drafted}>
                    <div className={styles.readingHead}>
                      <Sparkles size={18} aria-hidden className={styles.sparkle} />
                      <div>
                        <p className={styles.readingTitle}>We filled in the form from your files</p>
                        <p className={styles.readingSub}>Check it on the next steps. Anything we drafted is marked Drafted until you change or confirm it.</p>
                      </div>
                    </div>
                    <ul className={styles.draftList}>
                      <li>
                        <Check size={16} aria-hidden className={styles.draftOk} />
                        <span>
                          <strong>Basics</strong>
                          Title, type, discipline, summary, {s.objectives.filter((o) => o.trim()).length} learning objectives, tools, and topics
                        </span>
                      </li>
                      <li>
                        <Check size={16} aria-hidden className={styles.draftOk} />
                        <span>
                          <strong>Authors</strong>
                          {found.length ? found.join(" and ") + ", from the title page of " + caseName : "You"}
                        </span>
                      </li>
                      <li>
                        <Check size={16} aria-hidden className={styles.draftOk} />
                        <span>
                          <strong>Files</strong>
                          Roles and who can download, for {live.length} {live.length === 1 ? "file" : "files"}
                        </span>
                      </li>
                      {ai.level === "check" ? (
                        <li>
                          <TriangleAlert size={16} aria-hidden className={styles.draftWarn} />
                          <span>
                            <strong>Needs a closer look</strong>
                            Course level. Your teaching note mentions two levels.
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}

                {s.uploads.length ? (
                  <ul className={styles.uploads}>
                    {s.uploads.map((f) => {
                      const controls = f.status !== "rejected" && s.phase !== "reading" && f.status !== "uploading";
                      const warn = controls && f.anyone && GATED.includes(f.role);
                      return (
                        <li key={f.id} id={"up-" + f.id} tabIndex={-1} className={styles.upload}>
                          <div className={styles.uploadHead}>
                            <span className={styles.fileIcon}>
                              <DataIcon name={f.icon} size={18} />
                            </span>
                            <span className={styles.uploadName}>
                              <span className={styles.uploadFile}>{f.name}</span>
                              <span className={styles.uploadMeta}>{f.meta}</span>
                            </span>
                            <Button variant="quiet" aria-label={"Remove " + f.name} className={styles.removeBtn} onClick={() => upd((st) => ({ uploads: st.uploads.filter((x) => x.id !== f.id) }))}>
                              <Trash2 size={16} aria-hidden />
                              Remove
                            </Button>
                          </div>

                          {f.status === "uploading" ? (
                            <Progress.Root value={f.pct} className={styles.progress} aria-label={"Uploading " + f.name}>
                              <Progress.Track className={styles.track}>
                                <Progress.Indicator className={styles.indicator} />
                              </Progress.Track>
                              <span className={styles.pct}>Uploading, {Math.round(f.pct)}%</span>
                            </Progress.Root>
                          ) : null}
                          {f.status === "accepted" ? (
                            <p className={styles.accepted}>
                              <CircleCheck size={16} aria-hidden />
                              Accepted
                            </p>
                          ) : null}
                          {f.status === "flagged" ? (
                            <div className={styles.flagged}>
                              <TriangleAlert size={17} aria-hidden />
                              <span>
                                <strong>Flagged.</strong> {f.msg}{" "}
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    infoToast("Opens a short guide to masking personal data in PDFs.");
                                  }}
                                >
                                  How to fix this
                                </a>
                              </span>
                            </div>
                          ) : null}
                          {f.status === "rejected" ? (
                            <div className={styles.rejected}>
                              <CircleX size={17} aria-hidden />
                              <span>
                                <strong>Rejected.</strong> {f.msg}
                              </span>
                            </div>
                          ) : null}

                          {controls ? (
                            <div className={styles.fileControls}>
                              <div className={styles.roleField}>
                                <Select
                                  label={
                                    <span className={styles.labelRow}>
                                      Role
                                      {f.aiRole ? <DraftedTag /> : null}
                                    </span>
                                  }
                                  value={f.role || "none"}
                                  onValueChange={(role) => {
                                    if (role === "none") return;
                                    updFile(f.id, { role, aiRole: false, icon: iconFor(role, f.name), anyone: GATED.includes(role) ? false : f.anyone });
                                  }}
                                  options={[...(f.role ? [] : [{ value: "none", label: "Choose a role" }]), ...ROLES.map((r) => ({ value: r, label: r }))]}
                                />
                              </div>
                              <RadioCards
                                label="Who can download"
                                compact
                                layout="row"
                                value={f.anyone ? "anyone" : "verified"}
                                onValueChange={(v) => updFile(f.id, { anyone: v === "anyone" })}
                                options={[
                                  { value: "anyone", label: "Anyone" },
                                  { value: "verified", label: "Verified instructors only" },
                                ]}
                              />
                            </div>
                          ) : null}
                          {warn ? (
                            <div role="alert" className={styles.solutionWarn}>
                              <TriangleAlert size={17} aria-hidden />
                              <span>Anyone, including students, will be able to download this {(f.role || "file").toLowerCase()}.</span>
                              <Button variant="secondary" size="sm" onClick={() => updFile(f.id, { anyone: false })}>
                                Set to verified instructors only
                              </Button>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            ) : null}

            {/* ---------- Step 2: Basics ---------- */}
            {s.n === 2 ? (
              <section aria-labelledby="s2-h">
                <h2 id="s2-h" className={styles.h2}>
                  Basics
                </h2>
                <p className={styles.stepLead}>All fields are required unless marked optional.</p>
                {anyAi ? (
                  <div className={styles.aiBanner}>
                    <Sparkles size={18} aria-hidden className={styles.sparkle} />
                    <p>
                      <strong>We drafted these from your files.</strong> Check each one. Fields marked Drafted haven&apos;t been changed or confirmed by you yet.{ai.level === "check" ? " Course level needs a closer look." : ""}
                    </p>
                    <button type="button" className={styles.linkBtn} onClick={() => upd({ ai: {} })}>
                      Mark all as checked
                    </button>
                  </div>
                ) : null}

                <div className={styles.fields}>
                  <div>
                    <TextField
                      id="c-title"
                      label={<span className={styles.labelRow}>Title{ai.title ? <DraftedTag /> : null}</span>}
                      value={s.title}
                      onValueChange={(v) => upd((st) => ({ title: v, ...unAi("title")(st) }))}
                      error={err("Enter a title") ? "Enter a title" : undefined}
                    />
                    {ai.title ? (
                      <>
                        <SourceNote>From the title page of {caseName}</SourceNote>
                        <div className={styles.alts}>
                          <span className={styles.altsLabel}>Other ideas:</span>
                          {["AI in the Close: Reviewing a Controller's Prompt Log", "Halverson Supply and the AI-Assisted Close"].map((t) => (
                            <button key={t} type="button" className={styles.alt} onClick={() => upd({ title: t })}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <RadioCards<ResourceType>
                    label={<span className={styles.labelRow}>Type{ai.type ? <DraftedTag /> : null}</span>}
                    compact
                    layout="row"
                    value={s.type}
                    onValueChange={(v) => upd((st) => ({ type: v, ...unAi("type")(st) }))}
                    options={(["Case", "Data exercise", "Teaching module"] as ResourceType[]).map((t) => ({ value: t, label: t }))}
                  />

                  <div>
                    <TextField
                      id="c-sum"
                      label={<span className={styles.labelRow}>Summary{ai.summary ? <DraftedTag /> : null}</span>}
                      description="One or two sentences. It appears on cards and in search results."
                      multiline
                      rows={3}
                      maxLength={300}
                      value={s.summary}
                      onValueChange={(v) => upd((st) => ({ summary: v, ...unAi("summary")(st) }))}
                      error={err("Enter a summary") ? "Enter a summary" : undefined}
                    />
                    <div className={styles.underRow}>
                      {ai.summary ? <SourceNote>Written from the introduction of {caseName}. Rewrite it in your own words if you like.</SourceNote> : <span />}
                      <span className={styles.count}>{s.summary.length} of 300 characters</span>
                    </div>
                  </div>

                  <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>
                      <span className={styles.labelRow}>Disciplines{ai.disc ? <DraftedTag /> : null}</span>
                    </legend>
                    <p className={styles.help}>Choose all that apply.</p>
                    {err("Choose at least one discipline") ? (
                      <p className={styles.inlineError}>
                        <CircleAlert size={16} aria-hidden />
                        Choose at least one discipline
                      </p>
                    ) : null}
                    <div className={styles.chips}>
                      {disciplines.map((d, i) => {
                        const on = s.discs.includes(d.d);
                        return (
                          <button
                            key={d.d}
                            id={i === 0 ? "c-disc" : undefined}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            className={[styles.discChip, on ? styles.discChipOn : ""].join(" ")}
                            onClick={() => upd((st) => ({ discs: on ? st.discs.filter((k) => k !== d.d) : st.discs.concat([d.d]), pal: 0, ai: { ...st.ai, disc: false } }))}
                          >
                            {on ? <Check size={15} aria-hidden /> : null}
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className={styles.twoCol}>
                    <div>
                      <Select
                        label={<span className={styles.labelRow}>Course level{ai.level === "check" ? <DraftedTag check /> : ai.level ? <DraftedTag /> : null}</span>}
                        value={s.level}
                        onValueChange={(v) => upd((st) => ({ level: v, ...unAi("level")(st) }))}
                        options={LEVELS.map((l) => ({ value: l, label: l }))}
                      />
                      {ai.level === "check" ? (
                        <div className={styles.checkThis}>
                          <p>Your teaching note mentions both MBA and graduate electives.</p>
                          <button type="button" className={styles.linkBtn} onClick={() => upd((st) => unAi("level")(st))}>
                            Keep {s.level}
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <TextField label={<span className={styles.labelRow}>Class time{ai.time ? <DraftedTag /> : null}</span>} value={s.time} onValueChange={(v) => upd((st) => ({ time: v, ...unAi("time")(st) }))} placeholder="75 minutes" />
                      {ai.time ? <SourceNote>From the class plan in {noteName}</SourceNote> : null}
                    </div>
                  </div>

                  <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>
                      <span className={styles.labelRow}>Learning objectives{ai.objectives ? <DraftedTag /> : null}</span>
                    </legend>
                    {ai.objectives ? <SourceNote>From {noteName}, page 2</SourceNote> : null}
                    {err("Add at least one learning objective") ? (
                      <p className={styles.inlineError}>
                        <CircleAlert size={16} aria-hidden />
                        Add at least one learning objective
                      </p>
                    ) : null}
                    <ol className={styles.objectives}>
                      {s.objectives.map((o, i) => (
                        <li key={i}>
                          <span className={styles.objN}>{i + 1}.</span>
                          <TextField
                            id={"c-obj-" + i}
                            label={"Learning objective " + (i + 1)}
                            hideLabel
                            value={o}
                            onValueChange={(v) => upd((st) => ({ objectives: st.objectives.map((x, j) => (j === i ? v : x)), ai: { ...st.ai, objectives: false } }))}
                            className={styles.objField}
                          />
                          <button type="button" className={styles.iconBtn} aria-label={"Remove objective " + (i + 1)} onClick={() => upd((st) => ({ objectives: st.objectives.filter((_, j) => j !== i), ai: { ...st.ai, objectives: false } }))}>
                            <Trash2 size={17} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ol>
                    <Button variant="quiet" className={styles.addObj} onClick={() => upd((st) => ({ objectives: st.objectives.concat([""]), ai: { ...st.ai, objectives: false } }))}>
                      <Plus size={16} aria-hidden />
                      Add objective
                    </Button>
                  </fieldset>

                  {(
                    [
                      ["tools", "toolDraft", "Tools", "Add a tool, then press Enter", false],
                      ["topics", "topicDraft", "Topic tags", "Add a topic, then press Enter", true],
                    ] as const
                  ).map(([key, draftKey, label, ph, optional]) => (
                    <div key={key} className={styles.tagField}>
                      <label htmlFor={"c-" + key} className={styles.legend}>
                        <span className={styles.labelRow}>
                          {label}
                          {optional ? <span className={styles.optional}>(optional)</span> : null}
                          {ai[key] ? <DraftedTag /> : null}
                        </span>
                      </label>
                      <div className={styles.tagBox}>
                        {s[key].map((t, i) => (
                          <span key={t + i} className={styles.tag}>
                            {t}
                            <button type="button" aria-label={"Remove " + t} onClick={() => upd((st) => ({ [key]: st[key].filter((_, j) => j !== i), ai: { ...st.ai, [key]: false } }))}>
                              <X size={15} aria-hidden />
                            </button>
                          </span>
                        ))}
                        <input
                          id={"c-" + key}
                          className={styles.tagInput}
                          placeholder={ph}
                          value={s[draftKey]}
                          onChange={(e) => upd({ [draftKey]: e.target.value } as Partial<State>)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            const v = s[draftKey].trim();
                            if (v) upd((st) => ({ [key]: st[key].concat([v]), [draftKey]: "", ai: { ...st.ai, [key]: false } }) as Partial<State>);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ---------- Step 3: Authors ---------- */}
            {s.n === 3 ? (
              <section aria-labelledby="s3-h">
                <h2 id="s3-h" className={styles.h2}>
                  Authors
                </h2>
                <p className={styles.stepLead}>List everyone who should get credit, in the order they appear in the citation.</p>
                <ol className={styles.authorList}>
                  {s.authors.map((a, i, arr) => {
                    const nameBad = s.showErrors && !a.name.trim();
                    const corr = (
                      <label className={styles.corr}>
                        <input type="radio" name="corresponding" checked={s.corresponding === a.id} onChange={() => upd({ corresponding: a.id })} className={styles.corrInput} />
                        <span className={styles.corrDot} aria-hidden="true" />
                        Corresponding author
                      </label>
                    );
                    const moves = (
                      <>
                        <button type="button" className={styles.iconBtn} disabled={i === 0} aria-label={`Move ${a.name || "author"} up`} onClick={() => upd((st) => { const x = st.authors.slice(); [x[i - 1], x[i]] = [x[i], x[i - 1]]; return { authors: x }; })}>
                          <ArrowUp size={18} aria-hidden />
                        </button>
                        <button type="button" className={styles.iconBtn} disabled={i === arr.length - 1} aria-label={`Move ${a.name || "author"} down`} onClick={() => upd((st) => { const x = st.authors.slice(); [x[i + 1], x[i]] = [x[i], x[i + 1]]; return { authors: x }; })}>
                          <ArrowDown size={18} aria-hidden />
                        </button>
                      </>
                    );
                    return (
                      <li key={a.id} className={styles.authorCard}>
                        {a.editing ? (
                          <>
                            <div className={styles.authorHead}>
                              <span className={styles.authorN}>{i + 1}</span>
                              <h3 className={styles.authorRole}>{a.you ? "You" : "Co-author"}</h3>
                              <div className={styles.authorActions}>
                                {moves}
                                {!a.you ? (
                                  <Button variant="quiet" onClick={() => upd((st) => ({ authors: st.authors.filter((_, j) => j !== i), corresponding: st.corresponding === a.id ? "me" : st.corresponding }))}>
                                    <Trash2 size={16} aria-hidden />
                                    Remove
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                            <div className={styles.authorFields}>
                              <TextField id={"a-name-" + a.id} label="Full name" value={a.name} onValueChange={(v) => updAuthor(i, { name: v })} error={nameBad ? "Enter a name" : undefined} />
                              <TextField label="Title" optional value={a.title} onValueChange={(v) => updAuthor(i, { title: v })} />
                              <TextField label="Institution" value={a.inst} onValueChange={(v) => updAuthor(i, { inst: v })} />
                              <TextField label="Profile link" optional value={a.link} onValueChange={(v) => updAuthor(i, { link: v })} placeholder="https://" />
                            </div>
                            <div className={styles.corrRow}>{corr}</div>
                            <div className={styles.authorSave}>
                              <Button
                                onClick={() => {
                                  if (!a.name.trim()) return upd({ showErrors: true });
                                  updAuthor(i, { editing: false, isNew: false, found: false });
                                }}
                              >
                                {a.isNew ? "Add co-author" : "Save"}
                              </Button>
                              <Button variant="quiet" onClick={() => (a.isNew ? upd((st) => ({ authors: st.authors.filter((_, j) => j !== i) })) : updAuthor(i, { editing: false }))}>
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={styles.authorHead}>
                              <span className={styles.authorN}>{i + 1}</span>
                              <div className={styles.authorInfo}>
                                <span className={styles.authorName}>
                                  {a.name}
                                  {a.you ? <span className={styles.you}> (you)</span> : null}
                                </span>
                                <span className={styles.authorDetail}>{[a.title, a.inst].filter(Boolean).join(", ")}</span>
                                {a.found ? (
                                  <Badge tone="info" icon={<Sparkles size={12} aria-hidden />} className={styles.foundTag}>
                                    Found in {caseName}
                                  </Badge>
                                ) : null}
                              </div>
                              <div className={styles.authorActions}>
                                {moves}
                                <Button variant="quiet" onClick={() => updAuthor(i, { editing: true })} aria-label={"Edit " + a.name}>
                                  Edit
                                </Button>
                              </div>
                            </div>
                            <div className={styles.corrRow}>{corr}</div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ol>
                <Button variant="secondary" onClick={() => upd((st) => ({ authors: st.authors.concat([{ id: "n" + st.nextId, name: "", title: "", inst: "", link: "", editing: true, isNew: true }]), nextId: st.nextId + 1 }))}>
                  <UserPlus size={16} aria-hidden />
                  Add co-author
                </Button>
              </section>
            ) : null}

            {/* ---------- Step 4: License ---------- */}
            {s.n === 4 ? (
              <section aria-labelledby="s4-h">
                <h2 id="s4-h" className={styles.h2}>
                  License
                </h2>
                <p className={styles.stepLead}>You keep the copyright. Others can share and adapt your work with credit to you.</p>
                <RadioCards
                  label="License"
                  hideLabel
                  value={String(s.lic)}
                  onValueChange={(v) => upd({ lic: Number(v) })}
                  className={styles.licenses}
                  options={LICENSES.map((l, i) => ({
                    value: String(i),
                    label: (
                      <span className={styles.licLabel}>
                        <span className={styles.licCode}>{l.code}</span>
                        <span className={styles.licName}>{l.name}</span>
                        {l.rec ? (
                          <Badge tone="ok" className={styles.rec}>
                            Recommended
                          </Badge>
                        ) : null}
                      </span>
                    ),
                    description: (
                      <>
                        <span className={styles.licText}>{l.text}</span>
                        <a
                          href="https://creativecommons.org/licenses/"
                          className={styles.licLink}
                          onClick={(e) => {
                            e.preventDefault();
                            infoToast("The full license text opens on creativecommons.org.");
                          }}
                        >
                          Read the license
                          <ExternalLink size={14} aria-hidden />
                        </a>
                      </>
                    ),
                  }))}
                />
                <p className={styles.licWarn}>
                  <Info size={17} aria-hidden />A Creative Commons license cannot be withdrawn from copies already shared.
                </p>
              </section>
            ) : null}

            {/* ---------- Step 5: Review ---------- */}
            {s.n === 5 ? (
              <section aria-labelledby="s5-h">
                <h2 id="s5-h" className={styles.h2}>
                  Review and submit
                </h2>
                <p className={styles.stepLead}>Check everything before you send it. You can edit any section.</p>
                <div className={styles.review}>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewHead}>
                      <h3>Basics</h3>
                      <button type="button" className={styles.linkBtn} onClick={() => goTo(2)}>
                        Edit<span className="sr-only"> basics</span>
                      </button>
                    </div>
                    <div className={styles.reviewBasics}>
                      <PatternCover discipline={coverD} seed={seed} palette={pals[pal].colors} className={styles.reviewCover} cellSize={24} />
                      <div>
                        <span className={styles.kicker}>
                          {s.type} · {discLabel}
                        </span>
                        <p className={styles.reviewTitle}>{s.title.trim() || "Your title"}</p>
                        <p className={styles.reviewSummary}>{s.summary}</p>
                        <p className={styles.reviewMeta}>{[s.level, s.time, s.objectives.filter((o) => o.trim()).length + " learning objectives", s.tools.join(", ")].filter(Boolean).join(" · ")}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewHead}>
                      <h3>Authors</h3>
                      <button type="button" className={styles.linkBtn} onClick={() => goTo(3)}>
                        Edit<span className="sr-only"> authors</span>
                      </button>
                    </div>
                    <ol className={styles.reviewAuthors}>
                      {s.authors.map((a) => (
                        <li key={a.id}>
                          {[a.name || "Unnamed author", a.inst].filter(Boolean).join(", ")}
                          {s.corresponding === a.id ? <span className={styles.muted}> (corresponding author)</span> : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewHead}>
                      <h3>Files</h3>
                      <button type="button" className={styles.linkBtn} onClick={() => goTo(1)}>
                        Edit<span className="sr-only"> files</span>
                      </button>
                    </div>
                    <ul className={styles.reviewFiles}>
                      {s.uploads
                        .filter((f) => f.status !== "rejected")
                        .map((f) => (
                          <li key={f.id}>
                            <span className={styles.reviewRole}>{f.role || "No role yet"}</span>
                            <span className={styles.muted}>{f.name}</span>
                            <span className={styles.vis}>
                              {f.anyone ? <Globe size={15} aria-hidden /> : <ShieldCheck size={15} aria-hidden />}
                              {f.anyone ? "Anyone" : "Verified instructors only"}
                            </span>
                            {f.status === "flagged" ? (
                              <span className={styles.reviewFlag}>
                                <TriangleAlert size={15} aria-hidden />
                                Flagged: possible personal data
                              </span>
                            ) : null}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewHead}>
                      <h3>License</h3>
                      <button type="button" className={styles.linkBtn} onClick={() => goTo(4)}>
                        Edit<span className="sr-only"> license</span>
                      </button>
                    </div>
                    <p className={styles.reviewLic}>
                      <strong>{LICENSES[s.lic].code}.</strong> {LICENSES[s.lic].text}
                    </p>
                  </div>
                </div>

                <fieldset id="attest" tabIndex={-1} className={styles.attest}>
                  <legend className={styles.attestTitle}>Before you submit</legend>
                  <p className={styles.help}>All four are required.</p>
                  {err("Check all four statements before you submit") ? (
                    <p className={styles.inlineError}>
                      <CircleAlert size={16} aria-hidden />
                      Check all four statements to submit
                    </p>
                  ) : null}
                  <div className={styles.attestList}>
                    {ATTESTATIONS.map((t, i) => (
                      <Checkbox key={t} size="md" checked={s.attest[i]} invalid={s.showErrors && !s.attest[i]} onCheckedChange={(v) => upd((st) => ({ attest: st.attest.map((x, j) => (j === i ? v : x)) }))}>
                        {t}
                      </Checkbox>
                    ))}
                  </div>
                </fieldset>
                <div className={styles.awards}>
                  <Checkbox size="md" checked={s.awards} onCheckedChange={(v) => upd({ awards: v })} description="Optional.">
                    <Trophy size={17} aria-hidden />
                    Submit for the annual awards
                  </Checkbox>
                </div>
              </section>
            ) : null}

            {/* ---------- Footer actions ---------- */}
            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                {s.n > 1 ? (
                  <Button variant="secondary" size="lg" onClick={() => goTo(s.n - 1)}>
                    <ArrowLeft size={16} aria-hidden />
                    Back
                  </Button>
                ) : null}
                <Button variant="quiet" size="lg" onClick={saveExit}>
                  Save and exit
                </Button>
              </div>
              <Button size="lg" onClick={next}>
                {["Continue to Basics", "Continue to Authors", "Continue to License", "Continue to Review", "Submit for review"][s.n - 1]}
                <ArrowRight size={16} aria-hidden />
              </Button>
            </div>
          </div>

          {wide ? (
            <aside aria-label="Cover preview" className={styles.coverAside}>
              <h2 className={styles.coverTitle}>Cover preview</h2>
              <div className={styles.coverCard}>
                <PatternCover discipline={coverD} seed={seed} palette={pals[pal].colors} className={styles.coverArt} cellSize={28} />
                <div className={styles.coverText}>
                  <span className={styles.kicker}>
                    {s.type} · {discLabel}
                  </span>
                  <span className={styles.coverName}>{s.title.trim() || "Your title"}</span>
                </div>
              </div>
              <p className={styles.coverNote}>This cover uses the {PATTERN_LABEL[patternSlugFor(coverD)]} pattern. Shuffle picks a random pattern and layout.</p>
              <Button
                variant="secondary"
                onClick={() =>
                  upd((st) => {
                    const keys = disciplines.map((d) => d.d).filter((k) => k !== coverD);
                    return { cover: keys[Math.floor(Math.random() * keys.length)] || coverD, seedN: st.seedN + 1, pal: 0 };
                  })
                }
              >
                <Shuffle size={16} aria-hidden />
                Shuffle cover
              </Button>
              <RadioCards
                label={
                  <>
                    Palette <span className={styles.optional}>(optional)</span>
                  </>
                }
                compact
                layout="row"
                className={styles.palettes}
                value={String(pal)}
                onValueChange={(v) => upd({ pal: Number(v) })}
                options={pals.map((p, i) => ({
                  value: String(i),
                  label: (
                    <span className={styles.palOption}>
                      <span className={styles.swatches} aria-hidden="true">
                        {p.colors.map((c, j) => (
                          <span key={j} style={{ background: c }} />
                        ))}
                      </span>
                      {p.name}
                    </span>
                  ),
                }))}
              />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}


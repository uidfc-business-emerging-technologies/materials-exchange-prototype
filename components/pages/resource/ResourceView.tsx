"use client";

import {
  BadgeCheck,
  Bell,
  BellRing,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  Flag,
  Globe,
  GraduationCap,
  History,
  Info,
  Lock,
  Package,
  Pencil,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authorHref, byId, detailFor, LICENSE_LINES, resourceHref, type FileEntry, type ResourceDetail } from "@/lib/data";
import { useDemo, type Auth } from "@/lib/demo";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Select, TextField } from "@/components/ui/controls";
import { DataIcon } from "@/components/ui/DataIcon";
import { Disclosure, infoToast, Modal, toast } from "@/components/ui/overlays";
import { PatternCover } from "@/components/site/PatternCover";
import { ResourceCard } from "@/components/site/ResourceCard";
import { signInHref, verifyHref } from "@/components/site/SiteHeader";
import styles from "./Resource.module.css";

type Access = "visitor" | "member" | "review" | "renewal" | "verified" | "author";

const ACCESS_FROM_AUTH: Record<Auth, Access> = { out: "visitor", member: "member", review: "review", renewal: "renewal", verified: "verified" };

const NOTES: Record<Access, { Icon: typeof Lock; text: string }> = {
  visitor: { Icon: Lock, text: "Anyone can download the public files. Teaching notes and solutions are for verified instructors." },
  member: { Icon: Lock, text: "Verify you teach to unlock teaching notes and solutions. Most instructors are verified in a few seconds." },
  review: { Icon: Clock, text: "Your verification is in review. A person will check it within 2 business days. Public files are ready now." },
  renewal: { Icon: RefreshCw, text: "Your verification is due for renewal. Re-check your page to unlock teaching notes and solutions again." },
  verified: { Icon: BadgeCheck, text: "You're a verified instructor, so every file is available to you." },
  author: { Icon: Info, text: "Each file shows who can download it once this is published." },
};

type Usage = Record<string, { dl?: number; courses?: number; reported?: boolean }>;
type Dialog = null | "used" | "report" | "preview";

const TERMS = ["Fall 2026", "Summer 2026", "Spring 2026", "Fall 2025"];
const PROBLEMS = ["A file is broken or missing", "There's an error in the content", "A file may contain personal data", "Copyright concern", "Something else"];

function pageCount(f: FileEntry) {
  const m = /([\d.]+)\s*(KB|MB)/.exec(f.size || "");
  const kb = m ? parseFloat(m[1]) * (m[2] === "MB" ? 1024 : 1) : 600;
  return Math.max(2, Math.min(24, Math.round(kb / 160)));
}

/** Gray text lines standing in for the page of a PDF in the preview. */
function previewLines(f: FileEntry, page: number) {
  let x = 0;
  const str = f.name + page;
  for (let i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0;
  const rnd = () => (x = (x * 1103515245 + 12345) >>> 0) / 4294967296;
  return Array.from({ length: page === 1 ? 12 : 18 }, (_, i) => ({ w: (i % 6 === 5 ? 40 + rnd() * 25 : 88 + rnd() * 12).toFixed(0) + "%", gap: i % 6 === 0 && i ? 10 : 0 }));
}

export function ResourceView({ id }: { id: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const demo = useDemo();
  const own = !!params?.get("own");
  const published = !!params?.get("published");
  const access: Access = own ? "author" : ACCESS_FROM_AUTH[demo.auth];
  const isAuthor = access === "author";
  const rid = isAuthor ? "TME-0171" : id;
  const submitted = rid === "TME-0171" ? demo.get<{ detail?: ResourceDetail } | null>("submitted", null)?.detail : undefined;
  const res = submitted || detailFor(rid, { published });
  const here = resourceHref(res.id, { own, published });

  const [copied, setCopied] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pvFile, setPvFile] = useState<FileEntry | null>(null);
  const [pvPage, setPvPage] = useState(1);
  const [course, setCourse] = useState("");
  const [term, setTerm] = useState(TERMS[0]);
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [details, setDetails] = useState("");
  const [courseError, setCourseError] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const usage = demo.get<Usage>("usage", {});
  const U = usage[res.id] || {};
  const saved = !!demo.get<Record<string, boolean>>("saved", {})[res.id];
  const follow = !!demo.get<Record<string, boolean>>("follow", {})[res.id];

  const canGated = access === "verified" || isAuthor;
  const unlock: Record<Exclude<Access, "verified" | "author">, { label: string; href: string }> = {
    visitor: { label: "Sign in to verify", href: signInHref(here) },
    member: { label: "Verify you teach", href: verifyHref(here) },
    review: { label: "See status", href: "/verify?state=review&returnTo=" + encodeURIComponent(here) },
    renewal: { label: "Re-check to unlock", href: "/verify?state=expired&returnTo=" + encodeURIComponent(here) },
  };
  const unlockAction = canGated ? null : unlock[access as keyof typeof unlock];
  const note = NOTES[access];
  const reported = !!U.reported;

  const others = res.authors.filter((a) => a.name !== demo.me.name).map((a) => a.name);
  const shareLine = others.length
    ? "Only you and " + (others.length > 1 ? others.slice(0, -1).join(", ") + " and " + others[others.length - 1] : others[0]) + " can see this page."
    : "Only you can see this page.";
  const filterDisc = byId(res.id)?.disc || res.discipline;

  const download = (name: string) => {
    demo.set({ usage: { ...usage, [res.id]: { ...U, dl: (U.dl || 0) + 1 } } });
    toast("Downloading " + name, Download);
  };

  const flip = (key: "saved" | "follow", on: string, off: string) => {
    if (demo.auth === "out") {
      router.push(signInHref(here));
      return;
    }
    const m = { ...demo.get<Record<string, boolean>>(key, {}) };
    const next = !m[res.id];
    if (next) m[res.id] = true;
    else delete m[res.id];
    demo.set({ [key]: m });
    if (next) toast(on);
    else infoToast(off);
  };

  const copy = () => {
    try {
      navigator.clipboard?.writeText(res.cite.lead + res.cite.italic + res.cite.tail).catch(() => {});
    } catch {
      // Clipboard can be blocked; the citation is still on screen to select.
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2200);
  };

  const openForm = (d: "used" | "report") => {
    setCourse("");
    setTerm(TERMS[0]);
    setProblem(PROBLEMS[0]);
    setDetails("");
    setCourseError(false);
    setDialog(d);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog === "used") {
      if (!course.trim()) {
        setCourseError(true);
        return;
      }
      demo.set({ usage: { ...usage, [res.id]: { ...U, courses: (U.courses || 0) + 1, reported: true } } });
      const reports = demo.get<{ rid: string; course: string; term: string }[]>("courseReports", []);
      demo.set({ courseReports: [...reports, { rid: res.id, course: course.trim(), term }] });
      setDialog(null);
      toast("Thanks. Added to the course count.");
      return;
    }
    setDialog(null);
    toast("Thanks. We'll look into it and email you.");
  };

  const pvTotal = pvFile ? pageCount(pvFile) : 1;
  const dialogTitle = dialog === "preview" ? "Preview: " + (pvFile?.role || "") : dialog === "report" ? "Report a problem" : "Tell us where you used this";
  const dialogSub = dialog === "preview" && pvFile ? `${pvFile.name} · ${pvFile.format}, ${pvFile.size}` : res.title;

  return (
    <>
      <div className={styles.top}>
        {isAuthor ? (
          <div role="status" className={styles.reviewBanner}>
            <Clock size={20} aria-hidden className={styles.reviewIcon} />
            <p className={styles.reviewText}>
              <strong>In review.</strong> {shareLine} A person on our team will check it within 2 business days, and we&apos;ll email you when it&apos;s published.
            </p>
            <ButtonLink href="/contribute" variant="secondary">
              <Pencil size={16} aria-hidden />
              Edit submission
            </ButtonLink>
          </div>
        ) : null}

        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/browse">Browse</Link>
          <ChevronRight size={14} aria-hidden />
          <Link href={"/browse?disc=" + encodeURIComponent(filterDisc)}>{res.discipline}</Link>
        </nav>
        <PatternCover discipline={res.d} seed={(res as ResourceDetail & { seed?: string }).seed || res.id} palette={(res as ResourceDetail & { palette?: string[] }).palette} className={styles.cover} cellSize={36} />

        <div className={styles.titlePanel}>
          <div className={styles.kickerRow}>
            <p className={styles.kicker}>
              {res.type} · {res.discipline}
            </p>
            {isAuthor ? (
              <Badge tone="info" icon={<Clock size={14} aria-hidden />}>
                In review
              </Badge>
            ) : null}
          </div>
          <h1 className={styles.h1}>{res.title}</h1>
          <p className={styles.summary}>{res.summary}</p>
          <div className={styles.byline}>
            <p>
              By{" "}
              {res.byline.map((b) => (
                <span key={b.name}>
                  <Link href={authorHref(b.name)}>{b.name}</Link>
                  {b.after}
                </span>
              ))}
            </p>
            <p className={styles.meta}>{res.meta}</p>
            {!isAuthor ? (
              <div className={styles.pills}>
                <button type="button" aria-pressed={saved} className={[styles.pill, saved ? styles.pillOn : ""].join(" ")} onClick={() => flip("saved", "Saved. Find it in your account.", "Removed from saved.")}>
                  {saved ? <BookmarkCheck size={16} aria-hidden /> : <Bookmark size={16} aria-hidden />}
                  {saved ? "Saved" : "Save"}
                </button>
                <button type="button" aria-pressed={follow} className={[styles.pill, follow ? styles.pillOn : ""].join(" ")} onClick={() => flip("follow", "We'll email you when there's a new version.", "You won't get updates for this one.")}>
                  {follow ? <BellRing size={16} aria-hidden /> : <Bell size={16} aria-hidden />}
                  {follow ? "Getting updates" : "Get updates"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <aside aria-label="Files and usage" className={styles.aside}>
          <section aria-labelledby="files-h" className={styles.files}>
            <div className={styles.filesHead}>
              <div className={styles.filesTitleRow}>
                <h2 id="files-h" className={styles.h2}>
                  Files
                </h2>
                <span className={styles.filesTotal}>{res.totalAll}</span>
              </div>
              <p className={[styles.note, access === "verified" ? styles.noteOk : ""].join(" ")}>
                <note.Icon size={18} aria-hidden />
                <span>{note.text}</span>
              </p>
            </div>
            {res.files.map((f) => {
              const locked = f.gated && !canGated;
              const tag = locked
                ? { Icon: Lock, text: "For verified instructors", cls: styles.tagLocked }
                : isAuthor
                  ? f.gated
                    ? { Icon: ShieldCheck, text: "Verified instructors only", cls: "" }
                    : { Icon: Globe, text: "Anyone", cls: "" }
                  : f.gated
                    ? { Icon: ShieldCheck, text: "Verified instructors only", cls: "" }
                    : null;
              const canPreview = !locked && f.format === "PDF";
              return (
                <div key={f.name} className={styles.fileRow}>
                  <span className={[styles.fileIcon, locked ? styles.dim : ""].join(" ")}>
                    <DataIcon name={f.icon} size={18} />
                  </span>
                  <div className={styles.fileText}>
                    <span className={[styles.fileRole, locked ? styles.dim : ""].join(" ")}>{f.role}</span>
                    <span className={styles.fileMeta}>
                      {f.name} · {f.format}, {f.size}
                    </span>
                    {tag ? (
                      <span className={[styles.fileTag, tag.cls].join(" ")}>
                        <tag.Icon size={14} aria-hidden />
                        {tag.text}
                      </span>
                    ) : null}
                    {isAuthor && f.flag ? (
                      <span className={styles.fileFlag}>
                        <TriangleAlert size={14} aria-hidden />
                        {f.flag}
                      </span>
                    ) : null}
                  </div>
                  {canPreview ? (
                    <button
                      type="button"
                      className={styles.previewBtn}
                      aria-label={"Preview " + f.role}
                      title="Preview"
                      onClick={() => {
                        setPvFile(f);
                        setPvPage(1);
                        setDialog("preview");
                      }}
                    >
                      <Eye size={18} aria-hidden />
                    </button>
                  ) : null}
                  {locked && unlockAction ? (
                    <ButtonLink href={unlockAction.href} variant="secondary" size="md" className={styles.fileAction}>
                      {unlockAction.label}
                    </ButtonLink>
                  ) : (
                    <Button variant="secondary" size="md" className={[styles.fileAction, canPreview ? styles.noAuto : ""].join(" ")} aria-label={`Download ${f.role}, ${f.format}, ${f.size}`} onClick={() => download(f.name)}>
                      <Download size={16} aria-hidden />
                      Download
                    </Button>
                  )}
                </div>
              );
            })}
            <div className={styles.filesFoot}>
              <Button size="lg" block onClick={() => download(canGated ? "all files as a ZIP" : "all public files as a ZIP")}>
                <Package size={18} aria-hidden />
                {canGated ? res.allLabel : "Download all public files"}
              </Button>
              <span className={styles.allMeta}>{canGated ? res.allMeta : res.publicMeta}</span>
            </div>
          </section>

          <section aria-labelledby="use-h" className={styles.usage}>
            <h2 id="use-h" className={styles.usageTitle}>
              In classrooms
            </h2>
            {isAuthor ? (
              <p className={styles.usageNote}>Download counts and course reports start when this is published.</p>
            ) : (
              <div className={styles.usageGrid}>
                <div className={styles.usageStat}>
                  <span className={styles.usageN}>{(res.downloads + (U.dl || 0)).toLocaleString("en-US")}</span>
                  <span className={styles.usageLabel}>downloads</span>
                </div>
                <div className={styles.usageStat}>
                  <span className={styles.usageN}>{res.courses + (U.courses || 0)}</span>
                  <span className={styles.usageLabel}>courses have used it</span>
                </div>
              </div>
            )}
            {access === "verified" && !reported && !published ? (
              <>
                <Button variant="secondary" block className={styles.usedBtn} onClick={() => openForm("used")}>
                  <GraduationCap size={18} aria-hidden />I used this in a course
                </Button>
                <p className={styles.usedHint}>Your report adds to the count the authors can cite.</p>
              </>
            ) : null}
            {access === "verified" && reported ? (
              <p className={styles.reported}>
                <Check size={17} aria-hidden />
                You reported using this in a course. Thanks.
              </p>
            ) : null}
          </section>
        </aside>

        <div className={styles.main}>
          <section aria-labelledby="about-h">
            <h2 id="about-h" className={styles.h2}>
              {res.aboutTitle}
            </h2>
            <p className={styles.about}>{res.about}</p>
            {res.objectives.length ? (
              <>
                <h3 className={styles.h3}>Learning objectives</h3>
                <ol className={styles.objectives}>
                  {res.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ol>
              </>
            ) : null}
            <dl className={styles.facts}>
              <dt>Class time</dt>
              <dd>{res.time}</dd>
              <dt>Course level</dt>
              <dd>{res.level}</dd>
              <dt>Discipline</dt>
              <dd>
                <Link href={"/browse?disc=" + encodeURIComponent(filterDisc)}>{res.discipline}</Link>
              </dd>
              {res.tools.length ? (
                <>
                  <dt>Tools</dt>
                  <dd className={styles.toolsDd}>
                    {res.tools.map((t) => (
                      <Link key={t} href={"/browse?tools=" + encodeURIComponent(t)} className={styles.toolChip}>
                        {t}
                      </Link>
                    ))}
                  </dd>
                </>
              ) : null}
              <dt>Classroom-tested</dt>
              <dd>{res.tested}</dd>
            </dl>
          </section>

          <section aria-labelledby="authors-h">
            <h2 id="authors-h" className={styles.h2}>
              Authors
            </h2>
            <div className={styles.authors}>
              {res.authors.map((a) => (
                <div key={a.name} className={styles.authorCard}>
                  <span className={styles.initials} aria-hidden="true">
                    {a.initials}
                  </span>
                  <div className={styles.authorText}>
                    <Link href={authorHref(a.name)} className={styles.authorName}>
                      {a.name}
                    </Link>
                    {a.title ? <span className={styles.authorSub}>{a.title}</span> : null}
                    <span className={styles.authorSub}>{a.inst}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="cite-h">
            <h2 id="cite-h" className={styles.h2}>
              Cite this
            </h2>
            <div className={styles.cite}>
              <div className={styles.citeHead}>
                <span className={styles.citeStyle}>APA 7</span>
                {copied ? (
                  <span role="status" className={styles.copied}>
                    <Check size={16} aria-hidden />
                    Copied
                    <span className="sr-only">Citation copied</span>
                  </span>
                ) : (
                  <Button variant="secondary" onClick={copy}>
                    <Copy size={16} aria-hidden />
                    Copy citation
                  </Button>
                )}
              </div>
              <p className={styles.citeText}>
                {res.cite.lead}
                <i>{res.cite.italic}</i>
                {res.cite.tail}
              </p>
              {res.citeNote ? <p className={styles.citeNote}>{res.citeNote}</p> : null}
            </div>
            <div className={styles.license}>
              <CreativeCommons />
              <p>
                <strong>{res.license}.</strong> {LICENSE_LINES[res.license]}{" "}
                <a
                  href="https://creativecommons.org/licenses/"
                  onClick={(e) => {
                    e.preventDefault();
                    infoToast("The full license text opens on creativecommons.org.");
                  }}
                >
                  About this license
                </a>
              </p>
            </div>
          </section>

          <section aria-label="Version history and problems" className={styles.versions}>
            <Disclosure
              summary={
                <>
                  <History size={20} aria-hidden />
                  Version history
                </>
              }
              meta={res.versions}
            >
              <ol className={styles.versionList}>
                {res.versionList.map((v) => (
                  <li key={v.v}>
                    <span className={styles.versionName}>
                      {v.v}
                      <br />
                      <span className={styles.versionDate}>{v.date}</span>
                    </span>
                    <span className={styles.versionNote}>{v.note}</span>
                  </li>
                ))}
              </ol>
            </Disclosure>
            {!isAuthor ? (
              <button type="button" className={styles.reportLink} onClick={() => openForm("report")}>
                <Flag size={16} aria-hidden />
                Report a problem
              </button>
            ) : null}
          </section>
        </div>
      </div>

      <section aria-labelledby="rel-h" className={styles.related}>
        <h2 id="rel-h" className={styles.h2}>
          Related materials
        </h2>
        <div className={styles.relatedGrid}>
          {res.related.map((rid2) => {
            const r = byId(rid2);
            return r ? <ResourceCard key={r.id} resource={r} locked={!canGated} /> : null;
          })}
        </div>
      </section>

      <Modal open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)} title={dialogTitle} description={dialogSub} width={dialog === "preview" ? 640 : 520}>
        {dialog === "preview" && pvFile ? (
          <>
            <div className={styles.pvStage}>
              <div role="img" aria-label={`Page ${pvPage} of ${pvFile.role}`} className={styles.pvPage}>
                {pvPage === 1 ? (
                  <>
                    <span className={styles.pvKicker}>
                      {pvFile.role} · {res.discipline}
                    </span>
                    <span className={styles.pvTitle}>{res.title}</span>
                    <span className={styles.pvAuthors}>{res.authors.map((a) => a.name).join(" and ")}</span>
                  </>
                ) : null}
                {previewLines(pvFile, pvPage).map((ln, i) => (
                  <span key={i} className={styles.pvLine} style={{ width: ln.w, marginTop: ln.gap }} />
                ))}
                <span className={styles.pvNum}>{pvPage}</span>
              </div>
            </div>
            <div className={styles.pvBar}>
              <div className={styles.pvNav}>
                <button type="button" className={styles.pvArrow} disabled={pvPage <= 1} aria-label="Previous page" onClick={() => setPvPage((n) => Math.max(1, n - 1))}>
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <span role="status" className={styles.pvCount}>
                  Page {pvPage} of {pvTotal}
                </span>
                <button type="button" className={styles.pvArrow} disabled={pvPage >= pvTotal} aria-label="Next page" onClick={() => setPvPage((n) => Math.min(pvTotal, n + 1))}>
                  <ChevronRight size={18} aria-hidden />
                </button>
              </div>
              <Button
                onClick={() => {
                  setDialog(null);
                  download(pvFile.name);
                }}
              >
                <Download size={16} aria-hidden />
                Download {pvFile.format}
              </Button>
            </div>
          </>
        ) : dialog ? (
          <form onSubmit={submitForm} noValidate className={styles.dialogForm}>
            {dialog === "used" ? (
              <>
                <TextField
                  label="Course"
                  description="Course number and name, as students see it."
                  value={course}
                  onValueChange={(v) => {
                    setCourse(v);
                    if (v.trim()) setCourseError(false);
                  }}
                  placeholder="ACCY 405: Intermediate Accounting"
                  error={courseError ? "Enter the course you used it in" : undefined}
                />
                <Select label="Term" value={term} onValueChange={setTerm} options={TERMS.map((t) => ({ value: t, label: t }))} />
              </>
            ) : (
              <>
                <Select label="What's wrong?" value={problem} onValueChange={setProblem} options={PROBLEMS.map((t) => ({ value: t, label: t }))} />
                <TextField label="Details" optional multiline rows={4} value={details} onValueChange={setDetails} />
              </>
            )}
            <div className={styles.dialogActions}>
              <Button type="submit" size="lg">
                {dialog === "report" ? "Send report" : "Add to the count"}
              </Button>
              <Button variant="quiet" size="lg" onClick={() => setDialog(null)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}

/** Lucide has no Creative Commons mark, so this is drawn in the same line style. */
function CreativeCommons() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: 1 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.8 2.8 0 0 0 3.5 1" />
      <path d="M17 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.8 2.8 0 0 0 3.5 1" />
    </svg>
  );
}

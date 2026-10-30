"use client";

import {
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Folder,
  Hash,
  Inbox,
  LogIn,
  Mail,
  Pencil,
  RefreshCw,
  Shield,
  Star,
  TriangleAlert,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { allResources, authorHref, detailFor, resourceHref, type DisciplineKey, type LicenseName } from "@/lib/data";
import { ADMIN_ID, KNOWN_SUBMISSIONS, SUBMISSIONS, USERS, type AdminUser, type Submission } from "@/lib/admin-data";
import { Badge, StatusBadge, type Tone } from "@/components/ui/Badge";
import { MaterialCover } from "@/components/site/MaterialCover";
import { AdminCollection, type ActionSpec } from "./AdminCollection";
import a from "./admin.module.css";

const Thumb = ({ d, id, seed }: { d: DisciplineKey; id: string; seed?: string }) => <MaterialCover id={id} discipline={d} seed={seed} className={a.thumb} cellSize={14} motion={false} sizes="48px" />;

// ---------- Submissions ----------

const SUB_STATUS: Record<Submission["status"], "Needs review" | "Changes requested" | "Approved" | "Declined"> = { waiting: "Needs review", changes: "Changes requested", published: "Approved", declined: "Declined" };
const reviewHref = (x: { id: string }) => "/admin/submissions/" + x.id;

const SUB_ACTIONS: Record<string, ActionSpec<Submission>> = {
  approve: { label: "Approve and publish…", bulk: "Approve…", Icon: CircleCheck, ok: (x) => x.status === "waiting", confirm: true, email: "sub-published", button: "Approve and publish", title: (L) => "Approve " + (L.length === 1 ? L[0].title : L.length + " submissions") + "?", body: (L) => (L.length === 1 ? "It" : "They") + " go live in Browse and search right away." + (L.some((x) => x.flags.length) ? " Some have open flags, which stay visible to the authors." : ""), patch: { status: "published", wait: "Decided today" }, what: "Approved", done: (n) => (n === 1 ? "Approved and published" : n + " submissions approved") },
  changes: { label: "Request changes…", Icon: Pencil, ok: (x) => x.status === "waiting", confirm: true, note: "What should the authors change?", email: "sub-changes", button: "Send request", title: (L) => "Request changes to " + L[0].title + "?", body: () => "It stays in review until the authors send an update.", patch: { status: "changes", wait: "Waiting on the author since today" }, what: "Changes requested", done: () => "Change request sent" },
  remind: { label: "Remind the authors", bulk: "Remind authors", Icon: Bell, ok: (x) => x.status === "changes", what: "Reminder sent to the authors", done: (n) => (n === 1 ? "Reminder sent" : n + " reminders sent") },
  decline: { label: "Decline…", bulk: "Decline…", Icon: CircleX, danger: true, ok: (x) => x.status === "waiting", confirm: true, reasons: ["Not teaching material", "Contains personal data that can’t be removed", "Rights to share are unclear", "Duplicate of an existing resource"], email: "sub-declined", button: "Decline", title: (L) => "Decline " + (L.length === 1 ? L[0].title : L.length + " submissions") + "?", body: () => "It won’t be published. The files stay in the authors’ drafts.", patch: { status: "declined", wait: "Decided today" }, what: "Declined", done: (n) => (n === 1 ? "Declined" : n + " submissions declined") },
};

/** 6.10 Submissions: new and updated materials waiting for a decision, plus recent decisions. */
export function SubmissionsTable() {
  return (
    <AdminCollection<Submission>
      storageKey="subs"
      seed={SUBMISSIONS}
      title="Submissions"
      lead="New and updated materials waiting for a decision, plus recent decisions. Use the menu on each row for actions and details."
      countLine={(items) => items.filter((x) => x.status === "waiting").length + " need review"}
      searchLabel="Search by title, contributor, or ID"
      searchText={(x) => x.title + " " + x.authors + " " + x.id}
      filters={[
        { value: "all", label: "All", test: () => true },
        { value: "waiting", label: "Needs review", test: (x) => x.status === "waiting" },
        { value: "changes", label: "Changes requested", test: (x) => x.status === "changes" },
        { value: "published", label: "Approved", test: (x) => x.status === "published" },
        { value: "declined", label: "Declined", test: (x) => x.status === "declined" },
        { value: "flagged", label: "Flagged", test: (x) => x.flags.length > 0 },
      ]}
      columns={[
        {
          key: "sub",
          header: "Submission",
          Icon: BookOpen,
          render: (x) => (
            <div className={a.withThumb}>
              <Thumb d={x.d} id={x.id} />
              <div>
                <Link href={reviewHref(x)} className={a.cellLink}>
                  {x.title}
                </Link>
                <span className={a.cellSub}>
                  {x.type} · {x.authors} ·{" "}
                  <span className={x.ct === "first" ? a.info : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {x.ct === "first" ? <UserPlus size={13} aria-hidden /> : <BadgeCheck size={13} aria-hidden />}
                    {x.ct === "first" ? "First-time" : "Trusted"}
                  </span>
                </span>
              </div>
            </div>
          ),
        },
        { key: "when", header: "Submitted", Icon: Clock, render: (x) => <>{x.when}<span className={x.status === "waiting" ? a.cellInfo : a.cellSub}>{x.wait}</span></> },
        {
          key: "status",
          header: "Status",
          Icon: Clock,
          render: (x) => (
            <div className={a.stack}>
              <StatusBadge status={SUB_STATUS[x.status]} />
              <span className={[a.cellSub, x.flags.length ? a.warnText : a.ok].join(" ")} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {x.flags.length ? <TriangleAlert size={14} aria-hidden /> : <CircleCheck size={14} aria-hidden />}
                {x.flags.length ? x.flags.length + (x.flags.length === 1 ? " flag" : " flags") : "No flags"}
              </span>
            </div>
          ),
        },
      ]}
      actions={SUB_ACTIONS}
      bulkKeys={["approve", "remind", "decline"]}
      menu={(x) => [
        [{ details: true }, { link: reviewHref(x), label: "Open the review", Icon: Inbox }, ...(KNOWN_SUBMISSIONS.includes(x.id) ? [{ link: "/admin/materials/" + x.id, label: "Edit material", Icon: Pencil }] : [])],
        [{ action: "approve" }, { action: "changes" }, { action: "remind" }],
        [{ action: "decline" }],
      ]}
      details={(x) => ({
        title: x.title,
        desc: x.type + " · " + x.authors,
        status: <StatusBadge status={SUB_STATUS[x.status]} />,
        facts: [
          { k: "ID", v: x.id, Icon: Hash },
          { k: "Type", v: x.type, Icon: FileText },
          { k: "Submitted", v: x.when, Icon: Clock },
          { k: "Contributor", v: x.ct === "first" ? "First-time contributor" : "Trusted contributor", Icon: UserRound },
          { k: "Institution", v: x.inst, Icon: Building2 },
          { k: "Files", v: String(x.files), Icon: Folder },
        ],
        checks: x.flags.length ? x.flags.map((t) => ({ text: t, tone: "warn" as const })) : [{ text: "No flags. Files passed the automatic checks.", tone: "ok" as const }],
        history: x.history,
        open: { href: reviewHref(x), label: "Open the review" },
        edit: KNOWN_SUBMISSIONS.includes(x.id) ? "/admin/materials/" + x.id : undefined,
      })}
      emailLine="The authors get an email."
      rowName={(x) => x.title}
    />
  );
}

// ---------- Materials ----------

export interface Material {
  id: string;
  d: DisciplineKey;
  title: string;
  type: string;
  discipline: string;
  authors: string;
  status: "published" | "inreview" | "unpublished";
  downloads: number;
  courses: number;
  updated: string;
  license: LicenseName;
  files: { role: string; gated: boolean; name?: string }[];
  featured: boolean;
  history: { when: string; what: string }[];
  /** Set once an admin edits the material. */
  summary?: string;
  level?: string;
  time?: string;
  discs?: DisciplineKey[];
  authorList?: { name: string; inst: string }[];
  /** Cover shuffles; 0 is the original arrangement. */
  cover?: number;
}

export const coverSeed = (m: { id: string; cover?: number }) => m.id + (m.cover ? "-" + m.cover : "");

export function materialsSeed(): Material[] {
  const files = (id: string) => detailFor(id).files.map((f) => ({ role: f.role, gated: !!f.gated }));
  const out: Material[] = allResources().map((r) => {
    const d = detailFor(r.id);
    return { id: r.id, d: r.d, title: r.title, type: r.type, discipline: r.discipline, authors: r.authors, status: "published", downloads: d.downloads, courses: d.courses, updated: "Oct " + (r.added || 1) + ", 2026", license: r.license, files: files(r.id), featured: ["TME-0166", "TME-0161", "TME-0157"].includes(r.id), history: [{ when: "Oct " + (r.added || 1), what: "Published" }] };
  });
  out.push({ id: "TME-0171", d: "emtech", title: "Generative AI in the Monthly Close", type: "Case", discipline: "Emerging technology, Accounting information systems", authors: "Elena Fischer, Sam Ortega", status: "inreview", downloads: 0, courses: 0, updated: "Oct 22, 2026", license: "CC BY 4.0", files: files("TME-0171"), featured: false, history: [{ when: "Oct 22", what: "Resubmitted with a new exhibit" }, { when: "Oct 14", what: "Changes requested by Jamie Morales" }] });
  out.push({ id: "TME-0172", d: "audit", title: "Sampling Vendor Payments in Python", type: "Data exercise", discipline: "Audit and analytics", authors: "Priya Raman", status: "inreview", downloads: 0, courses: 0, updated: "Oct 15, 2026", license: "CC BY-NC 4.0", files: [{ role: "Instructions", gated: false }, { role: "Vendor payments dataset", gated: false }, { role: "Solution notebook", gated: true }], featured: false, history: [{ when: "Oct 15", what: "Submitted" }] });
  out.push({ id: "TME-0066", d: "audit", title: "Fraud Triangle Mini-Cases", type: "Teaching module", discipline: "Audit", authors: "Priya Raman", status: "unpublished", downloads: 143, courses: 3, updated: "Aug 2026", license: "CC BY 4.0", files: [{ role: "Module guide", gated: false }, { role: "Teaching note", gated: true }], featured: false, history: [{ when: "Aug 2026", what: "Unpublished by the authors" }, { when: "2025", what: "Published" }] });
  return out;
}

export const MAT_STATUS = { published: "Published", inreview: "In review", unpublished: "Unpublished" } as const;
const matHref = (m: Material) => (m.status === "inreview" ? reviewHref(m) : resourceHref(m.id));
const matOpenLabel = (m: Material) => (m.status === "inreview" ? "Open the review" : m.status === "unpublished" ? "See what visitors see" : "Open resource page");

const MAT_ACTIONS: Record<string, ActionSpec<Material>> = {
  feature: { label: "Feature on home page", bulk: "Feature", Icon: Star, ok: (m) => m.status === "published" && !m.featured, patch: { featured: true }, what: "Featured on the home page", done: (n) => (n === 1 ? "Featured on the home page" : n + " resources featured") },
  unfeature: { label: "Stop featuring", bulk: "Stop featuring", Icon: Star, ok: (m) => m.featured, patch: { featured: false }, what: "No longer featured", done: (n) => (n === 1 ? "No longer featured" : n + " resources no longer featured") },
  download: { label: "Download all files", bulk: "Download files", Icon: Download, ok: (m) => m.status !== "unpublished", what: "Files downloaded", done: (n) => (n === 1 ? "Downloading all files as a ZIP" : "Downloading files for " + n + " resources as a ZIP") },
  unpub: { label: "Unpublish…", bulk: "Unpublish…", Icon: CircleX, danger: true, ok: (m) => m.status === "published", confirm: true, reasons: ["Contains personal data", "Rights to share are unclear", "The authors asked", "Something else"], email: "mat-unpublished", button: "Unpublish", title: (L) => "Unpublish " + (L.length === 1 ? L[0].title : L.length + " resources") + "?", body: () => "Leaves Browse and search right away. Old links show a notice, and every author gets an email.", patch: { status: "unpublished", featured: false }, what: "Unpublished", done: (n) => (n === 1 ? "Unpublished" : n + " resources unpublished") },
  repub: { label: "Publish again…", bulk: "Publish again…", Icon: CircleCheck, ok: (m) => m.status === "unpublished", confirm: true, button: "Publish again", title: (L) => "Publish " + (L.length === 1 ? L[0].title : L.length + " resources") + " again?", body: () => "Returns to Browse and search, and old links work again. The authors get an email.", patch: { status: "published" }, what: "Published again", done: (n) => (n === 1 ? "Published again" : n + " resources published again") },
};

/** Every resource on the exchange. */
export function MaterialsTable() {
  const seed = materialsSeed();
  return (
    <AdminCollection<Material>
      storageKey="mats"
      seed={seed}
      title="Materials"
      lead="Every resource on the exchange. Use the menu on each row for actions and details."
      countLine={(items) => items.length + " resources"}
      searchLabel="Search by title, author, or ID"
      searchText={(m) => m.title + " " + m.authors + " " + m.id}
      filters={[
        { value: "all", label: "All", test: () => true },
        { value: "published", label: "Published", test: (m) => m.status === "published" },
        { value: "inreview", label: "In review", test: (m) => m.status === "inreview" },
        { value: "unpublished", label: "Unpublished", test: (m) => m.status === "unpublished" },
        { value: "featured", label: "Featured", test: (m) => m.featured },
      ]}
      columns={[
        {
          key: "res",
          header: "Resource",
          Icon: BookOpen,
          render: (m) => (
            <div className={a.withThumb}>
              <Thumb d={m.d} id={m.id} seed={coverSeed(m)} />
              <div>
                <Link href={"/admin/materials/" + m.id} className={a.cellLink}>
                  {m.title}
                </Link>
                <span className={a.cellSub}>
                  {m.type} · {m.authors}
                </span>
              </div>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          Icon: Clock,
          render: (m) => (
            <div className={a.stack}>
              <StatusBadge status={MAT_STATUS[m.status]} />
              {m.featured ? <StatusBadge status="Featured" /> : null}
            </div>
          ),
        },
        { key: "dl", header: "Downloads", Icon: Download, numeric: true, render: (m) => m.downloads.toLocaleString("en-US") },
        { key: "upd", header: "Updated", Icon: Clock, render: (m) => m.updated },
      ]}
      actions={MAT_ACTIONS}
      bulkKeys={["feature", "unfeature", "download", "unpub", "repub"]}
      menu={(m) => [
        [{ details: true }, { link: matHref(m), label: matOpenLabel(m), Icon: m.status === "inreview" ? Inbox : ExternalLink }, { link: "/admin/materials/" + m.id, label: "Edit", Icon: Pencil }],
        [{ action: "feature" }, { action: "unfeature" }, { action: "download" }],
        [{ action: "unpub" }, { action: "repub" }],
      ]}
      details={(m) => ({
        title: m.title,
        desc: m.type + " · " + m.authors,
        status: (
          <>
            <StatusBadge status={MAT_STATUS[m.status]} />
            {m.featured ? <StatusBadge status="Featured" /> : null}
          </>
        ),
        facts: [
          { k: "ID", v: m.id, Icon: Hash },
          { k: "Discipline", v: m.discipline, Icon: BookOpen },
          { k: "License", v: m.license, Icon: FileText },
          { k: "Downloads", v: m.downloads.toLocaleString("en-US"), Icon: Download },
          { k: "Courses", v: String(m.courses), Icon: Users },
          { k: "Files", v: m.files.map((f) => f.role + (f.gated ? " (verified)" : "")).join(", "), Icon: Folder },
        ],
        history: m.history,
        open: { href: matHref(m), label: matOpenLabel(m) },
        edit: "/admin/materials/" + m.id,
      })}
      emailLine="Every author gets an email."
      rowName={(m) => m.title}
    />
  );
}

// ---------- Users ----------

export const USER_STATUS: Record<AdminUser["status"] | "suspended", { label: string; tone: Tone; Icon: typeof Shield }> = {
  verified: { label: "Verified", tone: "ok", Icon: BadgeCheck },
  review: { label: "In review", tone: "info", Icon: Clock },
  none: { label: "Not verified", tone: "neutral", Icon: Shield },
  renewal: { label: "Renewal due", tone: "warn", Icon: RefreshCw },
  suspended: { label: "Suspended", tone: "danger", Icon: CircleX },
};

export function UserStatus({ u }: { u: AdminUser }) {
  const s = USER_STATUS[u.suspended ? "suspended" : u.status];
  return (
    <div className={a.stack}>
      <Badge tone={s.tone} icon={<s.Icon size={14} aria-hidden />}>
        {s.label}
      </Badge>
      {u.role === "Admin" ? (
        <Badge tone="neutral" icon={<Users size={14} aria-hidden />}>
          Admin
        </Badge>
      ) : null}
    </div>
  );
}

const first = (L: AdminUser[]) => (L.length === 1 ? L[0].name.split(" ")[0] : "them");

const USER_ACTIONS: Record<string, ActionSpec<AdminUser>> = {
  reset: { label: "Send password reset link", bulk: "Send password reset links", Icon: Mail, ok: (u) => !u.suspended, what: "Password reset link sent", done: (n) => (n === 1 ? "Password reset link sent" : n + " password reset links sent") },
  remind: { label: "Send renewal reminder", bulk: "Send renewal reminders", Icon: RefreshCw, ok: (u) => u.status === "renewal" && !u.suspended, what: "Renewal reminder sent", done: (n) => (n === 1 ? "Renewal reminder sent" : n + " renewal reminders sent") },
  recheck: { label: "Re-check faculty page", Icon: RefreshCw, ok: (u) => u.status === "verified" && u.id !== ADMIN_ID && !u.suspended, what: "Faculty page re-checked, still verified", done: () => "Faculty page re-checked. Still verified" },
  mark: { label: "Mark as verified…", Icon: BadgeCheck, ok: (u) => u.status === "none" && !u.suspended, confirm: true, note: "How you confirmed it (only admins see this)", email: "ver-ok", button: "Mark as verified", title: (L) => "Mark " + L[0].name + " as verified?", body: () => "Use this when you've confirmed they teach some other way, like a call with their department.", patch: { status: "verified", ver: "Confirmed by an admin, until Oct 23, 2027" }, what: "Marked as verified", done: () => "Marked as verified" },
  admin: { label: "Give admin access…", Icon: Users, ok: (u) => u.role !== "Admin" && !u.suspended && u.status === "verified", confirm: true, button: "Give admin access", title: (L) => "Give " + L[0].name + " admin access?", body: () => "They'll be able to review verifications and submissions, manage users and materials, and see every admin page.", patch: { role: "Admin" }, what: "Given admin access", done: () => "Admin access given" },
  unadmin: { label: "Remove admin access…", Icon: Users, danger: true, ok: (u) => u.role === "Admin" && u.id !== ADMIN_ID, confirm: true, button: "Remove admin access", title: (L) => "Remove admin access for " + L[0].name + "?", body: () => "They keep their instructor account and verification.", patch: { role: "Instructor" }, what: "Admin access removed", done: () => "Admin access removed" },
  revoke: { label: "Remove verification…", Icon: Shield, danger: true, ok: (u) => (u.status === "verified" || u.status === "renewal") && u.id !== ADMIN_ID && !u.suspended, confirm: true, reasons: ["No longer teaching at this school", "Verified by mistake", "Shared locked files publicly", "Something else"], email: "ver-revoked", button: "Remove verification", title: (L) => "Remove verification for " + (L.length === 1 ? L[0].name : L.length + " people") + "?", body: (L) => "Teaching notes and solutions lock for " + first(L) + " right away. Published materials stay up.", patch: { status: "none", ver: "Removed by an admin" }, what: "Verification removed", done: (n) => (n === 1 ? "Verification removed" : "Verification removed for " + n + " people") },
  suspend: { label: "Suspend account…", bulk: "Suspend…", Icon: CircleX, danger: true, ok: (u) => !u.suspended && u.id !== ADMIN_ID, confirm: true, reasons: ["Shared locked files publicly", "Account is compromised", "Violates the terms", "Something else"], email: "acct-suspended", button: "Suspend", title: (L) => (L.length === 1 ? "Suspend " + L[0].name + "’s account?" : "Suspend " + L.length + " accounts?"), body: (L) => (L.length === 1 ? first(L) + " can't" : "They can't") + " sign in or download locked files. Published materials stay up unless you unpublish them in Materials.", patch: { suspended: true }, what: "Suspended", done: (n) => (n === 1 ? "Account suspended" : n + " accounts suspended") },
  restore: { label: "Restore account", bulk: "Restore", Icon: CircleCheck, ok: (u) => u.suspended, patch: { suspended: false }, what: "Account restored", done: (n) => (n === 1 ? "Account restored" : n + " accounts restored") },
};

/** Every account: search, filter by verification status, and act on one or many. */
export function UsersTable() {
  return (
    <AdminCollection<AdminUser>
      storageKey="users"
      seed={USERS}
      title="Users"
      lead="Search, filter, or select accounts. Use the menu on each row for actions and details."
      countLine={(items) => items.length + " accounts"}
      searchLabel="Search by name, email, or school"
      searchText={(u) => u.name + " " + u.email + " " + u.inst}
      filters={[
        { value: "all", label: "All", test: () => true },
        { value: "verified", label: "Verified", test: (u) => !u.suspended && u.status === "verified" },
        { value: "review", label: "In review", test: (u) => u.status === "review" },
        { value: "none", label: "Not verified", test: (u) => u.status === "none" },
        { value: "renewal", label: "Renewal due", test: (u) => u.status === "renewal" },
        { value: "admin", label: "Admins", test: (u) => u.role === "Admin" },
        { value: "suspended", label: "Suspended", test: (u) => u.suspended },
      ]}
      columns={[
        {
          key: "user",
          header: "User",
          Icon: UserRound,
          render: (u) => (
            <>
              <Link href={"/admin/users/" + u.id} className={a.cellLink}>
                {u.name}
              </Link>
              <span className={a.cellSub}>{u.email}</span>
            </>
          ),
        },
        { key: "inst", header: "Institution", Icon: Building2, render: (u) => u.inst },
        { key: "status", header: "Status", Icon: Clock, render: (u) => <UserStatus u={u} /> },
        { key: "last", header: "Last signed in", Icon: LogIn, render: (u) => u.last },
      ]}
      actions={USER_ACTIONS}
      bulkKeys={["reset", "remind", "suspend", "restore"]}
      menu={(u) => [
        [{ details: true }, { link: authorHref(u.name), label: "Open profile", Icon: UserRound }, { link: "/admin/users/" + u.id, label: "Edit", Icon: Pencil }],
        [{ action: "reset" }, { action: "remind" }, { action: "recheck" }, { action: "mark" }, ...(u.status === "review" ? [{ link: "/admin/verification", label: "Open in verification queue", Icon: BadgeCheck }] : [])],
        [{ action: "admin" }, { action: "unadmin" }, { action: "revoke" }, { action: "suspend" }, { action: "restore" }],
      ]}
      details={(u) => ({
        title: u.name,
        desc: u.email,
        status: <UserStatus u={u} />,
        facts: [
          { k: "Institution", v: u.inst, Icon: Building2 },
          { k: "Title", v: u.title || "Not set", Icon: UserRound },
          { k: "Role", v: u.role, Icon: Users },
          { k: "Joined", v: u.joined, Icon: Clock },
          { k: "Verification", v: u.ver, Icon: BadgeCheck },
          { k: "Shared", v: u.work, Icon: BookOpen },
        ],
        history: u.history,
        open: { href: authorHref(u.name), label: "Open profile" },
        edit: "/admin/users/" + u.id,
      })}
      emailLine="They get an email."
      rowName={(u) => u.name}
    />
  );
}

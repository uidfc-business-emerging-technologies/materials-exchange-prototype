"use client";

import { ArrowRight, BadgeCheck, Bell, BellRing, Check, GraduationCap, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authorHref, byId, resourceHref, type DisciplineKey } from "@/lib/data";
import { useDemo, type Auth } from "@/lib/demo";
import { Badge, StatusBadge, verificationMeta, type ResourceStatus } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/controls";
import { infoToast, toast } from "@/components/ui/overlays";
import { Illustration } from "@/components/site/Illustration";
import { MaterialCover } from "@/components/site/MaterialCover";
import { signInHref } from "@/components/site/SiteHeader";
import styles from "./Account.module.css";

interface Mine {
  id: string;
  d: DisciplineKey;
  type: string;
  discipline: string;
  title: string;
  status: ResourceStatus;
  note: string;
  actions: { label: string; href?: string; onClick?: () => void }[];
}

const BASE_REPORTS = [
  { rid: "TME-0142", course: "ACCY 405: Intermediate Accounting II", term: "Fall 2026" },
  { rid: "TME-0157", course: "ACCY 451: Auditing", term: "Spring 2026" },
];

const VERIFY_LINES: Record<Exclude<Auth, "verified">, [string, string, string]> = {
  out: ["Verify you teach to unlock teaching notes and solutions.", "Verify you teach", "/verify"],
  member: ["Verify you teach to unlock teaching notes and solutions, and to share your own materials. Most instructors are verified in a few seconds.", "Verify you teach", "/verify"],
  review: ["A person is checking your page or document. We'll email you within 2 business days.", "See status", "/verify?state=review"],
  renewal: ["Re-check your page to keep teaching notes and solutions unlocked.", "Re-check now", "/verify?state=expired"],
};

export function AccountView() {
  const demo = useDemo();
  const router = useRouter();
  const me = demo.me;
  const [profile, setProfile] = useState({ name: me.name, title: me.title, inst: me.inst, page: "https://www.riverbend.edu/accountancy/faculty/priya-raman" });
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (demo.auth === "out") router.replace(signInHref("/account"));
  }, [demo.auth, router]);

  // First visit: seed a couple of saved items so the section isn't empty.
  useEffect(() => {
    if (demo.ready && demo.data.saved === undefined) demo.set({ saved: { "TME-0157": true, "TME-0149": true }, follow: { "TME-0157": true } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.ready]);

  const fresh = demo.get<boolean>("fresh", false);
  const saved = demo.get<Record<string, boolean>>("saved", {});
  const follow = demo.get<Record<string, boolean>>("follow", {});
  const savedIds = Object.keys({ ...saved, ...follow });
  const removedReports = demo.get<string[]>("removedReports", []);
  const extraReports = demo.get<{ rid: string; course: string; term: string }[]>("courseReports", []);
  const reports = (fresh ? [] : BASE_REPORTS).concat(extraReports).filter((r) => !removedReports.includes(r.rid + r.course));
  const submitted = demo.get<{ detail?: { title: string; type: string; discipline: string; d: DisciplineKey } } | null>("submitted", null);

  const mine: Mine[] = [
    ...(submitted?.detail
      ? [{ id: "TME-0171", d: submitted.detail.d, type: submitted.detail.type, discipline: submitted.detail.discipline, title: submitted.detail.title, status: "In review" as const, note: "Submitted today. A person will check it within 2 business days.", actions: [{ label: "View", href: resourceHref("TME-0171", { own: true }) }] }]
      : []),
    ...(fresh
      ? []
      : ([
          { id: "TME-0174", d: "audit", type: "Data exercise", discipline: "Audit", title: "Analytical Procedures on Payroll Data", status: "Draft", note: "Last edited October 12", actions: [{ label: "Continue editing", href: "/contribute" }] },
          { id: "TME-0172", d: "audit", type: "Data exercise", discipline: "Audit and analytics", title: "Sampling Vendor Payments in Python", status: "In review", note: "Submitted October 15. A person will check it within 2 business days.", actions: [{ label: "View", onClick: () => infoToast("Opens the in-review page, like the author view of a resource.") }] },
          { id: "TME-0127", d: "audit", type: "Data exercise", discipline: "Audit and analytics", title: "Testing Journal Entries with Python", status: "Published", note: "268 downloads · Used in 5 courses", actions: [{ label: "View", href: resourceHref("TME-0127") }, { label: "Edit", href: "/contribute" }] },
          { id: "TME-0066", d: "audit", type: "Teaching module", discipline: "Audit", title: "Fraud Triangle Mini-Cases", status: "Unpublished", note: "Unpublished August 2026. Hidden from search; old links show a notice.", actions: [{ label: "What visitors see", href: "/r/0066" }, { label: "Publish again", onClick: () => toast("Published again. It shows in Browse within a minute.") }] },
        ] as Mine[])),
  ];

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16 });
      el.focus({ preventScroll: true });
    }
  };

  const verified = demo.auth === "verified";
  const vMeta = demo.auth !== "out" ? verificationMeta(demo.auth) : null;
  const sections: [string, string, string][] = [
    ["Profile", "", "acc-profile"],
    ["Verification", vMeta && !verified ? vMeta.label : verified ? "Verified" : "Not verified", "acc-verify"],
    ["Saved", String(savedIds.length), "acc-saved"],
    ["My resources", String(mine.length), "acc-resources"],
    ["Course reports", String(reports.length), "acc-reports"],
  ];

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.h1}>Account</h1>
        <Illustration name="account" className={styles.headArt} eager />
      </div>
      <div className={styles.layout}>
        <nav aria-label="Account sections" className={styles.sideNav}>
          {sections.map(([label, meta, id]) => (
            <a key={id} href={"#" + id} onClick={scrollTo(id)} className={styles.sideLink}>
              {label}
              <span className={styles.sideMeta}>{meta}</span>
            </a>
          ))}
        </nav>

        <div className={styles.sections}>
          <section id="acc-profile" tabIndex={-1} aria-labelledby="prof-h" className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 id="prof-h" className={styles.h2}>
                Profile
              </h2>
              <Link href={authorHref(me.name)} className={styles.headLink}>
                View your author page
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <p className={styles.sub}>Your name, title, and institution appear on your author page and in citations.</p>
            <div className={styles.profileGrid}>
              {(
                [
                  ["name", "Name"],
                  ["title", "Title"],
                  ["inst", "Institution"],
                  ["page", "Faculty page"],
                ] as const
              ).map(([k, label]) => (
                <TextField
                  key={k}
                  id={"pf-" + k}
                  label={label}
                  value={profile[k]}
                  onValueChange={(v) => {
                    setSavedMsg(false);
                    setProfile((p) => ({ ...p, [k]: v }));
                  }}
                />
              ))}
            </div>
            <div className={styles.profileFoot}>
              <p className={styles.sub}>
                Sign-in email: <strong>{me.email}</strong>
              </p>
              {savedMsg ? (
                <span role="status" className={styles.ok}>
                  <Check size={16} aria-hidden />
                  Saved
                </span>
              ) : (
                <Button onClick={() => setSavedMsg(true)}>Save changes</Button>
              )}
            </div>
          </section>

          <section id="acc-verify" tabIndex={-1} aria-labelledby="ver-h" className={styles.section}>
            <h2 id="ver-h" className={styles.h2}>
              Verification
            </h2>
            {verified ? (
              <>
                <div className={styles.verCard}>
                  <div>
                    <Badge tone="ok" icon={<BadgeCheck size={16} aria-hidden />}>
                      Verified
                    </Badge>
                    <dl className={styles.verDl}>
                      <dt>Expires</dt>
                      <dd>October 17, 2027</dd>
                      <dt>Checked with</dt>
                      <dd>riverbend.edu/accountancy/faculty/priya-raman</dd>
                      <dt>Verified on</dt>
                      <dd>October 17, 2026</dd>
                    </dl>
                  </div>
                  <ButtonLink href="/verify?state=expired" variant="secondary">
                    <RefreshCw size={16} aria-hidden />
                    Re-check now
                  </ButtonLink>
                </div>
                <p className={styles.sub}>We&apos;ll email you before it expires. Re-checking takes a few seconds.</p>
              </>
            ) : (
              <div className={styles.verCard}>
                <div className={styles.verText}>
                  {vMeta ? (
                    <Badge tone={vMeta.tone} icon={<vMeta.Icon size={16} aria-hidden />}>
                      {vMeta.label}
                    </Badge>
                  ) : null}
                  <p>{VERIFY_LINES[demo.auth as Exclude<Auth, "verified">][0]}</p>
                </div>
                <ButtonLink href={VERIFY_LINES[demo.auth as Exclude<Auth, "verified">][2]}>{VERIFY_LINES[demo.auth as Exclude<Auth, "verified">][1]}</ButtonLink>
              </div>
            )}
          </section>

          <section id="acc-saved" tabIndex={-1} aria-labelledby="sav-h" className={styles.section}>
            <h2 id="sav-h" className={styles.h2}>
              Saved materials
            </h2>
            <p className={styles.sub}>Materials you saved for later. Turn on updates to get an email when an author posts a new version.</p>
            {savedIds.length === 0 ? <p className={styles.empty}>Nothing saved yet. Use Save on any resource page.</p> : null}
            <ul className={styles.list}>
              {savedIds.map((id) => {
                const r = byId(id);
                if (!r) return null;
                const f = !!follow[id];
                return (
                  <li key={id} className={styles.row}>
                    <MaterialCover id={r.id} discipline={r.d} className={styles.thumb} cellSize={18} sizes="72px" />
                    <div className={styles.rowText}>
                      <span className={styles.kicker}>
                        {r.type} · {r.discipline}
                      </span>
                      <Link href={resourceHref(id)} className={styles.rowTitle}>
                        {r.title}
                      </Link>
                      <span className={styles.rowNote}>{f ? "You'll get an email when there's a new version." : "Saved for later"}</span>
                    </div>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        aria-pressed={f}
                        className={[styles.pill, f ? styles.pillOn : ""].join(" ")}
                        onClick={() => {
                          const m = { ...follow };
                          if (m[id]) delete m[id];
                          else m[id] = true;
                          demo.set({ follow: m });
                        }}
                      >
                        {f ? <BellRing size={16} aria-hidden /> : <Bell size={16} aria-hidden />}
                        {f ? "Getting updates" : "Get updates"}
                      </button>
                      <Button
                        variant="quiet"
                        aria-label={`Remove ${r.title} from saved`}
                        className={styles.remove}
                        onClick={() => {
                          const a = { ...saved };
                          const b = { ...follow };
                          delete a[id];
                          delete b[id];
                          demo.set({ saved: a, follow: b });
                        }}
                      >
                        <Trash2 size={15} aria-hidden />
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section id="acc-resources" tabIndex={-1} aria-labelledby="res-h" className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 id="res-h" className={styles.h2}>
                My resources
              </h2>
              <ButtonLink href="/contribute" variant="secondary">
                <Plus size={16} aria-hidden />
                Share materials
              </ButtonLink>
            </div>
            {mine.length ? (
              <ul className={styles.list}>
                {mine.map((m) => (
                  <li key={m.id} className={styles.row}>
                    <MaterialCover id={m.id} discipline={m.d} className={styles.thumb} cellSize={18} sizes="72px" />
                    <div className={styles.rowText}>
                      <span className={styles.kicker}>
                        {m.type} · {m.discipline}
                      </span>
                      <span className={styles.rowTitleStatic}>{m.title}</span>
                      <span className={styles.statusLine}>
                        <StatusBadge status={m.status} />
                        <span className={styles.rowNote}>{m.note}</span>
                      </span>
                    </div>
                    <div className={styles.rowActions}>
                      {m.actions.map((a) =>
                        a.href ? (
                          <ButtonLink key={a.label} href={a.href} variant="secondary">
                            {a.label}
                          </ButtonLink>
                        ) : (
                          <Button key={a.label} variant="secondary" onClick={a.onClick}>
                            {a.label}
                          </Button>
                        ),
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyBox}>
                <span className={styles.emptyIcon}>
                  <Upload size={20} aria-hidden />
                </span>
                <div>
                  <p className={styles.emptyTitle}>You haven&apos;t shared anything yet</p>
                  <p className={styles.sub}>{verified ? "Share a case, dataset, or teaching module. Drafts you start show up here, too." : "Once you’re verified, you can share cases, datasets, and teaching modules. Drafts show up here."}</p>
                </div>
              </div>
            )}
          </section>

          <section id="acc-reports" tabIndex={-1} aria-labelledby="rep-h" className={styles.section}>
            <h2 id="rep-h" className={styles.h2}>
              My course reports
            </h2>
            <p className={styles.sub}>Courses where you said you used someone&apos;s materials. Authors see the course count, not your name.</p>
            {reports.length ? (
              <ul className={styles.list}>
                {reports.map((r) => {
                  const res = byId(r.rid);
                  return (
                    <li key={r.rid + r.course} className={styles.reportRow}>
                      <div className={styles.rowText}>
                        <Link href={resourceHref(r.rid)} className={styles.reportTitle}>
                          {res ? res.title.split(":")[0] : r.rid}
                        </Link>
                        <span className={styles.rowNote}>
                          {r.course} · {r.term}
                        </span>
                      </div>
                      <Button variant="quiet" className={styles.remove} aria-label={"Remove report for " + (res?.title || r.rid)} onClick={() => demo.set({ removedReports: [...removedReports, r.rid + r.course] })}>
                        <Trash2 size={16} aria-hidden />
                        Remove
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.emptyBox}>
                <span className={styles.emptyIcon}>
                  <GraduationCap size={20} aria-hidden />
                </span>
                <div>
                  <p className={styles.emptyTitle}>No course reports yet</p>
                  <p className={styles.sub}>When you teach with someone&apos;s materials, choose &ldquo;I used this in a course&rdquo; on its page. Authors see the count, not your name.</p>
                  <Link href="/browse" className={styles.headLink}>
                    Browse materials
                    <ArrowRight size={15} aria-hidden />
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

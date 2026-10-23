"use client";

import { Calendar, Check, CircleAlert, CircleCheck, Clock, Inbox, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { Segmented, Switch } from "@/components/ui/controls";
import { ADMIN_ME } from "./AdminShell";
import a from "./admin.module.css";
import s from "./Dashboard.module.css";

type Range = "1d" | "1w" | "1m" | "3m" | "1y" | "custom";

const TODAY = new Date(2026, 9, 21);
const FIRST = new Date(2025, 7, 1);
const iso = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const parse = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const fmt = (d: Date, o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => d.toLocaleDateString("en-US", o);

/** Deterministic daily downloads: weekdays busier, summer and late December quieter. */
function daily(d: Date) {
  const idx = Math.round((d.getTime() - FIRST.getTime()) / 864e5);
  let x = (idx * 2654435761) >>> 0;
  x = (Math.imul(x ^ (x >>> 13), 1274126177) >>> 0) as number;
  const r = (x % 1000) / 1000;
  const wd = d.getDay();
  const m = d.getMonth();
  const week = wd === 0 || wd === 6 ? 0.45 : wd === 5 ? 0.9 : 1.1;
  const term = m === 5 || m === 6 ? 0.4 : m === 11 && d.getDate() > 15 ? 0.5 : m === 7 ? 0.8 : 1;
  return Math.max(0, Math.round((28 + idx * 0.05) * week * term * (0.85 + r * 0.3)));
}

function series(from: Date, to: Date) {
  const days = Math.round((to.getTime() - from.getTime()) / 864e5) + 1;
  const out: { label: string; v: number; tip: string }[] = [];
  if (days === 1) {
    const total = daily(from);
    const isToday = iso(from) === iso(TODAY);
    [0.02, 0.01, 0.04, 0.2, 0.26, 0.21, 0.17, 0.09].forEach((w, i) => {
      const h = i * 3;
      const label = h === 0 ? "12 AM" : h < 12 ? h + " AM" : h === 12 ? "12 PM" : h - 12 + " PM";
      const v = isToday && h > 9 ? (h === 12 ? Math.round(total * w * 0.15) : 0) : Math.round(total * w);
      out.push({ label, v, tip: label + ": " + v });
    });
    return { out, unit: "3-hour" };
  }
  if (days <= 31) {
    for (let i = 0; i < days; i++) {
      const d = addDays(from, i);
      const v = daily(d);
      out.push({ label: days <= 7 ? fmt(d, { weekday: "short" }) : fmt(d), v, tip: fmt(d) + ": " + v });
    }
    return { out, unit: "Daily" };
  }
  if (days <= 182) {
    for (let d = new Date(from); d <= to; d = addDays(d, 7)) {
      let v = 0;
      for (let i = 0; i < 7; i++) {
        const x = addDays(d, i);
        if (x <= to) v += daily(x);
      }
      out.push({ label: fmt(d), v, tip: "Week of " + fmt(d) + ": " + v.toLocaleString("en-US") });
    }
    return { out, unit: "Weekly" };
  }
  for (let d = new Date(from.getFullYear(), from.getMonth(), 1); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    let v = 0;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    for (let x = new Date(Math.max(d.getTime(), from.getTime())); x <= end && x <= to; x = addDays(x, 1)) v += daily(x);
    out.push({ label: fmt(d, { month: "short" }), v, tip: fmt(d, { month: "long", year: "numeric" }) + ": " + v.toLocaleString("en-US") });
  }
  return { out, unit: "Monthly" };
}

const LBL: Record<Exclude<Range, "custom">, string> = { "1d": "Today", "1w": "Last 7 days", "1m": "Last 30 days", "3m": "Last 90 days", "1y": "Last 12 months" };
const BACK: Record<Exclude<Range, "custom">, number> = { "1d": 0, "1w": 6, "1m": 29, "3m": 89, "1y": 364 };

const ALERTS = [
  ["digest", "Daily digest at 8:00 AM", "What's waiting in each queue."],
  ["late", "When anything waits over 1 business day", "One email per item, so nothing misses the promise."],
  ["weekly", "Weekly summary", "Mondays at 9:00 AM. Last week's decisions, downloads, and new materials."],
] as const;

/** Admin dashboard: what's waiting, recent activity, and this admin's email alerts. */
export function Dashboard() {
  const demo = useDemo();
  const alerts = demo.get<Record<string, boolean>>("alerts-jmorales", { digest: true, late: true, weekly: false });
  const [range, setRange] = useState<Range>("1m");
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ from: "", to: "" });
  const [dateError, setDateError] = useState("");
  const [digest, setDigest] = useState(false);

  const [from, to] = range === "custom" && custom ? [parse(custom.from)!, parse(custom.to)!] : [addDays(TODAY, -BACK[range === "custom" ? "1m" : range]), TODAY];
  const days = Math.round((to.getTime() - from.getTime()) / 864e5) + 1;
  const { out, unit } = series(from, to);
  const max = Math.max(1, ...out.map((b) => b.v));
  const every = Math.ceil(out.length / 8);
  const total = out.reduce((n, b) => n + b.v, 0);
  const sameYear = from.getFullYear() === to.getFullYear();
  const rangeText =
    days === 1
      ? fmt(to, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) + (iso(to) === iso(TODAY) ? ", so far" : "")
      : fmt(from, sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" }) + " – " + fmt(to, { month: "short", day: "numeric", year: "numeric" }) + " · " + days + " days";
  const periodLabel = range === "custom" ? rangeText.split(" · ")[0] : LBL[range].toLowerCase();
  const k = (f: number) => Math.max(0, Math.round(days * f));

  const applyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const f = parse(draft.from);
    const t = parse(draft.to);
    if (!f || !t) return setDateError("Choose a start date and an end date");
    if (f > t) return setDateError("The start date must be on or before the end date");
    if (t > TODAY) return setDateError("Choose dates up to today, October 21, 2026");
    if (f < FIRST) return setDateError("Choose a start date on or after August 1, 2025");
    setCustom({ ...draft });
    setRange("custom");
    setEditing(false);
    setDateError("");
  };

  const tiles = [
    { label: "Verifications waiting", n: "3", note: "Oldest 37 minutes", Icon: Clock, cls: a.meta, href: "/admin/verification" },
    { label: "Submissions in review", n: "4", note: "Oldest 1 day, 2 flagged", Icon: Inbox, cls: a.info, href: "/admin/submissions" },
    { label: "Within the 2-day promise", n: "100%", note: "Last 30 days, 41 decisions", Icon: CircleCheck, cls: a.ok, href: "/admin/verification" },
  ];

  return (
    <>
      <div className={a.titleRow}>
        <h1 className={a.h1}>Dashboard</h1>
        <span className={a.meta}>Wednesday, October 21, 2026 · Updated 11:24 AM</span>
      </div>

      <ul className={s.tiles}>
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className={s.tile}>
              <span className={s.tileLabel}>{t.label}</span>
              <span className={s.tileN}>{t.n}</span>
              <span className={[s.tileNote, t.cls].join(" ")}>
                <t.Icon size={15} aria-hidden />
                {t.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="act-h" className={s.activity}>
        <div className={s.actHead}>
          <div>
            <h2 id="act-h" className={s.h2}>
              Activity
            </h2>
            <p className={a.meta}>{rangeText}</p>
          </div>
          <Segmented<Range>
            label="Date range"
            variant="soft"
            value={editing ? "custom" : range}
            onValueChange={(v) => {
              if (v === "custom") {
                setEditing(true);
                setDateError("");
                setDraft(custom || { from: iso(from), to: iso(to) });
              } else {
                setRange(v);
                setEditing(false);
              }
            }}
            options={[
              { value: "1d", label: "1 day" },
              { value: "1w", label: "1 week" },
              { value: "1m", label: "1 month" },
              { value: "3m", label: "3 months" },
              { value: "1y", label: "1 year" },
              { value: "custom", label: range === "custom" && custom ? fmt(from) + " – " + fmt(to) : "Custom", icon: <Calendar size={15} aria-hidden /> },
            ]}
          />
        </div>
        {editing ? (
          <form onSubmit={applyCustom} noValidate className={s.customForm}>
            <label className={s.dateField}>
              <span>From</span>
              <input type="date" min="2025-08-01" max={iso(TODAY)} value={draft.from} onChange={(e) => (setDraft((d) => ({ ...d, from: e.target.value })), setDateError(""))} aria-invalid={!!dateError} />
            </label>
            <label className={s.dateField}>
              <span>To</span>
              <input type="date" min="2025-08-01" max={iso(TODAY)} value={draft.to} onChange={(e) => (setDraft((d) => ({ ...d, to: e.target.value })), setDateError(""))} aria-invalid={!!dateError} />
            </label>
            <Button type="submit" size="sm">
              <Check size={16} aria-hidden />
              Apply
            </Button>
            <Button variant="quiet" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            {dateError ? (
              <span role="alert" className={s.dateError}>
                <CircleAlert size={16} aria-hidden />
                {dateError}
              </span>
            ) : null}
          </form>
        ) : null}

        <div className={s.actBody}>
          <div className={s.chartCol}>
            <h3 className={s.h3}>Downloads</h3>
            <p className={a.meta}>
              {unit} downloads across all materials, {periodLabel}. {total.toLocaleString("en-US")} in total.
            </p>
            <div className={s.chart} role="img" aria-label={unit + " downloads: " + out.map((b) => b.tip).join(", ") + "."} style={{ gap: out.length > 20 ? 3 : out.length > 12 ? 6 : 14 }}>
              {out.map((b, i) => (
                <div key={i} className={s.barCol} title={b.tip}>
                  {out.length <= 12 ? <span className={s.barValue}>{b.v.toLocaleString("en-US")}</span> : null}
                  <span className={s.bar} style={{ height: Math.max(1, Math.round((b.v / max) * 88)) + "%" }} />
                </div>
              ))}
            </div>
            <div className={s.axis} aria-hidden="true" style={{ gap: out.length > 20 ? 3 : out.length > 12 ? 6 : 14 }}>
              {out.map((b, i) => (
                <span key={i}>{i % every === 0 ? b.label : ""}</span>
              ))}
            </div>
            <h3 className={s.h3} style={{ marginTop: 28 }}>
              {range === "custom" ? "In this period" : LBL[range]}
            </h3>
            <dl className={s.totals}>
              {[
                [total.toLocaleString("en-US"), "downloads"],
                [String(k(0.3)), "new resources"],
                [String(k(2.1)), "newly verified instructors"],
                [String(k(1.2)), "course reports"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{n}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside aria-labelledby="al-h" className={s.alerts}>
            <h3 id="al-h" className={s.h3}>
              Your email alerts
            </h3>
            <p className={a.meta}>
              For {ADMIN_ME.name}, sent to {ADMIN_ME.email}. Each admin sets their own.
            </p>
            <Link href="/admin/emails?t=adm-digest" className={s.allEmails}>
              <Mail size={15} aria-hidden />
              See every email we send
            </Link>
            <ul className={s.alertList}>
              {ALERTS.map(([key, label, sub]) => (
                <li key={key}>
                  <Switch label={label} description={sub} checked={!!alerts[key]} onCheckedChange={(v) => demo.set({ "alerts-jmorales": { ...alerts, [key]: v } })} />
                </li>
              ))}
            </ul>
            <Button variant="secondary" aria-expanded={digest} onClick={() => setDigest((d) => !d)}>
              <Mail size={16} aria-hidden />
              {digest ? "Hide today’s digest" : "Preview today’s digest"}
            </Button>
            {digest ? (
              <div className={s.digest}>
                <p>
                  <strong>3 verifications and 1 submission waiting</strong>
                  <br />
                  <span className={a.meta}>From Teaching Materials Exchange · Today 8:00 AM</span>
                </p>
                <ul>
                  <li>
                    <Link href="/admin/verification">Verifications: 3 waiting</Link>
                    <br />
                    <span className={a.meta}>Oldest 37 minutes. Morgan Blake is on a 2nd request.</span>
                  </li>
                  <li>
                    <Link href="/admin/submissions">Submissions: 1 resubmitted</Link>
                    <br />
                    <span className={a.meta}>Generative AI in the Monthly Close, version 2.</span>
                  </li>
                  <li>Nothing is close to the 2-business-day promise.</li>
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}

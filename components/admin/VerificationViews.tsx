"use client";

import { Tabs } from "@base-ui/react/tabs";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleCheck,
  CircleX,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  FileUp,
  Link2,
  ListChecks,
  Mail,
  Quote,
  RefreshCw,
  Scale,
  Sparkles,
  TriangleAlert,
  UserPlus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APPLICANT_ORDER, APPLICANTS, DECLINE_REASONS, VERIFY_MESSAGES, type Applicant, type CheckTone } from "@/lib/admin-data";
import { useDemo } from "@/lib/demo";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Select, TextField } from "@/components/ui/controls";
import { infoToast, TabsList } from "@/components/ui/overlays";
import a from "./admin.module.css";

type Decided = Record<string, string>;

function useDecided() {
  const demo = useDemo();
  const decided = demo.get<Decided>("adminDecided", {});
  return { decided, decide: (id: string, text: string) => demo.set({ adminDecided: { ...decided, [id]: text } }) };
}

const needsReview = (decided: Decided) => APPLICANT_ORDER.filter((id) => APPLICANTS[id].sug === "Needs review" && !decided[id]);

function CheckIcon({ tone }: { tone: CheckTone }) {
  if (tone === "ok") return <CircleCheck size={16} className={a.ok} aria-hidden />;
  if (tone === "bad") return <CircleX size={16} className={a.bad} aria-hidden />;
  if (tone === "doc") return <FileText size={16} className={a.info} aria-hidden />;
  return <Circle size={16} className={a.none} aria-hidden />;
}

function Suggestion({ app, done }: { app: Applicant; done?: string }) {
  const good = !!done || app.sug === "Auto-approved";
  return (
    <Badge tone={good ? "ok" : "warn"} icon={good ? <CircleCheck size={14} aria-hidden /> : <TriangleAlert size={14} aria-hidden />}>
      {done || app.sug}
    </Badge>
  );
}

/** 6.9 Verification queue: applicant, submitted, checks, and the system's suggestion. */
export function VerificationQueue() {
  const { decided } = useDecided();
  const [tab, setTab] = useState("all");
  const needs = needsReview(decided);
  const ids = tab === "need" ? needs : tab === "auto" ? ["praman"] : APPLICANT_ORDER;
  return (
    <>
      <div className={a.titleRow}>
        <h1 className={a.h1}>Verification queue</h1>
        <span className={a.meta}>Oldest waiting: 37 minutes</span>
      </div>
      <Tabs.Root value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList
          label="Queue"
          className={a.tabs}
          tabs={[
            { value: "need", label: "Needs review", count: needs.length },
            { value: "auto", label: "Auto-approved", count: 1 },
            { value: "all", label: "All today", count: 4 },
          ]}
        />
        <div className={a.tableWrap}>
          <table className={a.table}>
            <thead>
              <tr>
                <th scope="col">
                  <UserRound size={15} aria-hidden />
                  Applicant
                </th>
                <th scope="col">
                  <Clock size={15} aria-hidden />
                  Submitted
                </th>
                <th scope="col">
                  <ListChecks size={15} aria-hidden />
                  Checks
                </th>
                <th scope="col">
                  <Sparkles size={15} aria-hidden />
                  System suggestion
                </th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id) => {
                const app = APPLICANTS[id];
                const done = decided[id];
                const auto = app.sug === "Auto-approved";
                return (
                  <tr key={id}>
                    <td>
                      <span className={a.cellMain}>{app.name}</span>
                      {app.repeat ? (
                        <Badge tone="warn" className={a.repeat}>
                          {app.repeat}
                        </Badge>
                      ) : null}
                      <span className={a.cellSub}>{app.email}</span>
                      <span className={a.cellSub}>{app.inst}</span>
                    </td>
                    <td>
                      {app.when}
                      <span className={a.cellSub}>{done ? "Decided today" : app.wait}</span>
                    </td>
                    <td>
                      <ul className={a.checkList}>
                        {app.checks.map(([tone, label]) => (
                          <li key={label}>
                            <CheckIcon tone={tone} />
                            {label}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <div className={a.stack}>
                        <Suggestion app={app} done={done} />
                        <span className={a.cellSub}>Label: {app.label}</span>
                        <ButtonLink href={"/admin/verification/" + id} variant={auto || done ? "secondary" : "primary"} size="sm" className={auto || done ? undefined : a.reviewBtn} aria-label={(auto || done ? "View " : "Review ") + app.name}>
                          <Eye size={16} aria-hidden />
                          {auto || done ? "View" : "Review"}
                        </ButtonLink>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {ids.length === 0 ? <p className={a.empty}>Nothing waiting. New requests show up here as they come in.</p> : null}
        </div>
      </Tabs.Root>
    </>
  );
}

const HISTORY_ICONS = { link: Link2, mail: Mail, refresh: RefreshCw, warn: TriangleAlert, user: UserPlus, upload: FileUp, ok: CircleCheck };

/** 6.9 Verification detail: checks, evidence quote, history, and the decision. Keys A, D, L, J. */
export function VerificationDetail({ id }: { id: string }) {
  const router = useRouter();
  const { decided, decide } = useDecided();
  const c = APPLICANTS[id];
  const needs = needsReview(decided);
  const pos = needs.indexOf(id);
  const [choice, setChoice] = useState<"" | "approve" | "decline" | "link">("");
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const [message, setMessage] = useState("");
  const [openEmail, setOpenEmail] = useState<Record<number, boolean>>({});
  const done = decided[id];
  const domain = c.email.split("@")[1];
  const blake = id === "mblake";

  const next = () => {
    const rest = needs.filter((x) => x !== id);
    router.push(rest.length ? "/admin/verification/" + rest[0] : "/admin/verification");
  };

  const pick = (k: "approve" | "decline" | "link") => {
    setChoice(k);
    setMessage(k === "approve" ? "" : k === "link" && c.doc ? VERIFY_MESSAGES.doc : VERIFY_MESSAGES[k]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable || t.closest('[role="listbox"]')) return;
      const k = e.key.toLowerCase();
      if (k === "a") pick("approve");
      else if (k === "d") pick("decline");
      else if (k === "l") pick("link");
      else if (k === "j") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const rows = c.doc
    ? [
        { k: "Email domain", v: `${c.email} matches ${domain}`, result: "Match", tone: "ok" as CheckTone },
        { k: "Document", v: `${c.page} · PDF, 420 KB, 1 page`, result: "Read", tone: "ok" as CheckTone },
        { k: "Name on document", v: "Found: " + c.name, result: "Found", tone: "ok" as CheckTone },
        { k: "School on document", v: "Found: " + c.inst, result: "Found", tone: "ok" as CheckTone },
        { k: "Date on document", v: "August 4, 2026", result: "This year", tone: "ok" as CheckTone },
      ]
    : [
        { k: "Email domain", v: `${c.email} matches ${domain}`, result: "Match", tone: "ok" as CheckTone },
        { k: "Faculty page", v: c.page, result: blake ? "Needs JavaScript" : "Read", tone: (blake ? "bad" : "ok") as CheckTone },
        { k: "Name on page", v: blake ? "Not checked" : "Found: " + c.name, result: blake ? "Not checked" : "Found", tone: (blake ? "none" : "ok") as CheckTone },
        { k: "Email on page", v: id === "praman" ? "Found: " + c.email : "Not found", result: id === "praman" ? "Found" : blake ? "Not checked" : "Not found", tone: (id === "praman" ? "ok" : "none") as CheckTone },
      ];
  const labelTone = c.label === "Instructor" ? "ok" : c.label === "None" ? "neutral" : c.label === "Document" ? "info" : "warn";
  const confirmLabel = { approve: "Approve and notify " + c.first, decline: "Decline and send email", link: c.doc ? "Send request for a new document" : "Send request for a new link" };
  const ConfirmIcon = choice === "approve" ? CircleCheck : choice === "decline" ? CircleX : choice === "link" ? Link2 : Scale;

  return (
    <>
      <div className={a.titleRow}>
        <nav aria-label="Breadcrumb" className={a.breadcrumb}>
          <Link href="/admin/verification">Verification</Link>
          <ChevronRight size={14} aria-hidden />
          <span aria-current="page">{c.name}</span>
        </nav>
        <div className={a.breadcrumb}>
          <span>{pos > -1 ? `${pos + 1} of ${needs.length} needing review` : "Spot check"}</span>
          <Button variant="ghost" size="sm" onClick={next}>
            Next
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </div>
      <div className={a.titleRow} style={{ justifyContent: "flex-start", marginTop: 12 }}>
        <h1 className={a.h1}>{c.name}</h1>
        <span className={a.meta}>
          {c.email} · {c.inst} · Submitted {c.when}
        </span>
      </div>

      <div className={a.detail}>
        <div className={a.detailMain}>
          <section aria-labelledby="checks-h" className={a.section}>
            <h2 id="checks-h" className={a.h2}>
              Checks
            </h2>
            <dl className={a.kv}>
              {rows.map((r) => (
                <div key={r.k} style={{ display: "contents" }}>
                  <dt>{r.k}</dt>
                  <dd>{r.v}</dd>
                  <dd className={[a.kvResult, r.tone === "ok" ? a.ok : r.tone === "bad" ? a.bad : a.meta].join(" ")}>
                    <CheckIcon tone={r.tone} />
                    {r.result}
                  </dd>
                </div>
              ))}
            </dl>
            <div className={a.titleRow} style={{ marginTop: 14 }}>
              <span className={a.meta} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                System label <Badge tone={labelTone}>{c.label}</Badge>
              </span>
              <a href="#open" className={a.breadcrumb} onClick={(e) => (e.preventDefault(), infoToast(c.doc ? "Opens the uploaded document." : "Opens the faculty page in a new tab."))}>
                <span style={{ color: "var(--action)", textDecoration: "underline", fontWeight: 600 }}>{c.doc ? "Open the document" : "Open the page"}</span>
                <ExternalLink size={14} aria-hidden className={a.info} />
              </a>
            </div>
          </section>

          <section aria-labelledby="ev-h" className={a.section}>
            <h2 id="ev-h" className={a.h2}>
              {c.doc ? "The document" : "Evidence from the page"}
            </h2>
            {c.quote ? (
              <figure className={a.quote}>
                <blockquote className={a.quoteText} style={{ margin: 0 }}>
                  <Quote size={22} aria-hidden />
                  <span>{c.quote}</span>
                </blockquote>
                <figcaption className={a.quoteCaption}>{c.doc ? `Text read from ${c.page}, page 1 · uploaded ${c.when}` : `Quoted page text from ${c.page} · read ${c.when}`}</figcaption>
              </figure>
            ) : (
              <p className={a.lead}>No text could be read from the page.</p>
            )}
            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5 }}>
              <strong>Why it&apos;s here:</strong> {c.why}
            </p>
          </section>

          <section aria-labelledby="hist-h" className={a.section}>
            <h2 id="hist-h" className={a.h2}>
              History
            </h2>
            <ol className={a.history}>
              {c.history.map((h, i) => {
                const Icon = HISTORY_ICONS[h.icon];
                return (
                  <li key={i}>
                    <span className={a.historyWhen}>{h.when}</span>
                    <div>
                      <span className={a.historyWhat}>
                        <Icon size={16} aria-hidden className={h.tone === "ok" ? a.ok : h.tone === "warn" ? a.warnText : a.info} />
                        {h.what}
                      </span>
                      <p className={a.historyDetail}>{h.detail}</p>
                      {h.email ? (
                        <>
                          <Button variant="quiet" size="sm" aria-expanded={!!openEmail[i]} onClick={() => setOpenEmail((o) => ({ ...o, [i]: !o[i] }))}>
                            {openEmail[i] ? "Hide email" : "Show email sent"}
                            {openEmail[i] ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
                          </Button>
                          {openEmail[i] ? <p className={a.emailBox}>{h.email}</p> : null}
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside aria-labelledby="dec-h" className={a.detailAside}>
          <h2 id="dec-h" className={a.h2}>
            Decision
          </h2>
          {done ? (
            <>
              <div role="status" className={a.done}>
                <strong>{done}</strong>
                <br />
                {c.first} gets an email now.
              </div>
              <Button variant="secondary" block className={a.confirm} onClick={next}>
                <ArrowRight size={16} aria-hidden />
                Next in queue
              </Button>
            </>
          ) : (
            <>
              <div role="radiogroup" aria-label="Decision" className={a.choiceList}>
                {(
                  [
                    ["approve", "Approve", CircleCheck, a.ok, "A"],
                    ["decline", "Decline", CircleX, a.bad, "D"],
                    ["link", c.doc ? "Ask for a different document" : "Ask for a different link", c.doc ? FileUp : Link2, a.info, "L"],
                  ] as const
                ).map(([k, label, Icon, cls, key]) => (
                  <button key={k} type="button" role="radio" aria-checked={choice === k} aria-keyshortcuts={key} className={[a.choice, choice === k ? a.choiceOn : ""].join(" ")} onClick={() => pick(k)}>
                    <Icon size={18} aria-hidden className={cls} />
                    {label}
                    <span className={a.kbd} aria-hidden="true">
                      {key}
                    </span>
                  </button>
                ))}
              </div>
              {choice === "decline" || choice === "link" ? (
                <div className={a.fieldStack}>
                  {choice === "decline" ? <Select label="Reason" value={reason} onValueChange={setReason} options={DECLINE_REASONS.map((r) => ({ value: r, label: r }))} /> : null}
                  <TextField label={"Email to " + c.first} multiline rows={6} value={message} onValueChange={setMessage} />
                </div>
              ) : null}
              <Button
                size="lg"
                block
                className={a.confirm}
                disabled={!choice}
                onClick={() => {
                  if (!choice) return;
                  decide(id, { approve: "Approved", decline: "Declined", link: c.doc ? "Asked for a new document" : "Asked for a new link" }[choice]);
                }}
              >
                <ConfirmIcon size={18} aria-hidden />
                {choice ? confirmLabel[choice] : "Choose a decision"}
              </Button>
              <p className={a.keys}>Keys: A approve, D decline, L ask again, J next.</p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

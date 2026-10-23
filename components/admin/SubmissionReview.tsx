"use client";

import { Check, ChevronRight, CircleCheck, CircleX, ExternalLink, FileText, Globe, Pencil, RefreshCw, Send, ShieldCheck, Sparkles, TriangleAlert, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { detailFor, byId, resourceHref } from "@/lib/data";
import { SUBMISSIONS, type Submission } from "@/lib/admin-data";
import { PATTERN_LABEL, patternSlugFor } from "@/lib/pattern";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, TextField } from "@/components/ui/controls";
import { infoToast, toast } from "@/components/ui/overlays";
import { useCollection } from "./AdminCollection";
import a from "./admin.module.css";
import s from "./SubmissionReview.module.css";

type Choice = "approve" | "changes" | "decline";

const ATTEST = [
  "I have the right to share these materials.",
  "They contain no student records or other personal data.",
  "Company information is public or used with permission.",
  "They have not been published elsewhere under a copyright transfer, or I have permission to share them.",
];
const REASONS = ["Not teaching material", "Contains personal data that can't be removed", "Rights to share are unclear", "Duplicate of an existing resource"];

/** 6.10 Submission review: what changed, files with automatic checks, preview, attestations, decision. */
export function SubmissionReview({ id }: { id: string }) {
  const { items, save } = useCollection<Submission>("subs", SUBMISSIONS);
  const sub = items.find((x) => x.id === id) || SUBMISSIONS[0];
  const genai = sub.id === "TME-0171";
  const d = detailFor(genai || !byId(sub.id) ? "TME-0171" : sub.id, { published: true });
  const names = sub.authors.split(", ");
  const firsts = names.map((n) => n.split(" ")[0]);
  const toNames = firsts.length > 1 ? firsts.slice(0, -1).join(", ") + " and " + firsts[firsts.length - 1] : firsts[0];

  const msgFor = (c: Choice) =>
    ({
      changes: genai
        ? `Thanks for sharing this case, ${toNames}. Before we publish it, please remove or mask the two email addresses on page 3 of the exhibit.\n\nUpload the new file from My resources and it comes straight back to us.`
        : `Thanks for sharing this, ${toNames}. Before we publish it, please ${sub.flags.length ? "fix the flagged item: " + sub.flags[0].toLowerCase() + "." : "tighten the summary so it says what students do."}\n\nUpload the new file from My resources and it comes straight back to us.`,
      decline: "Thanks for sharing this with us. We can't publish it on the exchange because ",
      approve: "",
    })[c];

  const [choice, setChoice] = useState<Choice>("approve");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const done = sub.status === "published" ? "Published" : sub.status === "changes" ? "Changes requested" : sub.status === "declined" ? "Declined" : "";
  const decidedHere = !!done && sub.history[0]?.when === "Today";

  const files = genai
    ? [
        { role: "Case", name: "genai-monthly-close-case.pdf", meta: "PDF, 1.4 MB", gated: false, checks: [{ tone: "ok", text: "No personal data found" }] },
        { role: "Exhibit", name: "prompt-log-exhibit-v2.pdf", meta: "PDF, 910 KB", gated: false, checks: [{ tone: "ok", text: "No personal data found" }, { tone: "info", text: "Replaced since your request" }] },
        { role: "Teaching note", name: "genai-close-teaching-note.pdf", meta: "PDF, 2.1 MB", gated: true, checks: [{ tone: "ok", text: "No personal data found" }] },
      ]
    : d.files.map((f, i) => ({ role: f.role, name: f.name, meta: f.format + ", " + f.size, gated: f.gated, checks: sub.flags[i] ? [{ tone: "warn", text: sub.flags[i] }] : [{ tone: "ok", text: "No personal data found" }] }));

  const decide = () => {
    const status = choice === "approve" ? "published" : choice === "changes" ? "changes" : "declined";
    const what = choice === "approve" ? "Approved and published" : choice === "changes" ? "Changes requested" : "Declined: " + reason.charAt(0).toLowerCase() + reason.slice(1);
    save({ [sub.id]: { status, wait: choice === "changes" ? "Waiting on the author since today" : "Decided today", history: [{ when: "Today", what: what + " (Jamie Morales)" }, ...sub.history] } as Partial<Submission> });
    toast(choice === "approve" ? "Published. The authors get an email now." : choice === "changes" ? "Change request sent." : "Declined. The authors get an email now.");
  };
  const undo = () => {
    const orig = SUBMISSIONS.find((x) => x.id === sub.id)!;
    save({ [sub.id]: { status: orig.status, wait: orig.wait, history: orig.history } as Partial<Submission> });
  };

  const ConfirmIcon = choice === "approve" ? Globe : choice === "changes" ? Send : CircleX;

  return (
    <>
      <nav aria-label="Breadcrumb" className={a.breadcrumb}>
        <Link href="/admin/submissions">Submissions</Link>
        <ChevronRight size={14} aria-hidden />
        <span aria-current="page">{sub.title}</span>
      </nav>
      <div className={s.titleRow}>
        <h1 className={a.h1}>{sub.title}</h1>
        {genai ? (
          <Badge tone="info" icon={<RefreshCw size={14} aria-hidden />}>
            Resubmitted
          </Badge>
        ) : null}
      </div>
      <p className={a.meta}>
        {sub.authors}, {sub.inst} · {genai ? "Resubmitted today 11:20 · Version 2, after changes were requested October 14" : "Submitted " + sub.when} · {sub.ct === "first" ? "First-time contributor" : "Trusted contributor"}
      </p>

      <ul className={s.strip}>
        <li>
          <FileText size={16} aria-hidden />
          {files.length} files
        </li>
        <li className={sub.flags.length ? a.warnText : a.ok}>
          {sub.flags.length ? <TriangleAlert size={16} aria-hidden /> : <CircleCheck size={16} aria-hidden />}
          {sub.flags.length ? sub.flags.length + (sub.flags.length === 1 ? " flag" : " flags") : "No flags"}
        </li>
        {genai ? (
          <li className={a.info}>
            <RefreshCw size={16} aria-hidden />1 file replaced, summary edited
          </li>
        ) : null}
        <li className={a.ok}>
          <CircleCheck size={16} aria-hidden />
          All 4 attestations
        </li>
        <li>{d.license}</li>
      </ul>

      <div className={a.detail} style={{ marginTop: 0 }}>
        <div className={s.main}>
          {genai ? (
            <section aria-labelledby="chg-h" className={s.changed}>
              <div className={s.changedHead}>
                <h2 id="chg-h" className={a.h2}>
                  What changed since your request
                </h2>
                <span className={a.meta}>Version 1, October 14 to version 2, today</span>
              </div>
              <div className={s.asked}>
                <div>
                  <p className={s.small}>You asked for</p>
                  <p>Remove or mask the two email addresses on page 3 of the exhibit.</p>
                  <p className={s.by}>Jamie Morales, October 14</p>
                </div>
                <div>
                  <p className={s.small}>Authors&apos; note</p>
                  <p>Masked both addresses and tightened the summary.</p>
                  <p className={s.by}>Elena Fischer, today</p>
                </div>
              </div>
              <div className={s.change}>
                <Badge tone="info">Replaced</Badge>
                <p>
                  <strong>Exhibit:</strong> prompt-log-exhibit.pdf is now prompt-log-exhibit-v2.pdf. <span className={a.ok}>The personal-data check now passes.</span>
                </p>
              </div>
              <div className={s.change}>
                <Badge tone="info">Edited</Badge>
                <p>
                  <strong>Summary:</strong> <del className={s.del}>Students review how a controller&apos;s team used a generative AI assistant during the monthly close and decide</del> <ins className={s.ins}>Students review a controller&apos;s AI-assisted monthly close and decide</ins> which uses need new review controls.
                </p>
              </div>
              <div className={s.change}>
                <Badge tone="neutral">No change</Badge>
                <p className={a.meta}>Case, teaching note, authors, license, and cover.</p>
              </div>
            </section>
          ) : null}

          <section aria-labelledby="files-h" className={s.block}>
            <h2 id="files-h" className={a.h2}>
              Files and automatic checks
            </h2>
            <ul className={s.files}>
              {files.map((f) => (
                <li key={f.name}>
                  <div className={s.fileName}>
                    <span className={a.cellMain}>{f.role}</span>
                    <span className={a.cellSub}>
                      {f.name} · {f.meta}
                    </span>
                    <span className={s.vis}>
                      {f.gated ? <ShieldCheck size={14} aria-hidden /> : <Globe size={14} aria-hidden />}
                      {f.gated ? "Verified instructors only" : "Anyone"}
                    </span>
                  </div>
                  <ul className={s.fileChecks}>
                    {f.checks.map((ck) => (
                      <li key={ck.text} className={ck.tone === "warn" ? a.warnText : undefined}>
                        {ck.tone === "ok" ? <CircleCheck size={16} className={a.ok} aria-hidden /> : ck.tone === "warn" ? <TriangleAlert size={16} aria-hidden /> : <RefreshCw size={16} className={a.info} aria-hidden />}
                        {ck.text}
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => infoToast("Opens " + f.name + " in a viewer.")}>
                    <ExternalLink size={15} aria-hidden />
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="prev-h" className={s.block}>
            <div className={s.changedHead}>
              <h2 id="prev-h" className={a.h2}>
                Resource preview
              </h2>
              <Link href={genai ? resourceHref("TME-0171", { own: true }) : resourceHref(d.id)} className={s.openFull} target="_blank">
                Open full page
                <ExternalLink size={14} aria-hidden />
              </Link>
            </div>
            <p className={s.previewSummary}>{genai ? "Students review a controller's AI-assisted monthly close and decide which uses need new review controls." : d.summary}</p>
            <dl className={s.facts}>
              <dt>Type</dt>
              <dd>{d.type}</dd>
              <dt>Discipline</dt>
              <dd>{genai ? "Emerging technology" : d.discipline}</dd>
              <dt>Course level</dt>
              <dd>
                {d.level} · {d.time}
              </dd>
              <dt>Tools and topics</dt>
              <dd>{d.tools.join(", ") + (genai ? " · monthly close, internal controls, AI governance" : "")}</dd>
              <dt>Cover</dt>
              <dd className={s.coverLine}>
                {PATTERN_LABEL[patternSlugFor(d.d)]} pattern, Illini palette
                <span className={s.swatches} aria-hidden="true">
                  <span style={{ background: "#13294B" }} />
                  <span style={{ background: "#FF5F05" }} />
                  <span style={{ background: "#5C0E41" }} />
                </span>
              </dd>
              {d.objectives.length ? (
                <>
                  <dt>Objectives</dt>
                  <dd>
                    <ol className={s.objectives}>
                      {d.objectives.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ol>
                  </dd>
                </>
              ) : null}
              {genai ? (
                <>
                  <dt>How it was filled in</dt>
                  <dd className={s.coverLine}>
                    <Sparkles size={15} className={a.info} aria-hidden />
                    <span style={{ flex: "1 1 200px" }}>Drafted from the uploaded files, then checked and edited by Elena</span>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>

          <section aria-labelledby="att-h" className={s.block}>
            <h2 id="att-h" className={a.h2}>
              Contributor&apos;s attestations
            </h2>
            <ul className={s.attest}>
              {ATTEST.map((t) => (
                <li key={t}>
                  <Check size={17} className={a.ok} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className={s.by}>Confirmed by {names[0]}, {genai ? "today 11:20" : sub.when}. Not entered for the annual awards.</p>
          </section>
        </div>

        <aside aria-labelledby="dec-h" className={a.detailAside}>
          <h2 id="dec-h" className={a.h2}>
            Decision
          </h2>
          {decidedHere ? (
            <>
              <div role="status" className={a.done}>
                <strong>{done}</strong>
                <br />
                {toNames} {names.length > 1 ? "get" : "gets"} an email now.
              </div>
              <Button variant="secondary" block className={a.confirm} onClick={undo}>
                <Undo2 size={16} aria-hidden />
                Undo
              </Button>
            </>
          ) : done ? (
            <div role="status" className={a.done}>
              <strong>{done}</strong>
              <br />
              {sub.wait}.
            </div>
          ) : (
            <>
              <div role="radiogroup" aria-label="Decision" className={a.choiceList}>
                {(
                  [
                    ["approve", "Approve and publish", CircleCheck, a.ok, "Publishes now and emails the authors."],
                    ["changes", "Request changes", Pencil, a.info, "Sends it back with your notes. It stays in review."],
                    ["decline", "Decline", CircleX, a.bad, "Won't be published. The authors get your reason."],
                  ] as const
                ).map(([k, label, Icon, cls, hint]) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={choice === k}
                    className={[a.choice, s.choiceTall, choice === k ? a.choiceOn : ""].join(" ")}
                    onClick={() => {
                      setChoice(k);
                      setMessage(msgFor(k));
                    }}
                  >
                    <span className={s.choiceText}>
                      <span className={s.choiceLabel}>
                        <Icon size={18} aria-hidden className={cls} />
                        {label}
                      </span>
                      <span className={s.choiceHint}>{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
              {choice !== "approve" ? (
                <div className={a.fieldStack}>
                  {choice === "decline" ? <Select label="Reason" value={reason} onValueChange={setReason} options={REASONS.map((r) => ({ value: r, label: r }))} /> : null}
                  <TextField label={"Email to " + toNames} multiline rows={8} value={message || msgFor(choice)} onValueChange={setMessage} />
                </div>
              ) : null}
              <Button size="lg" block className={a.confirm} onClick={decide}>
                <ConfirmIcon size={18} aria-hidden />
                {choice === "approve" ? "Publish now" : choice === "changes" ? "Send request for changes" : "Decline and send email"}
              </Button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

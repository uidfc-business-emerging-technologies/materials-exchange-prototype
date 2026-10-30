"use client";

import { ArrowLeft, BadgeCheck, Check, Circle, CircleAlert, CircleCheck, CircleX, Clock, FileText, FileUp, Info, Link2, LoaderCircle, Lock, RefreshCw, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { detailFor, resourceHref, resourceIdFromSlug } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { RadioCards, TextField } from "@/components/ui/controls";
import { DataIcon } from "@/components/ui/DataIcon";
import { infoToast } from "@/components/ui/overlays";
import { Illustration } from "@/components/site/Illustration";
import { MaterialCover } from "@/components/site/MaterialCover";
import { signInHref } from "@/components/site/SiteHeader";
import styles from "./Verify.module.css";

type Step = "form" | "checking" | "verified" | "review" | "declined" | "expired";
type Method = "link" | "doc";

const STEPS: Step[] = ["form", "checking", "verified", "review", "declined", "expired"];
const DEFAULT_URL = "https://www.riverbend.edu/accountancy/faculty/priya-raman";

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function validate(u: string) {
  if (!u.trim()) return "Enter the link to your faculty or directory page";
  if (!/^https?:\/\/[^\s/]+\.[^\s]+/i.test(u.trim())) return "Enter a full link that starts with https://";
  return "";
}

/** What the automatic check decides. In the prototype: .edu pages pass, /people/ pages need a person. */
function outcome(u: string): { st: "verified" | "review" | "declined"; reason: string } {
  const h = host(u);
  if (!h.endsWith(".edu")) return { st: "declined", reason: `This page is on ${h}, not your school's website.` };
  if (/\/people\//.test(u)) return { st: "review", reason: "" };
  return { st: "verified", reason: "" };
}

/** The resource the person came from, if any, read from ?returnTo=/r/0142. */
function useReturn(params: URLSearchParams | null) {
  const raw = params?.get("returnTo") || "";
  const m = /\/r\/([A-Z0-9-]+)/i.exec(raw);
  if (!m) return null;
  const r = detailFor(resourceIdFromSlug(m[1]));
  return { href: resourceHref(r.id), id: r.id, d: r.d, type: r.type, short: r.title.split(":")[0], gated: r.files.filter((f) => f.gated) };
}

export function VerifyView() {
  const params = useSearchParams();
  const router = useRouter();
  const demo = useDemo();
  const ret = useReturn(params);
  const initial = params?.get("state") as Step | null;
  const [st, setSt] = useState<Step>(initial && STEPS.includes(initial) ? initial : "form");
  const [method, setMethod] = useState<Method>("link");
  const [url, setUrl] = useState(DEFAULT_URL);
  const [url2, setUrl2] = useState("");
  const [doc, setDoc] = useState<{ name: string; meta: string } | null>(null);
  const [error, setError] = useState("");
  const [sentUrl, setSentUrl] = useState(st === "review" ? "https://www.riverbend.edu/accountancy/people/priya-raman" : DEFAULT_URL);
  const [reason, setReason] = useState("This page is on linkedin.com, not your school's website.");
  const [via, setVia] = useState<Method>("link");
  const [done, setDone] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Verification needs an account: send guests to sign in first, then back here.
  useEffect(() => {
    if (demo.auth === "out") router.replace(signInHref("/verify" + (params?.toString() ? "?" + params.toString() : "")));
  }, [demo.auth, params, router]);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Move focus to the new heading when the step changes, so screen readers hear the result.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [st]);

  const start = (u: string) => {
    const target = u.trim();
    const res = outcome(target);
    setSentUrl(target);
    setDone(0);
    setError("");
    setSt("checking");
    const tick = (n: number) => {
      timer.current = setTimeout(
        () => {
          if (n < 4) {
            setDone(n + 1);
            tick(n + 1);
            return;
          }
          demo.setIdentity({ auth: res.st === "verified" ? "verified" : res.st === "review" ? "review" : "member" });
          if (res.reason) setReason(res.reason);
          setUrl2("");
          setSt(res.st);
        },
        n === 0 ? 500 : 750,
      );
    };
    tick(0);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "doc") {
      if (!doc) {
        setError("Choose a document to upload");
        return;
      }
      setVia("doc");
      setError("");
      demo.setIdentity({ auth: "review" });
      setSt("review");
      return;
    }
    const err = validate(url);
    if (err) {
      setError(err);
      return;
    }
    setVia("link");
    start(url);
  };

  const toForm = (m?: Method) => {
    setError("");
    if (m) setMethod(m);
    setSt("form");
    window.scrollTo(0, 0);
  };

  const backHref = ret ? ret.href : "/browse";
  const backLabel = ret ? "Back to " + ret.short : "Back to browse";
  const backButton = ret ? "Back to the " + (ret.id === "TME-0142" ? "Lakeside Fitness case" : ret.type.toLowerCase()) : "Browse materials";
  const domain = demo.me.email.split("@")[1] || "riverbend.edu";
  const h = host(sentUrl) || domain;
  const checks = ["Opened your page", "The page is on " + h, "Looking for your name and title", "Confirming that you teach"];
  const contact = () => infoToast("Contact opens an email to the Center team.");

  return (
    <div className={styles.page}>
      <div className={styles.col}>
        {["form", "checking", "declined", "expired"].includes(st) ? (
          <Link href={backHref} className={styles.back}>
            <ArrowLeft size={16} aria-hidden />
            {backLabel}
          </Link>
        ) : null}
        <Illustration name="verify" className={styles.art} eager />

        {st === "form" ? (
          <>
            {error ? (
              <div role="alert" className={styles.summary}>
                <CircleAlert size={20} aria-hidden className={styles.summaryIcon} />
                <div>
                  <p className={styles.summaryTitle}>There is 1 problem</p>
                  <a href={method === "doc" ? "#v-doc" : "#v-url"} className={styles.summaryLink}>
                    {error}
                  </a>
                </div>
              </div>
            ) : null}
            <p className={styles.eyebrow}>Instructor verification</p>
            <h1 ref={headingRef} tabIndex={-1} className={styles.h1}>
              Verify you teach
            </h1>
            <p className={styles.lead}>
              Teaching notes and solutions are for instructors only, so students can&apos;t find answer keys. Paste the link to your faculty or directory page, or upload a document from your school. Most instructors with a faculty page are verified in a few seconds.
            </p>
            {ret ? (
              <div className={styles.returnCard}>
                <MaterialCover id={ret.id} discipline={ret.d} className={styles.returnCover} cellSize={20} sizes="56px" />
                <div className={styles.returnText}>
                  <span className={styles.returnHint}>After this, you&apos;ll go back to</span>
                  <span className={styles.returnTitle}>{ret.short}</span>
                  <span className={styles.returnSub}>Unlocks the teaching note and solution</span>
                </div>
              </div>
            ) : null}

            <form onSubmit={submit} noValidate className={styles.form}>
              <RadioCards<Method>
                label="How do you want to verify?"
                value={method}
                onValueChange={(v) => {
                  setMethod(v);
                  setError("");
                }}
                options={[
                  { value: "link", label: "Faculty page link", icon: <Link2 size={17} aria-hidden />, description: "Fastest. Usually checked in a few seconds." },
                  { value: "doc", label: "Upload a document", icon: <FileUp size={17} aria-hidden />, description: "For when there's no public page. A person reviews it within 2 business days." },
                ]}
              />

              {method === "link" ? (
                <TextField
                  id="v-url"
                  label="Link to your faculty or directory page"
                  description="Use a page on your school's website that shows your name and title."
                  type="url"
                  inputMode="url"
                  value={url}
                  onValueChange={(v) => {
                    setUrl(v);
                    if (error) setError("");
                  }}
                  placeholder="https://"
                  leading={<Link2 size={16} aria-hidden />}
                  error={error || undefined}
                />
              ) : (
                <div className={styles.docField}>
                  <span className={styles.docLabel}>Document</span>
                  <span className={styles.docDesc}>A recent appointment letter, teaching contract, or course schedule that lists you as the instructor. PDF, JPG, or PNG, up to 10 MB.</span>
                  {error ? (
                    <span className={styles.inlineError}>
                      <CircleAlert size={16} aria-hidden />
                      {error}
                    </span>
                  ) : null}
                  {!doc ? (
                    <div className={[styles.dropZone, error ? styles.dropZoneError : ""].join(" ")}>
                      <Upload size={26} aria-hidden className={styles.dropIcon} />
                      <span>Drag a file here, or</span>
                      <Button
                        id="v-doc"
                        variant="secondary"
                        onClick={() => {
                          setDoc({ name: "appointment-letter-2026.pdf", meta: "PDF, 420 KB" });
                          setError("");
                        }}
                      >
                        Choose file
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.docRow}>
                      <span className={styles.docIcon}>
                        <FileText size={18} aria-hidden />
                      </span>
                      <span className={styles.docText}>
                        <span className={styles.docName}>{doc.name}</span>
                        <span className={styles.docOk}>
                          <CircleCheck size={14} aria-hidden />
                          {doc.meta} · Ready to send
                        </span>
                      </span>
                      <Button variant="quiet" aria-label={"Remove " + doc.name} onClick={() => setDoc(null)}>
                        <Trash2 size={16} aria-hidden />
                        Remove
                      </Button>
                    </div>
                  )}
                  <p className={styles.privacy}>
                    <Lock size={16} aria-hidden />
                    <span>Only our verification team sees your document, and we delete it after review. You can cover salary and ID numbers before you upload. A person reviews documents within 2 business days.</span>
                  </p>
                </div>
              )}

              <div className={styles.actions}>
                <Button type="submit" size="lg">
                  {method === "doc" ? "Send for review" : "Check my page"}
                </Button>
                <Link href={backHref} className={styles.textLink}>
                  Not now
                </Link>
              </div>
            </form>

            <section aria-labelledby="wwc-h" className={styles.checks}>
              <h2 id="wwc-h" className={styles.h2small}>
                What we check
              </h2>
              {method === "link" ? (
                <>
                  <ul className={styles.checkList}>
                    <li>
                      <Check size={18} aria-hidden />
                      <span>
                        The page is on your school&apos;s website. Your email ends in {domain}, so a {domain} page is quickest.
                      </span>
                    </li>
                    <li>
                      <Check size={18} aria-hidden />
                      <span>It lists your name.</span>
                    </li>
                    <li>
                      <Check size={18} aria-hidden />
                      <span>It shows that you teach, for example as a professor, lecturer, or instructor.</span>
                    </li>
                  </ul>
                  <p className={styles.dataNote}>
                    <Info size={18} aria-hidden />
                    <span>We check that the page is on your school&apos;s website and lists you as an instructor. We don&apos;t keep a copy of the page.</span>
                  </p>
                  <p className={styles.small}>
                    Can&apos;t find a page like this?{" "}
                    <button type="button" className={styles.inlineLink} onClick={() => toForm("doc")}>
                      Upload a document instead
                    </button>
                    .
                  </p>
                </>
              ) : (
                <>
                  <ul className={styles.checkList}>
                    <li>
                      <Check size={18} aria-hidden />
                      <span>It&apos;s from your school, such as an appointment letter, teaching contract, or course schedule.</span>
                    </li>
                    <li>
                      <Check size={18} aria-hidden />
                      <span>The name on it matches the name on your account.</span>
                    </li>
                    <li>
                      <Check size={18} aria-hidden />
                      <span>It shows that you teach, and it&apos;s from the current or last academic year.</span>
                    </li>
                  </ul>
                  <p className={styles.small}>
                    Not sure a document counts?{" "}
                    <button type="button" className={styles.inlineLink} onClick={contact}>
                      Contact us
                    </button>{" "}
                    and we&apos;ll help.
                  </p>
                </>
              )}
            </section>
          </>
        ) : null}

        {st === "checking" ? (
          <>
            <p className={styles.eyebrow}>Instructor verification</p>
            <h1 ref={headingRef} tabIndex={-1} className={styles.h1}>
              Checking your page
            </h1>
            <p className={styles.lead}>This usually takes a few seconds. Stay on this page and the result will show here.</p>
            <p className={styles.sent}>
              <Link2 size={16} aria-hidden />
              {sentUrl}
            </p>
            <ol aria-live="polite" className={styles.progress}>
              {checks.map((label, i) => {
                const state = i < done ? "Done" : i === done ? "Checking" : "Next";
                return (
                  <li key={label}>
                    {i < done ? <CircleCheck size={20} className={styles.okIcon} aria-hidden /> : i === done ? <LoaderCircle size={20} className={styles.spin} aria-hidden /> : <Circle size={20} className={styles.waitIcon} aria-hidden />}
                    <span className={styles.progressLabel}>{label}</span>
                    <span className={styles.progressState}>{state}</span>
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => {
                clearTimeout(timer.current);
                setSt("form");
              }}
            >
              Cancel
            </button>
          </>
        ) : null}

        {st === "verified" ? (
          <>
            <Badge tone="ok" icon={<BadgeCheck size={16} aria-hidden />} className={styles.stateBadge}>
              Verified
            </Badge>
            <h1 ref={headingRef} tabIndex={-1} className={styles.h1Result}>
              You&apos;re verified
            </h1>
            <p role="status" className={styles.lead}>
              Thanks, {demo.me.first}. Teaching notes and solutions are now unlocked for you everywhere on the exchange.
            </p>
            {ret ? (
              <section aria-labelledby="unl-h" className={styles.unlocked}>
                <h2 id="unl-h" className={styles.unlockedTitle}>
                  Now unlocked in {ret.short}
                </h2>
                {ret.gated.map((g) => (
                  <div key={g.name} className={styles.unlockedRow}>
                    <span className={styles.docIcon}>
                      <DataIcon name={g.icon} size={18} />
                    </span>
                    <span className={styles.unlockedText}>
                      <span className={styles.unlockedRole}>{g.role}</span>
                      <span className={styles.unlockedMeta}>
                        {g.format}, {g.size}
                      </span>
                    </span>
                    <span className={styles.unlockedTag}>
                      <Check size={16} aria-hidden />
                      Unlocked
                    </span>
                  </div>
                ))}
              </section>
            ) : null}
            <div className={styles.actionsResult}>
              <ButtonLink href={backHref} size="lg">
                <ArrowLeft size={16} aria-hidden />
                {backButton}
              </ButtonLink>
              <ButtonLink href="/contribute" variant="secondary" size="lg">
                Share your own materials
              </ButtonLink>
            </div>
            <p className={styles.footnote}>We&apos;ll email you at {demo.me.email} before your verification is due for renewal.</p>
          </>
        ) : null}

        {st === "review" ? (
          <>
            <Badge tone="info" icon={<Clock size={16} aria-hidden />} className={styles.stateBadge}>
              In review
            </Badge>
            <h1 ref={headingRef} tabIndex={-1} className={styles.h1Result}>
              {via === "doc" ? "A person will review your document" : "A person will check your page"}
            </h1>
            <p role="status" className={styles.lead}>
              Thanks. A person on our team will check this within 2 business days. You can keep browsing and downloading public files while you wait.
            </p>
            <dl className={styles.facts}>
              <dt>You sent</dt>
              <dd>{via === "doc" && doc ? doc.name : sentUrl}</dd>
              <dt>Why a person</dt>
              <dd>{via === "doc" ? "Documents are always reviewed by a person." : "We found your name, but the page doesn't say whether you teach."}</dd>
              <dt>We&apos;ll email</dt>
              <dd>{demo.me.email}</dd>
            </dl>
            <div className={styles.actionsResult}>
              <ButtonLink href={backHref} size="lg">
                <ArrowLeft size={16} aria-hidden />
                {backButton}
              </ButtonLink>
              <ButtonLink href="/browse" variant="secondary" size="lg">
                Browse materials
              </ButtonLink>
            </div>
            <p className={styles.small}>
              {via === "doc" ? "Sent the wrong file?" : "Sent the wrong link?"}{" "}
              <button type="button" className={styles.inlineLink} onClick={() => toForm(via)}>
                {via === "doc" ? "Upload a different document" : "Use a different page"}
              </button>
            </p>
          </>
        ) : null}

        {st === "declined" ? (
          <>
            <Badge tone="danger" icon={<CircleX size={16} aria-hidden />} className={styles.stateBadge}>
              Not verified
            </Badge>
            <h1 ref={headingRef} tabIndex={-1} className={styles.h1Result}>
              We couldn&apos;t verify you from that page
            </h1>
            <p className={styles.lead}>We couldn&apos;t confirm that you teach from that page. Try a page on your school&apos;s website that lists your name and title, or contact us.</p>
            <div role="alert" className={styles.why}>
              <CircleX size={20} aria-hidden className={styles.whyIcon} />
              <div className={styles.whyText}>
                <p>
                  <strong>Why:</strong> {reason}
                </p>
                <p className={styles.whyUrl}>{sentUrl}</p>
              </div>
            </div>
            <form
              noValidate
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                const err = validate(url2);
                if (err) {
                  setError(err);
                  return;
                }
                start(url2);
              }}
            >
              <TextField
                id="v-url2"
                label="Try another page"
                description="Your department's faculty list or your school's directory both work."
                type="url"
                inputMode="url"
                value={url2}
                onValueChange={(v) => {
                  setUrl2(v);
                  if (error) setError("");
                }}
                placeholder="https://"
                leading={<Link2 size={16} aria-hidden />}
                error={error || undefined}
              />
              <div>
                <Button type="submit" size="lg">
                  Check this page
                </Button>
              </div>
            </form>
            <p className={styles.small} style={{ marginTop: 28 }}>
              No page that works?{" "}
              <button type="button" className={styles.inlineLink} onClick={() => toForm("doc")}>
                Upload a document instead
              </button>
              .
            </p>
            <p className={styles.small} style={{ marginTop: 10 }}>
              Still stuck?{" "}
              <button type="button" className={styles.inlineLink} onClick={contact}>
                Contact us
              </button>{" "}
              and we&apos;ll sort it out. You can keep browsing and downloading public files.
            </p>
          </>
        ) : null}

        {st === "expired" ? (
          <>
            <Badge tone="warn" icon={<RefreshCw size={15} aria-hidden />} className={styles.stateBadge}>
              Renewal due
            </Badge>
            <h1 ref={headingRef} tabIndex={-1} className={styles.h1Result}>
              Your verification is due for renewal
            </h1>
            <p className={styles.lead}>Re-check your page to keep downloading teaching notes and solutions. It takes a few seconds.</p>
            <div className={styles.yourPage}>
              <span className={styles.yourPageLabel}>Your page</span>
              <p className={styles.yourPageUrl}>
                <Link2 size={16} aria-hidden />
                {DEFAULT_URL}
              </p>
              <p className={styles.yourPageMeta}>Last checked October 2, 2025</p>
            </div>
            <div className={styles.actionsResult} style={{ marginTop: 24 }}>
              <Button size="lg" onClick={() => start(DEFAULT_URL)}>
                <RefreshCw size={16} aria-hidden />
                Re-check my page
              </Button>
              <button type="button" className={styles.textLink} onClick={() => toForm("link")}>
                Use a different page
              </button>
            </div>
            <p className={styles.dataNote} style={{ marginTop: 28 }}>
              <Lock size={17} aria-hidden />
              <span>Until you re-check, teaching notes and solutions are locked. Public files are still available.</span>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

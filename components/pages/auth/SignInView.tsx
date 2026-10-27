"use client";

import { ArrowLeft, BadgeCheck, Check, Circle, CircleCheck, CircleX, Clock, ExternalLink, FileText, FileUp, Info, Link2, LoaderCircle, Lock, Mail, Trash2, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { detailFor, resourceHref, resourceIdFromSlug } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { RadioCards, TextField } from "@/components/ui/controls";
import { ErrorSummary, errorFor, type FormError } from "@/components/ui/ErrorSummary";
import { infoToast, toast } from "@/components/ui/overlays";
import { SplitArt } from "@/components/site/SplitArt";
import { verifyHref } from "@/components/site/SiteHeader";
import split from "@/components/site/SplitPage.module.css";
import styles from "./Auth.module.css";

type Step = "signin" | "create" | "forgot" | "sent" | "checking" | "doneVerified" | "doneReview" | "doneDeclined";
type Method = "link" | "doc" | "later";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** A password input with a visible Show or Hide toggle. */
export function PasswordField({ id, label, value, onValueChange, error, show, onToggle, autoComplete, description, labelAside }: { id: string; label: string; value: string; onValueChange: (v: string) => void; error?: string; show: boolean; onToggle: () => void; autoComplete: string; description?: string; labelAside?: React.ReactNode }) {
  return (
    <div className={styles.pwWrap}>
      {labelAside ? <div className={styles.pwAside}>{labelAside}</div> : null}
      <TextField
        id={id}
        label={label}
        description={description}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onValueChange={onValueChange}
        error={error}
        trailing={
          <button type="button" className={styles.show} onClick={onToggle} aria-label={show ? "Hide password" : "Show password"}>
            {show ? "Hide" : "Show"}
          </button>
        }
      />
    </div>
  );
}

export function SignInView() {
  const params = useSearchParams();
  const router = useRouter();
  const demo = useDemo();
  const returnTo = params?.get("returnTo") || "";
  const wantsVerify = params?.get("next") === "verify";
  const rMatch = /\/r\/([A-Z0-9-]+)/i.exec(returnTo);
  const returnRes = rMatch ? detailFor(resourceIdFromSlug(rMatch[1])) : null;
  const returnTitle = returnRes ? returnRes.title.split(":")[0] : "";

  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [tried, setTried] = useState(false);
  const [resent, setResent] = useState(false);
  const [method, setMethod] = useState<Method>("link");
  const [vurl, setVurl] = useState("");
  const [doc, setDoc] = useState<{ name: string; meta: string } | null>(null);
  const [done, setDone] = useState(0);
  const [reason, setReason] = useState("");
  const [via, setVia] = useState<"link" | "doc">("link");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (s: Step) => {
    setStep(s);
    setTried(false);
    setResent(false);
    setShowPw(false);
    setPw("");
    window.scrollTo(0, 0);
  };

  const check = (): FormError[] => {
    const out: FormError[] = [];
    const em = email.trim();
    const pre = step === "create" ? "ca" : step === "forgot" ? "fp" : "si";
    if (step === "create" && !name.trim()) out.push({ k: "name", text: "Enter your full name", target: "ca-name" });
    if (!em) out.push({ k: "email", text: "Enter your email address", target: pre + "-email" });
    else if (!EMAIL_RE.test(em)) out.push({ k: "email", text: "Enter an email address like name@school.edu", target: pre + "-email" });
    if (step === "create" && method === "link") {
      const u = vurl.trim();
      if (!u) out.push({ k: "url", text: "Enter the link to your faculty or directory page", target: "ca-url" });
      else if (!/^https?:\/\/[^\s/]+\.[^\s]+/i.test(u)) out.push({ k: "url", text: "Enter a full link that starts with https://", target: "ca-url" });
    }
    if (step === "create" && method === "doc" && !doc) out.push({ k: "doc", text: "Choose a document to upload", target: "ca-doc" });
    if (step !== "forgot") {
      if (!pw) out.push({ k: "pw", text: "Enter a password", target: pre + "-pw" });
      else if (step === "create" && pw.length < 10) out.push({ k: "pw", text: "Use at least 10 characters for your password", target: "ca-pw" });
    }
    return out;
  };
  const errors = tried ? check() : [];
  const err = (k: string) => errorFor(errors, k);

  const submit = (next: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    if (check().length) {
      setTried(true);
      return;
    }
    next();
  };

  const afterSignIn = () => {
    demo.setIdentity({ auth: "member", who: "priya" });
    toast("Signed in as " + (email.trim() || "praman@riverbend.edu"));
    if (wantsVerify) router.push(verifyHref(returnTo && !returnTo.startsWith("/verify") ? returnTo : undefined));
    else router.push(returnTo || "/");
  };

  const startCheck = (u: string) => {
    const url = u.trim();
    const h = host(url);
    const res = !h.endsWith(".edu")
      ? { st: "doneDeclined" as const, auth: "member" as const, reason: `This page is on ${h}, not your school's website.` }
      : /\/people\//.test(url)
        ? { st: "doneReview" as const, auth: "review" as const, reason: "" }
        : { st: "doneVerified" as const, auth: "verified" as const, reason: "" };
    setStep("checking");
    setDone(0);
    setVia("link");
    window.scrollTo(0, 0);
    const tick = (n: number) => {
      timer.current = setTimeout(
        () => {
          if (n < 4) {
            setDone(n + 1);
            tick(n + 1);
            return;
          }
          demo.setIdentity({ auth: res.auth, who: "priya" });
          setReason(res.reason);
          setStep(res.st);
        },
        n === 0 ? 400 : 700,
      );
    };
    tick(0);
  };

  const submitCreate = () => {
    demo.setIdentity({ auth: "member", who: "priya" });
    demo.set({ fresh: true });
    if (method === "later") {
      toast("Account created. Verify any time from your account.");
      router.push(returnTo || "/");
      return;
    }
    if (method === "doc") {
      demo.setIdentity({ auth: "review", who: "priya" });
      setVia("doc");
      setStep("doneReview");
      window.scrollTo(0, 0);
      return;
    }
    startCheck(vurl);
  };

  const backHref = returnRes ? resourceHref(returnRes.id) : "/browse";
  const backLabel = returnTitle ? "Back to " + returnTitle : "Browse materials";
  const returnLine = step === "create" ? "Create an account, then verify you teach to unlock the teaching note and solution for" : "Sign in, then verify you teach to unlock the teaching note and solution for";
  const checks = ["Created your account", "Opened your page", "The page is on " + (host(vurl) || "your school’s site"), "Looking for your name and title"];

  const returnNote =
    returnTitle && (step === "signin" || step === "create") ? (
      <p className={styles.returnNote}>
        <Lock size={17} aria-hidden />
        <span>
          {returnLine} <strong>{returnTitle}</strong>.
        </span>
      </p>
    ) : null;

  return (
    <div className={split.split}>
      <div className={split.col}>
        {step === "signin" ? (
          <>
            {returnNote}
            <ErrorSummary errors={errors} />
            <h1 className={styles.h1}>Sign in</h1>
            <p className={styles.lead}>Use the email and password for your Teaching Materials Exchange account.</p>
            <form onSubmit={submit(afterSignIn)} noValidate className={styles.form}>
              <TextField id="si-email" label="Email" type="email" autoComplete="email" value={email} onValueChange={setEmail} error={err("email")} />
              <PasswordField
                id="si-pw"
                label="Password"
                autoComplete="current-password"
                value={pw}
                onValueChange={setPw}
                error={err("pw")}
                show={showPw}
                onToggle={() => setShowPw((v) => !v)}
                labelAside={
                  <button type="button" className={styles.textBtn} onClick={() => go("forgot")}>
                    Forgot password?
                  </button>
                }
              />
              <Button type="submit" size="lg" block>
                Sign in
              </Button>
            </form>
            <div className={styles.newBox}>
              <h2 className={styles.h2}>New to the exchange?</h2>
              <p className={styles.small}>Create an account with your school email, then verify you teach to unlock teaching notes and solutions. Anyone can download public files without an account.</p>
              <Button variant="secondary" size="lg" onClick={() => go("create")}>
                <UserPlus size={17} aria-hidden />
                Create an account
              </Button>
            </div>
          </>
        ) : null}

        {step === "create" ? (
          <>
            {returnNote}
            <ErrorSummary errors={errors} />
            <h1 className={styles.h1}>Create an account</h1>
            <p className={styles.lead}>Use your school email, and verify that you teach in the same step.</p>
            <form onSubmit={submit(submitCreate)} noValidate className={styles.form}>
              <TextField id="ca-name" label="Full name" autoComplete="name" value={name} onValueChange={setName} error={err("name")} />
              <TextField id="ca-email" label="School email" description="An address from your college or university, like name@school.edu." type="email" autoComplete="email" value={email} onValueChange={setEmail} error={err("email")} />
              <PasswordField id="ca-pw" label="Password" description="At least 10 characters" autoComplete="new-password" value={pw} onValueChange={setPw} error={err("pw")} show={showPw} onToggle={() => setShowPw((v) => !v)} />
              <div className={styles.verifyBlock}>
                <RadioCards<Method>
                  label="Verify you teach"
                  value={method}
                  onValueChange={setMethod}
                  options={[
                    { value: "link", label: "Faculty page link", icon: <Link2 size={17} aria-hidden />, description: "Fastest. Usually checked in a few seconds." },
                    { value: "doc", label: "Upload a document", icon: <FileUp size={17} aria-hidden />, description: "For when there's no public page. A person reviews it within 2 business days." },
                    { value: "later", label: "I'll do this later", icon: <Clock size={17} aria-hidden />, description: "Create the account now and verify from your account page." },
                  ]}
                />
                <p className={styles.small}>Teaching notes and solutions are for instructors only, so students can&apos;t find answer keys.</p>
                {method === "link" ? (
                  <TextField id="ca-url" label="Link to your faculty or directory page" description="Use a page on your school's website that shows your name and title." type="url" inputMode="url" value={vurl} onValueChange={setVurl} placeholder="https://" leading={<Link2 size={16} aria-hidden />} error={err("url")} />
                ) : null}
                {method === "doc" ? (
                  <div className={styles.docField}>
                    <span className={styles.docLabel}>Document</span>
                    <span className={styles.small}>A recent appointment letter, teaching contract, or course schedule that lists you as the instructor. PDF, JPG, or PNG, up to 10 MB.</span>
                    {err("doc") ? <span className={styles.inlineError}>{err("doc")}</span> : null}
                    {!doc ? (
                      <div className={[styles.drop, err("doc") ? styles.dropError : ""].join(" ")}>
                        <Upload size={26} aria-hidden className={styles.dropIcon} />
                        <span>Drag a file here, or</span>
                        <Button id="ca-doc" variant="secondary" onClick={() => setDoc({ name: "appointment-letter-2026.pdf", meta: "PDF, 420 KB" })}>
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
                    <p className={styles.note}>
                      <Lock size={16} aria-hidden />
                      <span>Only our verification team sees your document, and we delete it after review. You can cover salary and ID numbers before you upload. A person reviews documents within 2 business days.</span>
                    </p>
                  </div>
                ) : null}
                {method === "later" ? (
                  <p className={styles.note}>
                    <Info size={18} aria-hidden />
                    <span>You can download public files now and verify any time from your account. Teaching notes and solutions stay locked until you do.</span>
                  </p>
                ) : null}
              </div>
              <Button type="submit" size="lg" block>
                Create account
              </Button>
            </form>
            <p className={styles.fine}>
              By creating an account, you agree to the{" "}
              <a href="#terms" onClick={(e) => (e.preventDefault(), infoToast("The Terms page isn't part of this prototype yet."))}>
                Terms
              </a>{" "}
              and{" "}
              <a href="#privacy" onClick={(e) => (e.preventDefault(), infoToast("The Privacy page isn't part of this prototype yet."))}>
                Privacy policy
              </a>
              .
            </p>
            <p className={styles.fine}>
              Already have an account?{" "}
              <button type="button" className={styles.textBtn} onClick={() => go("signin")}>
                Sign in
              </button>
            </p>
          </>
        ) : null}

        {step === "forgot" ? (
          <>
            <button type="button" className={split.back} onClick={() => go("signin")} style={{ border: 0, background: "none", padding: 0 }}>
              <ArrowLeft size={16} aria-hidden />
              Back to sign in
            </button>
            <ErrorSummary errors={errors} />
            <h1 className={styles.h1}>Reset your password</h1>
            <p className={styles.lead}>Enter the email for your account. We&apos;ll send a link to choose a new password.</p>
            <form onSubmit={submit(() => go("sent"))} noValidate className={styles.form}>
              <TextField id="fp-email" label="Email" type="email" autoComplete="email" value={email} onValueChange={setEmail} error={err("email")} />
              <div>
                <Button type="submit" size="lg">
                  <Mail size={18} aria-hidden />
                  Send reset link
                </Button>
              </div>
            </form>
          </>
        ) : null}

        {step === "sent" ? (
          <>
            <span className={styles.mailIcon}>
              <Mail size={24} aria-hidden />
            </span>
            <h1 className={styles.h1}>Check your email</h1>
            <p role="status" className={styles.lead}>
              If there&apos;s an account for <strong>{email}</strong>, we sent a link to reset the password. It works for one hour.
            </p>
            <div className={styles.row}>
              {resent ? (
                <span role="status" className={styles.ok}>
                  <Check size={16} aria-hidden />
                  Sent again
                </span>
              ) : (
                <Button variant="secondary" size="lg" onClick={() => setResent(true)}>
                  Resend the link
                </Button>
              )}
              <button type="button" className={styles.textBtn} onClick={() => go("signin")}>
                Back to sign in
              </button>
            </div>
            <Link href="/reset-password" className={styles.protoLink}>
              <ExternalLink size={18} aria-hidden />
              <span>
                <strong>Prototype only: open the reset link</strong>
                <br />
                Stands in for clicking the link in the email.
              </span>
            </Link>
            <p className={styles.small}>Not there after a minute? Check your spam folder, or ask your IT team whether outside email is filtered.</p>
          </>
        ) : null}

        {step === "checking" ? (
          <>
            <h1 className={styles.h1}>Checking your page</h1>
            <p className={styles.lead}>Your account is created. This usually takes a few seconds.</p>
            <ol aria-live="polite" className={styles.progress}>
              {checks.map((label, i) => (
                <li key={label}>
                  {i < done ? <CircleCheck size={20} className={styles.okIcon} aria-hidden /> : i === done ? <LoaderCircle size={20} className={styles.spin} aria-hidden /> : <Circle size={20} className={styles.waitIcon} aria-hidden />}
                  <span className={styles.progressLabel}>{label}</span>
                  <span className={styles.progressState}>{i < done ? "Done" : i === done ? "Checking" : "Next"}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {step === "doneVerified" ? (
          <>
            <Badge tone="ok" icon={<BadgeCheck size={16} aria-hidden />} className={styles.stateBadge}>
              Verified
            </Badge>
            <h1 className={styles.h1Result}>Your account is ready, and you&apos;re verified</h1>
            <p role="status" className={styles.lead}>
              Teaching notes and solutions are unlocked for you everywhere on the exchange.
            </p>
            <div className={styles.row}>
              <ButtonLink href={backHref} size="lg">
                {backLabel}
              </ButtonLink>
              <ButtonLink href="/contribute" variant="secondary" size="lg">
                Share your own materials
              </ButtonLink>
            </div>
          </>
        ) : null}

        {step === "doneReview" ? (
          <>
            <Badge tone="info" icon={<Clock size={16} aria-hidden />} className={styles.stateBadge}>
              In review
            </Badge>
            <h1 className={styles.h1Result}>Your account is ready</h1>
            <p role="status" className={styles.lead}>
              {via === "doc" ? "A person on our team will review your document within 2 business days." : "We found your name, but your page doesn't say whether you teach, so a person will check it within 2 business days."} We&apos;ll email you at <strong>{email}</strong>. Until then, you can download public files.
            </p>
            <div className={styles.row}>
              <ButtonLink href={backHref} size="lg">
                {backLabel}
              </ButtonLink>
            </div>
          </>
        ) : null}

        {step === "doneDeclined" ? (
          <>
            <Badge tone="danger" icon={<CircleX size={16} aria-hidden />} className={styles.stateBadge}>
              Not verified yet
            </Badge>
            <h1 className={styles.h1Result}>Your account is ready, but we couldn&apos;t verify you from that page</h1>
            <div role="alert" className={styles.why}>
              <CircleX size={20} aria-hidden />
              <span>
                <strong>Why:</strong> {reason}
              </span>
            </div>
            <p className={styles.lead}>Try another page on your school&apos;s website, or upload a document such as an appointment letter.</p>
            <div className={styles.row}>
              <ButtonLink href={verifyHref(returnTo || undefined)} size="lg">
                Try again
              </ButtonLink>
              <ButtonLink href={backHref} variant="secondary" size="lg">
                Do this later
              </ButtonLink>
            </div>
          </>
        ) : null}
      </div>
      <SplitArt discipline="other" seed="sign-in" cellSize={32} image="sign-in" />
    </div>
  );
}

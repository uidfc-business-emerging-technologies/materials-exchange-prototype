"use client";

import { CircleCheck, Clock, ExternalLink, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/controls";
import { ErrorSummary, errorFor, type FormError } from "@/components/ui/ErrorSummary";
import { PatternCover } from "@/components/site/PatternCover";
import split from "@/components/site/SplitPage.module.css";
import { PasswordField } from "./SignInView";
import styles from "./Auth.module.css";

type Step = "form" | "done" | "expired" | "sent";

/** Where the password reset email leads. ?expired=1 shows the expired link state. */
export function ResetPasswordView() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>(params?.get("expired") ? "expired" : "form");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [email, setEmail] = useState("praman@riverbend.edu");
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);

  const check = (): FormError[] => {
    const out: FormError[] = [];
    if (step === "form") {
      if (!pw) out.push({ k: "pw", text: "Enter a new password", target: "rp-pw" });
      else if (pw.length < 10) out.push({ k: "pw", text: "Use at least 10 characters", target: "rp-pw" });
      if (pw && !pw2) out.push({ k: "pw2", text: "Type the new password again", target: "rp-pw2" });
      else if (pw && pw2 !== pw) out.push({ k: "pw2", text: "The passwords don't match", target: "rp-pw2" });
    }
    if (step === "expired") {
      const em = email.trim();
      if (!em) out.push({ k: "email", text: "Enter your email address", target: "rp-email" });
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) out.push({ k: "email", text: "Enter an email address like name@school.edu", target: "rp-email" });
    }
    return out;
  };
  const errors = tried ? check() : [];
  const submit = (next: Step) => (e: React.FormEvent) => {
    e.preventDefault();
    if (check().length) {
      setTried(true);
      return;
    }
    setTried(false);
    setStep(next);
    window.scrollTo(0, 0);
  };

  return (
    <div className={split.split}>
      <div className={split.col}>
        {step === "form" ? (
          <>
            <ErrorSummary errors={errors} />
            <h1 className={styles.h1}>Choose a new password</h1>
            <p className={styles.lead}>For {email}. Use at least 10 characters.</p>
            <form onSubmit={submit("done")} noValidate className={styles.form}>
              <PasswordField id="rp-pw" label="New password" autoComplete="new-password" value={pw} onValueChange={setPw} error={errorFor(errors, "pw")} show={show} onToggle={() => setShow((v) => !v)} />
              <PasswordField id="rp-pw2" label="Type it again" autoComplete="new-password" value={pw2} onValueChange={setPw2} error={errorFor(errors, "pw2")} show={show} onToggle={() => setShow((v) => !v)} />
              <div>
                <Button type="submit" size="lg">
                  Save new password
                </Button>
              </div>
            </form>
          </>
        ) : null}
        {step === "done" ? (
          <>
            <Badge tone="ok" icon={<CircleCheck size={16} aria-hidden />} className={styles.stateBadge}>
              Password changed
            </Badge>
            <h1 className={styles.h1Result}>Your password is changed</h1>
            <p role="status" className={styles.lead}>
              Use it the next time you sign in. For your security, we signed you out on other devices.
            </p>
            <div className={styles.row}>
              <ButtonLink href="/sign-in" size="lg">
                Sign in
              </ButtonLink>
            </div>
          </>
        ) : null}
        {step === "expired" ? (
          <>
            <ErrorSummary errors={errors} />
            <Badge tone="warn" icon={<Clock size={16} aria-hidden />} className={styles.stateBadge}>
              Link expired
            </Badge>
            <h1 className={styles.h1Result}>This reset link has expired</h1>
            <p className={styles.lead}>Reset links work for one hour, and each one works only once. Send yourself a new link.</p>
            <form onSubmit={submit("sent")} noValidate className={styles.form}>
              <TextField id="rp-email" label="Email" type="email" autoComplete="email" value={email} onValueChange={setEmail} error={errorFor(errors, "email")} />
              <div>
                <Button type="submit" size="lg">
                  <Mail size={18} aria-hidden />
                  Send a new link
                </Button>
              </div>
            </form>
            <p className={styles.fine}>
              <a href="/sign-in">Back to sign in</a>
            </p>
          </>
        ) : null}
        {step === "sent" ? (
          <>
            <span className={styles.mailIcon}>
              <Mail size={24} aria-hidden />
            </span>
            <h1 className={styles.h1}>Check your email</h1>
            <p role="status" className={styles.lead}>
              We sent a new link to <strong>{email}</strong>. It works for one hour.
            </p>
            <button type="button" className={styles.protoLink} onClick={() => setStep("form")} style={{ width: "100%", textAlign: "left" }}>
              <ExternalLink size={18} aria-hidden />
              <span>
                <strong>Prototype only: open the new link</strong>
                <br />
                Stands in for clicking the link in the email.
              </span>
            </button>
            <p className={styles.fine}>
              <a href="/sign-in">Back to sign in</a>
            </p>
          </>
        ) : null}
      </div>
      <PatternCover discipline="other" seed="reset-password" className={split.art} cellSize={32} />
    </div>
  );
}

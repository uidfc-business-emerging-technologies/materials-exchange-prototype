"use client";

import { ArrowLeft, Check, ChevronRight, ExternalLink, Pencil, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/controls";
import { ErrorSummary, type FormError } from "@/components/ui/ErrorSummary";
import { toast } from "@/components/ui/overlays";
import s from "./EditParts.module.css";

/**
 * Form state for an admin edit page: the saved version, the working copy, and
 * whether a save was tried (errors only show after the first try).
 */
export function useEditForm<F>(initial: F | null) {
  const [base, setBase] = useState<F | null>(initial);
  const [form, setForm] = useState<F | null>(initial);
  const [tried, setTried] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  // The first render can come before the demo store loads; start once the record exists.
  if (initial && !base) {
    setBase(initial);
    setForm(initial);
  }
  const dirty = JSON.stringify(form) !== JSON.stringify(base);
  return {
    form,
    base,
    dirty,
    tried,
    savedOnce,
    set: <K extends keyof F>(k: K, v: F[K]) => setForm((f) => (f ? { ...f, [k]: v } : f)),
    discard: () => {
      setForm(base);
      setTried(false);
    },
    /** Saves when there are no errors; otherwise shows the summary at the top. */
    trySave: (errors: FormError[], apply: () => void) => {
      if (errors.length) {
        setTried(true);
        window.scrollTo(0, 0);
        return;
      }
      apply();
      setBase(form);
      setTried(false);
      setSavedOnce(true);
      toast("Changes saved");
    },
  };
}

export function EditHeader({
  crumbHref,
  crumb,
  kicker,
  title,
  badge,
  sub,
  lead,
  open,
}: {
  crumbHref: string;
  crumb: string;
  kicker: string;
  title: string;
  badge: React.ReactNode;
  sub: string;
  lead: React.ReactNode;
  open: { href: string; label: string };
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href={crumbHref}>{crumb}</Link>
        <ChevronRight size={14} aria-hidden />
        <span aria-current="page">{title}</span>
      </nav>
      <div className={s.head}>
        <div className={s.headMain}>
          {lead}
          <div className={s.headText}>
            <p className={s.kicker}>{kicker}</p>
            <h1 className={s.h1}>{title}</h1>
            <div className={s.headMeta}>
              {badge}
              <span>{sub}</span>
            </div>
          </div>
        </div>
        <ButtonLink href={open.href} variant="secondary" size="sm" target="_blank" rel="noreferrer">
          {open.label}
          <ExternalLink size={15} aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </ButtonLink>
      </div>
    </>
  );
}

export function Errors({ errors }: { errors: FormError[] }) {
  return errors.length ? (
    <div className={s.errors}>
      <ErrorSummary errors={errors} />
    </div>
  ) : null;
}

export function Section({ id, title, lead, children, className }: { id: string; title: string; lead?: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={[s.section, className].filter(Boolean).join(" ")}>
      <h2 id={id} className={s.h2}>
        {title}
      </h2>
      {lead ? <p className={s.lead}>{lead}</p> : null}
      {children}
    </section>
  );
}

export function History({ items }: { items: { when: string; what: string }[] }) {
  return (
    <Section id="hist-h" title="Recent activity">
      <ol className={s.history}>
        {items.map((h, i) => (
          <li key={i}>
            <span className={s.when}>{h.when}</span>
            <span>{h.what}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** Delete behind a typed confirmation: the button unlocks once `word` is typed. */
export function DangerZone({ title, body, button, word, onDelete }: { title: string; body: string; button: string; word: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const ok = typed.trim() === word;
  return (
    <section aria-labelledby="dz-h" className={s.danger}>
      <h2 id="dz-h" className={s.dangerTitle}>
        {title}
      </h2>
      <p className={s.lead}>{body}</p>
      {open ? (
        <div className={s.confirm}>
          <TextField
            label={
              <>
                Type <strong>{word}</strong> to confirm
              </>
            }
            value={typed}
            onValueChange={setTyped}
            autoComplete="off"
          />
          <div className={s.confirmActions}>
            <Button variant="danger" size="sm" className={s.deleteBtn} disabled={!ok} onClick={() => ok && onDelete()}>
              <Trash2 size={16} aria-hidden />
              {button}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="danger" size="sm" className={s.dangerOpen} onClick={() => setOpen(true)}>
          <Trash2 size={15} aria-hidden />
          {button}…
        </Button>
      )}
    </section>
  );
}

/** Sticky footer with save state, discard, back, and save. Save stays disabled until something changes. */
export function SaveBar({ dirty, savedOnce, onDiscard, onSave, back }: { dirty: boolean; savedOnce: boolean; onDiscard: () => void; onSave: () => void; back: { href: string; label: string } }) {
  const Icon = dirty ? Pencil : Check;
  return (
    <div className={s.saveBar}>
      <span role="status" className={s.saveLine} data-dirty={dirty || undefined}>
        <Icon size={16} aria-hidden />
        {dirty ? "Unsaved changes" : savedOnce ? "All changes saved" : "No changes yet"}
      </span>
      <div className={s.saveActions}>
        {dirty ? (
          <Button variant="quiet" onClick={onDiscard}>
            Discard changes
          </Button>
        ) : null}
        <ButtonLink href={back.href} variant="secondary">
          <ArrowLeft size={16} aria-hidden />
          {back.label}
        </ButtonLink>
        <Button onClick={onSave} disabled={!dirty}>
          <Save size={16} aria-hidden />
          Save changes
        </Button>
      </div>
    </div>
  );
}

/** Goes back to a list after a delete and confirms it there. */
export function useDeleted() {
  const router = useRouter();
  return (href: string, message: string) => {
    router.push(href);
    toast(message);
  };
}

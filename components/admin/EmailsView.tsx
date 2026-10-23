"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EMAIL_FROM, EMAIL_GROUPS, EMAIL_RELATED, EMAILS, type EmailTemplate } from "@/lib/emails";
import { SITE } from "@/lib/data";
import { Mark } from "@/components/site/Mark";
import { Segmented, Select } from "@/components/ui/controls";
import a from "./admin.module.css";
import s from "./Emails.module.css";

type Width = "desktop" | "phone";

const find = (id?: string | null) => EMAILS.find((x) => x.id === id) || EMAILS[0];

/** Every email the exchange sends. ?t=<template id> opens one directly. */
export function EmailsView() {
  const params = useSearchParams();
  const [id, setId] = useState(() => find(params?.get("t")).id);
  const [width, setWidth] = useState<Width>("desktop");
  const t = find(id);

  // Keep the address in step so a preview can be linked to.
  useEffect(() => {
    const u = new URL(window.location.href);
    if (u.searchParams.get("t") === id) return;
    u.searchParams.set("t", id);
    window.history.replaceState(null, "", u);
  }, [id]);

  return (
    <>
      <h1 className={a.h1}>Emails</h1>
      <p className={a.lead}>Every email the exchange sends. Buttons and links in each preview open the matching page in this prototype.</p>

      <div className={s.layout}>
        <Select
          className={s.picker}
          label="Email"
          value={t.id}
          onValueChange={setId}
          options={EMAILS.map((x) => ({ value: x.id, label: x.group + ": " + x.name }))}
        />
        <nav aria-label="Email templates" className={s.nav}>
          {EMAIL_GROUPS.map((g) => (
            <div key={g}>
              <h2 className={s.groupTitle}>{g}</h2>
              {EMAILS.filter((x) => x.group === g).map((x) => (
                <button key={x.id} type="button" className={s.item} aria-current={x.id === t.id ? "true" : undefined} onClick={() => setId(x.id)}>
                  <span className={s.itemName}>{x.name}</span>
                  <span className={s.itemShort}>{x.short}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className={s.main}>
          <div className={s.head}>
            <div>
              <h2 className={s.h2}>{t.name}</h2>
              <p className={s.when}>{t.when}</p>
            </div>
            <Segmented<Width>
              label="Preview width"
              variant="soft"
              value={width}
              onValueChange={setWidth}
              options={[
                { value: "desktop", label: "Desktop" },
                { value: "phone", label: "Phone" },
              ]}
            />
          </div>

          <dl className={s.envelope}>
            <dt>From</dt>
            <dd>{EMAIL_FROM}</dd>
            <dt>To</dt>
            <dd>{t.to}</dd>
            <dt>Subject</dt>
            <dd>
              <strong>{t.subject}</strong>
            </dd>
            <dt>Preview text</dt>
            <dd>{t.pre}</dd>
          </dl>

          <div className={s.stage}>
            <EmailFrame t={t} phone={width === "phone"} />
          </div>

          <section aria-labelledby="rel-h" className={s.related}>
            <h2 id="rel-h" className={s.h3}>
              Pages and states these emails lead to
            </h2>
            <ul>
              {EMAIL_RELATED.map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>
                    <span className={s.relText}>
                      <span className={s.relLabel}>{r.label}</span>
                      <span className={s.relSub}>{r.sub}</span>
                    </span>
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function EmailFrame({ t, phone }: { t: EmailTemplate; phone: boolean }) {
  return (
    <article aria-label={"Preview: " + t.subject} className={s.email} data-phone={phone || undefined}>
      <div className={s.emailHead}>
        <Mark size={28} />
        <span className={s.emailBrand}>{SITE.name}</span>
      </div>
      <div className={s.emailBody}>
        <p>{t.hello}</p>
        <h3 className={s.emailTitle}>{t.title}</h3>
        {t.paras?.map((x) => <p key={x}>{x}</p>)}
        {t.quote ? (
          <blockquote className={s.quote}>
            <p>{t.quote.text}</p>
            <p className={s.quoteBy}>{t.quote.by}</p>
          </blockquote>
        ) : null}
        {t.rows?.length ? (
          <dl className={s.rows}>
            {t.rows.map(([k, v]) => (
              <div key={k} className={s.row}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {t.list?.length ? (
          <ol className={s.list}>
            {t.list.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        ) : null}
        {t.cta ? (
          <Link href={t.cta.href} className={s.cta}>
            {t.cta.label}
          </Link>
        ) : null}
        {t.alt ? (
          <p className={s.alt}>
            <Link href={t.alt.href}>{t.alt.label}</Link>
          </p>
        ) : null}
        {t.after?.map((x) => (
          <p key={x} className={s.after}>
            {x}
          </p>
        ))}
        {t.link ? <p className={s.rawLink}>If the button doesn&apos;t work, paste this link into your browser: {t.link}</p> : null}
      </div>
      <div className={s.emailFoot}>
        <p>{t.why}</p>
        {t.settings ? (
          <p>
            <Link href={t.settings.href}>{t.settings.label}</Link>
          </p>
        ) : null}
        <p>
          UI-Deloitte Foundation Center for Business Emerging Technologies
          <br />
          Gies College of Business, University of Illinois Urbana-Champaign
        </p>
      </div>
    </article>
  );
}

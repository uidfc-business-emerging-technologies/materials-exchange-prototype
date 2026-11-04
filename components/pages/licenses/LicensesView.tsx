"use client";

import { ArrowRight, Check, Copy, ExternalLink, Minus, Upload, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { allResources, LICENSE_LINES, type LicenseName } from "@/lib/data";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/overlays";
import { Illustration, type IllustrationName } from "@/components/site/Illustration";
import styles from "./Licenses.module.css";

interface LicenseInfo {
  name: LicenseName;
  full: string;
  art: IllustrationName;
  deed: string;
  can: string[];
  must: string[];
}

const LICENSES: LicenseInfo[] = [
  {
    name: "CC BY 4.0",
    full: "Attribution 4.0 International",
    art: "license-by",
    deed: "https://creativecommons.org/licenses/by/4.0/",
    can: ["Use it in any course, free or paid", "Change it: new data, new questions, a translation", "Share your changed version under any license"],
    must: ["Credit the authors and link to the license"],
  },
  {
    name: "CC BY-NC 4.0",
    full: "Attribution-NonCommercial 4.0 International",
    art: "license-nc",
    deed: "https://creativecommons.org/licenses/by-nc/4.0/",
    can: ["Use it in your classes", "Change it to fit your course", "Share your changed version for noncommercial use"],
    must: ["Credit the authors and link to the license", "Not sell it or use it mainly for commercial gain"],
  },
  {
    name: "CC BY-NC-SA 4.0",
    full: "Attribution-NonCommercial-ShareAlike 4.0 International",
    art: "license-sa",
    deed: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    can: ["Use it in your classes", "Change it to fit your course", "Share your changed version for noncommercial use"],
    must: ["Credit the authors and link to the license", "Not sell it or use it mainly for commercial gain", "Share your changed version under this same license"],
  },
];

type Mark = "yes" | "no" | "required" | "none";
const GLANCE: { label: string; marks: [Mark, Mark, Mark] }[] = [
  { label: "Download, print, and hand out in class", marks: ["yes", "yes", "yes"] },
  { label: "Adapt it: change the data, rewrite questions, translate", marks: ["yes", "yes", "yes"] },
  { label: "Use it commercially, such as in paid corporate training or a textbook for sale", marks: ["yes", "no", "no"] },
  { label: "Credit the authors", marks: ["required", "required", "required"] },
  { label: "Share your changed version under the same license", marks: ["none", "none", "required"] },
];
const MARK_TEXT: Record<Mark, string> = { yes: "Yes", no: "No", required: "Required", none: "Not required" };

const FAQ = [
  {
    q: "Is teaching at my university commercial use?",
    a: "Usually not. Using a material in a course at a college or university is generally treated as noncommercial, even when students pay tuition. Selling it, for example in a course pack sold for profit or in paid corporate training, is commercial use. If you're not sure, ask the authors.",
  },
  {
    q: "Can I post materials on my course site?",
    a: "Yes, the student files can go on your course site or learning management system. Keep teaching notes and solutions out of anything students can open.",
  },
  {
    q: "Can I combine materials that have different licenses?",
    a: "Yes, as long as you follow each one. If you mix a CC BY-NC-SA material into a new version, the new version has to be shared under CC BY-NC-SA too, and nothing in it can be used commercially.",
  },
  {
    q: "Do I have to tell the authors I used their material?",
    a: "No, but they'd like to know. Use “Tell us where you used this” on the material's page. It adds to the course count authors cite in annual reviews and promotion files.",
  },
  {
    q: "Can an author take a license back?",
    a: "Not for copies people already have: Creative Commons licenses can't be revoked. Authors can unpublish a material, and the exchange stops offering it.",
  },
];

const EXAMPLE = {
  title: "Revenue Recognition at Lakeside Fitness: A Membership Bundle Case",
  authors: "Dana Whitfield and Marcus Osei",
  url: "https://tme.illinois.edu/r/0142",
  license: "CC BY 4.0",
};
const CREDIT_LINE = `“${EXAMPLE.title}” by ${EXAMPLE.authors}, Teaching Materials Exchange (${EXAMPLE.url}), licensed under ${EXAMPLE.license}.`;

const licenseHref = (name: string) => "/browse?" + new URLSearchParams({ license: name }).toString();

function GlanceMark({ mark }: { mark: Mark }) {
  const Icon = mark === "no" ? X : mark === "none" ? Minus : Check;
  return (
    <span className={[styles.mark, styles[mark]].join(" ")}>
      <Icon size={16} aria-hidden />
      {MARK_TEXT[mark]}
    </span>
  );
}

/** Licenses: what each Creative Commons license on the exchange lets people do, in plain language. */
export function LicensesView() {
  const all = allResources();
  const count = (name: LicenseName) => all.filter((r) => r.license === name).length;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    try {
      navigator.clipboard?.writeText(CREDIT_LINE).catch(() => {});
    } catch {
      // Clipboard can be blocked; the line is still on screen to select.
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow}>Licenses</p>
          <h1 className={styles.h1}>Free to use, adapt, and share, with credit</h1>
          <p className={styles.lead}>
            Every material on the exchange is shared under one of three Creative Commons licenses, picked by its authors. All three let you use it in class and change it to fit your course. They differ on commercial use and on how you share
            what you change.
          </p>
        </div>
        <Illustration name="licenses" className={styles.headArt} eager />
      </header>

      <section aria-labelledby="three-h" className={styles.section}>
        <h2 id="three-h" className={styles.h2}>
          The three licenses
        </h2>
        <ul className={styles.licenses}>
          {LICENSES.map((l) => (
            <li key={l.name} className={styles.license}>
              <div className={styles.licenseArt}>
                <Illustration name={l.art} className={styles.licenseImage} />
              </div>
              <h3 className={styles.licenseName}>{l.name}</h3>
              <p className={styles.licenseFull}>{l.full}</p>
              <p className={styles.licenseLine}>{LICENSE_LINES[l.name]}</p>
              <p className={styles.listTitle}>You can</p>
              <ul className={styles.list}>
                {l.can.map((c) => (
                  <li key={c}>
                    <Check size={16} aria-hidden className={styles.canIcon} />
                    {c}
                  </li>
                ))}
              </ul>
              <p className={styles.listTitle}>As long as you</p>
              <ul className={styles.list}>
                {l.must.map((m) => (
                  <li key={m}>
                    <ArrowRight size={16} aria-hidden className={styles.mustIcon} />
                    {m}
                  </li>
                ))}
              </ul>
              <div className={styles.licenseLinks}>
                <Link href={licenseHref(l.name)} className={styles.browseLink}>
                  Browse {count(l.name)} materials
                  <ArrowRight size={15} aria-hidden />
                </Link>
                <a href={l.deed} target="_blank" rel="noreferrer" className={styles.deedLink}>
                  Read the license
                  <ExternalLink size={14} aria-hidden />
                  <span className="sr-only"> (opens creativecommons.org in a new tab)</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="glance-h" className={styles.section}>
        <h2 id="glance-h" className={styles.h2}>
          At a glance
        </h2>
        <div className={styles.tableWrap} role="region" aria-labelledby="glance-h" tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">What you want to do</span>
                </th>
                {LICENSES.map((l) => (
                  <th key={l.name} scope="col">
                    {l.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GLANCE.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.marks.map((m, i) => (
                    <td key={LICENSES[i].name}>
                      <GlanceMark mark={m} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="credit-h" className={[styles.section, styles.credit].join(" ")}>
        <Illustration name="license-credit" className={styles.creditArt} />
        <div className={styles.creditText}>
          <h2 id="credit-h" className={styles.h2}>
            How to give credit
          </h2>
          <p className={styles.body}>Name the title, the authors, where you found it, and the license, with links where you can. Put the line on the first page of the handout or slide deck, or on your course site beside the files.</p>
          <figure className={styles.example}>
            <figcaption className={styles.exampleLabel}>For example</figcaption>
            <blockquote className={styles.exampleLine}>{CREDIT_LINE}</blockquote>
            <div className={styles.exampleActions}>
              {copied ? (
                <span role="status" className={styles.copied}>
                  <Check size={16} aria-hidden />
                  Copied
                </span>
              ) : (
                <Button variant="secondary" size="sm" onClick={copy}>
                  <Copy size={15} aria-hidden />
                  Copy this line
                </Button>
              )}
            </div>
          </figure>
          <p className={styles.body}>If you changed it, say so: start the line with “Adapted from”. Each material&apos;s page has a citation in APA style for papers and annual reviews.</p>
        </div>
      </section>

      <section aria-labelledby="gated-h" className={styles.section}>
        <div className={styles.note}>
          <h2 id="gated-h" className={styles.h3}>
            Teaching notes and solutions
          </h2>
          <p className={styles.body}>
            They have the same license as the rest of the material, but only verified instructors can download them, so students can&apos;t find the answers. Please keep them off public course sites and anything students can open.
          </p>
        </div>
      </section>

      <section aria-labelledby="choose-h" className={styles.section}>
        <div>
          <h2 id="choose-h" className={styles.h2}>
            Choosing a license when you share
          </h2>
          <p className={styles.body}>You keep the copyright. The license only says what others may do with your work. You pick one in the last step of sharing, and you can change it for later versions.</p>
          <dl className={styles.choices}>
            <div>
              <dt>CC BY 4.0</dt>
              <dd>Reaches the most classrooms, including textbook publishers and training programs. Most authors on the exchange pick it.</dd>
            </div>
            <div>
              <dt>CC BY-NC 4.0</dt>
              <dd>For when you want to keep commercial uses, like a casebook deal, for yourself.</dd>
            </div>
            <div>
              <dt>CC BY-NC-SA 4.0</dt>
              <dd>For when you want every changed version to stay open and noncommercial, too.</dd>
            </div>
          </dl>
          <div className={styles.chooseAction}>
            <ButtonLink href="/contribute" size="lg">
              <Upload size={17} aria-hidden />
              Share your materials
            </ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-h" className={styles.section}>
        <h2 id="faq-h" className={styles.h2}>
          Common questions
        </h2>
        <div className={styles.faq}>
          {FAQ.map((f) => (
            <Disclosure key={f.q} summary={f.q}>
              <p className={styles.answer}>{f.a}</p>
            </Disclosure>
          ))}
        </div>
        <p className={styles.small}>This page sums up the licenses in plain language. It isn&apos;t legal advice: the license text on creativecommons.org is what applies.</p>
      </section>
    </div>
  );
}

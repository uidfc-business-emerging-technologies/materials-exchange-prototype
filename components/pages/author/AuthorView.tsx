"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { allResources, byId, detailFor } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { infoToast } from "@/components/ui/overlays";
import { Illustration } from "@/components/site/Illustration";
import { DividedGrid } from "@/components/site/DividedGrid";
import { ResourceCard } from "@/components/site/ResourceCard";
import styles from "./Author.module.css";

/** Title, ORCID, and first year contributing for authors with more than one record. */
const PROFILES: Record<string, [string, string, number]> = {
  "Dana Whitfield": ["Associate Professor of Accountancy", "0000-0001-5532-0418", 2025],
  "Marcus Osei": ["Clinical Assistant Professor", "", 2025],
  "Priya Raman": ["Assistant Professor of Accountancy", "", 2026],
  "Jordan Lee": ["Lecturer", "", 2026],
  "Ruth Abernathy": ["Professor of Accountancy", "", 2026],
  "Kenji Sato": ["Assistant Professor of Accountancy", "", 2026],
  "Elena Fischer": ["Associate Professor of Accounting", "0000-0002-7134-5580", 2026],
  "Sam Ortega": ["Assistant Professor of Information Systems", "", 2026],
};

/** Author page: everything a faculty member would link to in a promotion file. */
export function AuthorView({ name }: { name: string }) {
  const { auth } = useDemo();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const mine = allResources().filter((r) => r.authors.split(", ").includes(name));
  const ids = name === "Dana Whitfield" ? ["TME-0142", "TME-0088", "TME-0101"] : mine.map((r) => r.id);
  const first = mine[0];
  const names0 = first ? first.authors.split(", ") : [];
  const insts0 = first ? first.inst.split(", ") : [];
  const inst = insts0.length > 1 ? insts0[names0.indexOf(name)] || insts0[0] : first?.inst || "";
  const co: Record<string, number> = {};
  mine.forEach((r) => r.authors.split(", ").forEach((x) => x !== name && (co[x] = (co[x] || 0) + 1)));
  const usual = Object.keys(co).sort((a, b) => co[b] - co[a])[0];
  const [title, orcid, since] = PROFILES[name] || ["", "", 2026];
  const works = ids.map((id) => byId(id)).filter((r) => !!r);
  const details = ids.map((id) => detailFor(id));
  const downloads = details.reduce((n, d) => n + d.downloads, 0);
  const courses = details.reduce((n, d) => n + d.courses, 0);
  const external = (e: React.MouseEvent) => {
    e.preventDefault();
    infoToast("Opens on the author’s own site.");
  };

  const copyAll = () => {
    try {
      navigator.clipboard?.writeText(details.map((d) => d.cite.lead + d.cite.italic + d.cite.tail).join("\n\n")).catch(() => {});
    } catch {
      // The citations stay on screen to select by hand.
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Author</p>
          <h1 className={styles.h1}>{name}</h1>
          <p className={styles.role}>
            {title}
            {title ? <br /> : null}
            <span className={styles.inst}>{inst}</span>
          </p>
          <div className={styles.links}>
            <a href="#faculty" onClick={external}>
              Faculty page
              <ExternalLink size={14} aria-hidden />
            </a>
            {orcid ? (
              <a href="#orcid" onClick={external}>
                ORCID {orcid}
                <ExternalLink size={14} aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
        <div className={styles.headSide}>
          <Illustration name="author" className={styles.headArt} eager />
          <dl className={styles.totals}>
            {[
              [String(works.length), "resources"],
              [downloads.toLocaleString("en-US"), "downloads"],
              [String(courses), "courses have used them"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section aria-labelledby="mat-h" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 id="mat-h" className={styles.h2}>
            Materials
          </h2>
          <span className={styles.meta}>
            Contributing since {since}
            {usual ? " · Usually with " + usual : ""}
          </span>
        </div>
        <DividedGrid min={300} className={styles.grid}>
          {works.map((r) => (r ? <ResourceCard key={r.id} resource={r} locked={auth !== "verified"} /> : null))}
        </DividedGrid>
      </section>

      <section aria-labelledby="cite-h" className={styles.cite}>
        <div className={styles.sectionHead}>
          <h2 id="cite-h" className={styles.h2}>
            Cite these materials
          </h2>
          {copied ? (
            <span role="status" className={styles.copied}>
              <Check size={16} aria-hidden />
              Copied {ids.length} {ids.length === 1 ? "citation" : "citations"}
            </span>
          ) : (
            <Button variant="secondary" onClick={copyAll}>
              <Copy size={16} aria-hidden />
              Copy all citations
            </Button>
          )}
        </div>
        <p className={styles.sub}>APA 7, with download and course counts as of October 2026. Ready for an annual review or promotion file.</p>
        <ol className={styles.cites}>
          {details.map((d) => (
            <li key={d.id}>
              {d.cite.lead}
              <i>{d.cite.italic}</i>
              {d.cite.tail}
              <span className={styles.usage}>
                {d.downloads} downloads · Used in {d.courses} courses
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

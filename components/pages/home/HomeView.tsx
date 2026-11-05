"use client";

import { ArrowRight, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { disciplines, filterDefs, filterHref, resources } from "@/lib/data";
import { useDemo, useMotionPaused } from "@/lib/demo";
import { CURL_PALETTE, NEUTRAL_PALETTE } from "@/lib/pattern";
import { DividedGrid } from "@/components/site/DividedGrid";
import { CutoutRain, type RainDrop } from "@/components/site/CutoutRain";
import { Illustration } from "@/components/site/Illustration";
import { PatternCover } from "@/components/site/PatternCover";
import { ResourceCard } from "@/components/site/ResourceCard";
import styles from "./Home.module.css";

const TRIES = ["revenue recognition", "audit analytics", "Power BI"];
const STATS = [
  { n: "128", label: "resources", art: "stat-resources" },
  { n: "41", label: "contributing institutions", art: "stat-institutions" },
  { n: "1,960", label: "verified instructors", art: "stat-instructors" },
] as const;
/**
 * Photo cutouts that rain down the hero pattern, one lane each from left to right, so neighbors
 * differ in subject and color. A number scales a cutout that looks too big or small at its depth.
 */
const HERO_CUTOUTS: RainDrop[] = [
  "hero-diploma",
  "hero-chip",
  "hero-bulb",
  "home-hero-photo",
  "hero-globe",
  "hero-abacus",
  "hero-scale",
  "hero-robot",
  "hero-chart",
  "hero-receipts",
  "hero-building",
  "hero-pie",
  ["hero-padlock", 0.85],
  ["hero-server", 1.75],
  "hero-coins",
  ["hero-calculator", 0.7],
  "hero-hourglass",
  "hero-magnifier",
  "hero-briefcase",
];
const STEPS = [
  { n: "1", art: "how-find-watercolor", title: "Find", text: "Search cases, datasets, and teaching modules. Anyone can download the student files, no account needed." },
  { n: "2", art: "how-verify-watercolor", title: "Verify", text: "Paste the link to your faculty page. Most instructors are verified in a few seconds, and teaching notes and solutions unlock." },
  { n: "3", art: "how-share-watercolor", title: "Share", text: "Upload your own materials under a Creative Commons license, with credit and usage counts you can cite." },
] as const;
/**
 * The dotted path through the steps, in a 100 by 100 box stretched over the list. It comes in
 * from the left, passes behind each picture (a quarter or three quarters across, in the middle
 * of its row), and leaves on the right.
 */
const HOW_PATH = "M 0 5 C 12 5, 25 1, 25 16.7 C 25 36, 75 30, 75 50 C 75 70, 25 64, 25 83.3 C 25 97, 86 100, 100 96";

const searchHref = (q: string) => "/browse" + (q ? "?q=" + encodeURIComponent(q) : "");

export function HomeView() {
  const router = useRouter();
  const { auth } = useDemo();
  const { paused } = useMotionPaused();
  const [q, setQ] = useState("");
  const fresh = resources.slice().sort((a, b) => b.added - a.added).slice(0, 3);
  const counts = Object.fromEntries(filterDefs[0].options.map((o) => [o.label, o.count]));

  return (
    <>
      <section aria-labelledby="hero-h" className={styles.hero}>
        <PatternCover discipline="fin" seed="home-hero" kind="mixtape" palette={NEUTRAL_PALETTE} className={styles.heroCover} cellSize={72}>
          <CutoutRain drops={HERO_CUTOUTS} />
        </PatternCover>
        <div className={styles.heroPanel}>
          <h1 id="hero-h" className={styles.heroTitle}>
            Free, classroom-ready teaching materials from business school faculty
          </h1>
          {/* One bordered field with the Search button inside it, on the right. */}
          <form
            role="search"
            className={styles.heroSearch}
            onSubmit={(e) => {
              e.preventDefault();
              router.push(searchHref(q.trim()));
            }}
          >
            <label className={styles.heroField}>
              <span className="sr-only">Search teaching materials</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cases, datasets, topics" className={styles.heroInput} />
            </label>
            <button type="submit" className={styles.heroButton}>
              <Search size={20} strokeWidth={2.5} aria-hidden />
              <span className={styles.heroButtonText}>Search</span>
            </button>
          </form>
          <div className={styles.tries}>
            <span className={styles.tryLabel}>Try</span>
            {TRIES.map((t) => (
              <Link key={t} href={searchHref(t)} className={styles.tryLink}>
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="The exchange in numbers" className={styles.stats}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.stat}>
            <Illustration name={s.art} className={styles.statArt} />
            <span className={styles.statText}>
              <span className={styles.statN}>{s.n}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </span>
          </div>
        ))}
      </section>

      <section aria-labelledby="new-h" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 id="new-h" className={styles.h2}>
            Recent materials
          </h2>
          <Link href="/browse?sort=newest" className={styles.seeAll}>
            See all materials
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        <DividedGrid min={300} className={styles.cards}>
          {fresh.map((r) => (
            <ResourceCard key={r.id} resource={r} locked={auth !== "verified"} />
          ))}
        </DividedGrid>
      </section>

      <section aria-labelledby="disc-h" className={[styles.section, styles.discSection].join(" ")}>
        <h2 id="disc-h" className={styles.h2}>
          Browse by discipline
        </h2>
        <DividedGrid as="ul" min={250} className={styles.disciplines}>
          {disciplines.map((d) => (
            <li key={d.d}>
              <Link href={filterHref("disc", d.label)} className={styles.discipline}>
                <span className={styles.discArt}>
                  <Illustration name={`disc-${d.d}`} className={styles.discImage} />
                </span>
                <span className={styles.discText}>
                  <span className={styles.discLabel}>{d.label}</span>
                  <span className={styles.discCount}>{counts[d.label] || 0} resources</span>
                </span>
              </Link>
            </li>
          ))}
        </DividedGrid>
      </section>

      {/* A decorative band of faint gray Curl loops between the two sections, edge to edge, fading in and out. */}
      <div aria-hidden="true" className={styles.band}>
        <PatternCover discipline="fin" seed="home-band" kind="curl" palette={CURL_PALETTE} transparent cellSize={56} className={styles.bandPattern} />
      </div>

      <section aria-labelledby="how-h" className={[styles.how, paused ? styles.howStill : ""].join(" ")}>
        <div className={styles.howHead}>
          <h2 id="how-h" className={styles.h2}>
            How it works
          </h2>
          <p className={styles.howLead}>From finding a case to sharing your own, in three steps.</p>
        </div>
        <div className={styles.howPath}>
          <svg className={styles.pathLine} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.pathGlow} d={HOW_PATH} vectorEffect="non-scaling-stroke" />
            <path className={styles.pathDots} d={HOW_PATH} vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.n} className={styles.step} style={{ "--i": i } as React.CSSProperties}>
                <div className={styles.stepArt}>
                  <Illustration name={s.art} className={styles.stepImage} />
                  <span aria-hidden="true" className={styles.stepN}>
                    <span className={styles.stepDigit}>{s.n}</span>
                  </span>
                </div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The call to action fades from white into the pale blue-gray the footer sits on. */}
      <section aria-labelledby="share-h" className={[styles.cta, paused ? styles.ctaStill : ""].join(" ")}>
        <div className={styles.ctaText}>
          <h2 id="share-h" className={styles.ctaTitle}>
            Share what works in your classroom.
            <span className={styles.ctaTitleSoft}> Publish your next case on the exchange today.</span>
          </h2>
          <div className={styles.ctaActions}>
            <Link href="/contribute" className={styles.ctaButton}>
              <Upload size={18} aria-hidden />
              Share your materials
            </Link>
            <Link href="/licenses" className={styles.ctaSecondary}>
              How licensing works
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className={styles.ctaArt}>
          <span className={[styles.float, styles.floatCap].join(" ")}>
            <Illustration name="cta-cap" className={styles.floatImage} />
          </span>
          <span className={[styles.float, styles.floatPlane].join(" ")}>
            <Illustration name="cta-plane" className={styles.floatImage} />
          </span>
        </div>
      </section>
    </>
  );
}

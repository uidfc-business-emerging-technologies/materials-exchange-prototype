"use client";

import Link from "next/link";
import { coverFiles } from "@/lib/covers";
import { allResources, AUTHORS, authorHref, authorPhoto, authorSlug, disciplines, resourceHref } from "@/lib/data";
import { CTA_OBJECTS, cutoutsFor, hasMaterialImage, HERO_OBJECTS, STAT_OBJECTS } from "@/components/site/Illustration";
import styles from "./Library.module.css";

const MATERIALS = allResources()
  .filter((r) => hasMaterialImage(r.id))
  .sort((a, b) => a.id.localeCompare(b.id));
const WITH_CUTOUTS = MATERIALS.filter((r) => cutoutsFor(r.id).length);

/** A row of 3D objects, each linking to its file. */
function Objects({ names }: { names: readonly string[] }) {
  return (
    <ul className={styles.objects}>
      {names.map((n) => (
        <li key={n}>
          <a href={`/images/${n}.webp`} target="_blank" rel="noreferrer" className={styles.object}>
            <span className={styles.objectArt}>
              <img src={`/images/${n}.webp`} alt="" width={320} height={320} loading="lazy" decoding="async" />
            </span>
            <span className={styles.file}>{n}.webp</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Image library: every material cover, author portrait, and generated 3D object, so they can be
 * found and reused.
 */
export function LibraryView() {
  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Image library</h1>
      <p className={styles.lead}>
        Every picture on the exchange is made with OpenAI&apos;s GPT Image 2.5 (<code>gpt-image-2.5-sunburst</code>, low quality, transparent background) by <code>scripts/generate-images.mjs</code>. Find the covers, portraits, and 3D objects to reuse.
      </p>

      <section aria-labelledby="covers-h" className={styles.section}>
        <h2 id="covers-h" className={styles.h2}>
          Material covers
        </h2>
        <p className={styles.note}>
          One loose watercolor per published material, with its subject in a band across the middle so it crops cleanly to a card or a page banner. Saved 1280px wide with a 640px copy (<code>-sm</code>) for thumbnails.
        </p>
        <ul className={styles.covers}>
          {MATERIALS.map((r) => {
            const { src, small } = coverFiles(r.id);
            return (
              <li key={r.id} className={styles.coverItem}>
                <a href={src} target="_blank" rel="noreferrer" className={styles.cover}>
                  <img src={small} alt="" width={640} height={427} loading="lazy" decoding="async" />
                </a>
                <span className={styles.id}>{r.id}</span>
                <Link href={resourceHref(r.id)} className={styles.title}>
                  {r.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="authors-h" className={styles.section}>
        <h2 id="authors-h" className={styles.h2}>
          Author portraits
        </h2>
        <p className={styles.note}>
          A head-and-shoulders photo of each author, saved 400px wide. Shown in a circle on cards, material pages, author pages, and the account menu. Every person is fictional.
        </p>
        <ul className={styles.portraits}>
          {Object.keys(AUTHORS).map((name) => (
            <li key={name}>
              <Link href={authorHref(name)} className={styles.portrait}>
                <span className={styles.portraitArt}>
                  <img src={authorPhoto(name)} alt="" width={400} height={400} loading="lazy" decoding="async" />
                </span>
                <span className={styles.portraitName}>{name}</span>
                <span className={styles.file}>author-{authorSlug(name)}.webp</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="objects-h" className={styles.section}>
        <h2 id="objects-h" className={styles.h2}>
          3D objects
        </h2>
        <p className={styles.note}>
          Photo cutouts on transparent backgrounds, saved 320px wide. Show one with <code>&lt;Illustration name=&quot;…&quot; /&gt;</code>. For a new one that matches, add it to the script with the <code>HERO</code> style line.
        </p>
        <h3 className={styles.h3}>Hero</h3>
        <p className={styles.where}>Rain down the home page hero.</p>
        <Objects names={HERO_OBJECTS} />
        <h3 className={styles.h3}>Stats</h3>
        <p className={styles.where}>Beside each number on the home page.</p>
        <Objects names={STAT_OBJECTS} />
        <h3 className={styles.h3}>Disciplines</h3>
        <p className={styles.where}>The tiles in Browse by discipline.</p>
        <Objects names={disciplines.map((d) => `disc-${d.d}`)} />
        <h3 className={styles.h3}>Call to action</h3>
        <p className={styles.where}>Frosted objects that float beside the call to action above the footer (the <code>FROSTED</code> style line), saved 400px wide.</p>
        <Objects names={CTA_OBJECTS} />
        <h3 className={styles.h3}>Materials</h3>
        <p className={styles.where}>Three each for the first eleven materials. Not on the site right now.</p>
        {WITH_CUTOUTS.map((r) => (
          <div key={r.id} className={styles.material}>
            <p className={styles.materialName}>
              <span className={styles.id}>{r.id}</span> {r.title}
            </p>
            <Objects names={cutoutsFor(r.id)} />
          </div>
        ))}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { COVER_STYLES, coverFiles } from "@/lib/covers";
import { allResources, disciplines, resourceHref } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { cutoutsFor, hasMaterialImage, HERO_OBJECTS, STAT_OBJECTS } from "@/components/site/Illustration";
import styles from "./Library.module.css";

const MATERIALS = allResources().filter((r) => hasMaterialImage(r.id));

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
 * Image library: every material cover style side by side, with a way to use one across the site,
 * and every generated 3D object, so they can be found and reused.
 */
export function LibraryView() {
  const { covers, setCovers } = useDemo();
  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Image library</h1>
      <p className={styles.lead}>
        Every picture on the exchange is made with OpenAI&apos;s gpt-image-2.5-sunburst by <code>scripts/generate-images.mjs</code>. Compare the material cover styles, and find the 3D objects to reuse.
      </p>

      <section aria-labelledby="covers-h" className={styles.section}>
        <h2 id="covers-h" className={styles.h2}>
          Material cover styles
        </h2>
        <p className={styles.note}>Each published material has a cover in every style. The site shows one style at a time: pick it here, or with Covers in the demo control at the bottom of the page.</p>
        <div className={styles.tableWrap} role="region" aria-labelledby="covers-h" tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.materialCol}>
                  Material
                </th>
                {COVER_STYLES.map((s) => (
                  <th key={s.key} scope="col">
                    <span className={styles.styleName}>{s.label}</span>
                    <Button size="sm" variant={covers === s.key ? "primary" : "secondary"} aria-pressed={covers === s.key} onClick={() => setCovers(s.key)} className={styles.use}>
                      {covers === s.key ? "On the site" : "Use on the site"}
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATERIALS.map((r) => (
                <tr key={r.id}>
                  <th scope="row">
                    <span className={styles.id}>{r.id}</span>
                    <Link href={resourceHref(r.id)} className={styles.title}>
                      {r.title}
                    </Link>
                  </th>
                  {COVER_STYLES.map((s) => {
                    const { src, small } = coverFiles(r.id, s.key);
                    return (
                      <td key={s.key}>
                        <a href={src} target="_blank" rel="noreferrer" className={styles.cover}>
                          <img src={small} alt={`${s.label} cover`} width={640} height={427} loading="lazy" decoding="async" />
                        </a>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <h3 className={styles.h3}>Materials</h3>
        <p className={styles.where}>Three per material. Not on the site right now.</p>
        {MATERIALS.map((r) => (
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

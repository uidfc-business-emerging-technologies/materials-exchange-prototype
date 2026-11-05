import { ArrowRight, ExternalLink, Search, Upload } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { DividedGrid } from "@/components/site/DividedGrid";
import { Illustration, type IllustrationName } from "@/components/site/Illustration";
import styles from "./About.module.css";

const PRINCIPLES: { art: IllustrationName; title: string; text: string; link: { label: string; href: string } }[] = [
  {
    art: "about-free",
    title: "Free for every classroom",
    text: "Every material is shared under a Creative Commons license, and attribution is always required. There are no fees, and anyone can download the student files without an account.",
    link: { label: "How licensing works", href: "/licenses" },
  },
  {
    art: "about-verified",
    title: "Answers stay with instructors",
    text: "Teaching notes and solutions are only for verified instructors, so students can't find the answers. Most instructors are verified in a few seconds from their faculty page.",
    link: { label: "Verify you teach", href: "/verify" },
  },
  {
    art: "about-credit",
    title: "Credit you can cite",
    text: "Every material has a citation, a version history, and counts of downloads and courses. Authors can cite them in annual reviews and promotion files.",
    link: { label: "Share your materials", href: "/contribute" },
  },
];

/**
 * About the exchange: why it exists, what it holds to, who runs it, and who supports it. Each
 * section has a watercolor in the style of the material covers.
 */
export function AboutView() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow}>About the exchange</p>
          <h1 className={styles.h1}>A shared shelf of teaching materials for business schools</h1>
          <p className={styles.lead}>
            The Teaching Materials Exchange is a free library of cases, data exercises, and teaching modules written by business school faculty. Anyone can use the student files. Verified instructors also get the teaching notes and solutions.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/browse" size="lg">
              <Search size={17} aria-hidden />
              Browse materials
            </ButtonLink>
            <ButtonLink href="/contribute" variant="secondary" size="lg">
              <Upload size={17} aria-hidden />
              Share your materials
            </ButtonLink>
          </div>
        </div>
        <Illustration name="about-hero" className={styles.headArt} eager />
      </header>

      <section aria-labelledby="why-h" className={[styles.section, styles.split].join(" ")}>
        <Illustration name="about-why" className={styles.splitArt} />
        <div className={styles.splitText}>
          <h2 id="why-h" className={styles.h2}>
            Why the exchange exists
          </h2>
          <p className={styles.body}>
            Good teaching materials take years to build, and most never leave the course they were written for. A case that works in one classroom could work in hundreds, but there has been no easy place to share it, find it, or get credit for it.
          </p>
          <p className={styles.body}>
            The gap is widest in fast-moving areas like data analytics and emerging technology, where textbooks fall behind the tools students will use at work. The exchange gives faculty one place to publish what works and to find what others have tested in class.
          </p>
        </div>
      </section>

      <section aria-labelledby="hold-h" className={styles.section}>
        <h2 id="hold-h" className={styles.h2}>
          What we hold to
        </h2>
        <DividedGrid as="ul" min={280} className={styles.principles}>
          {PRINCIPLES.map((p) => (
            <li key={p.title} className={styles.principle}>
              <Illustration name={p.art} className={styles.principleArt} />
              <h3 className={styles.h3}>{p.title}</h3>
              <p className={styles.principleText}>{p.text}</p>
              <Link href={p.link.href} className={styles.principleLink}>
                {p.link.label}
                <ArrowRight size={15} aria-hidden />
              </Link>
            </li>
          ))}
        </DividedGrid>
      </section>

      <section aria-labelledby="who-h" className={[styles.section, styles.split, styles.splitReverse].join(" ")}>
        <Illustration name="about-center" className={styles.centerArt} />
        <div className={styles.splitText}>
          <h2 id="who-h" className={styles.h2}>
            Who runs the exchange
          </h2>
          <p className={styles.body}>
            The Teaching Materials Exchange is created and maintained by the {SITE.center} at Gies College of Business, University of Illinois Urbana-Champaign.
          </p>
          <p className={styles.body}>Its team runs the site, verifies instructors, and reviews each new contributor&apos;s first material before it&apos;s published.</p>
          <a href={SITE.centerUrl} target="_blank" rel="noreferrer" className={styles.external}>
            Visit the Center&apos;s website
            <ExternalLink size={15} aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>

      <section aria-labelledby="support-h" className={[styles.section, styles.support].join(" ")}>
        <Illustration name="about-gift" className={styles.supportArt} />
        <div className={styles.supportText}>
          <h2 id="support-h" className={styles.h2}>
            Supported by the Deloitte Foundation
          </h2>
          <p className={styles.body}>The Teaching Materials Exchange is made possible by generous gifts from the Deloitte Foundation. We&apos;re grateful for their support.</p>
        </div>
      </section>

      <section aria-labelledby="join-h" className={[styles.section, styles.join].join(" ")}>
        <h2 id="join-h" className={styles.h2}>
          Share what works in your classroom
        </h2>
        <p className={styles.body}>Verified instructors can share cases, data exercises, and teaching modules. Your work is published under a Creative Commons license, with full credit to you.</p>
        <div className={styles.actions}>
          <ButtonLink href="/contribute" size="lg">
            <Upload size={17} aria-hidden />
            Share your materials
          </ButtonLink>
          <Link href="/licenses" className={styles.principleLink}>
            How licensing works
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import { ArrowLeft, CircleCheck, Download, LoaderCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { detailFor, resourceHref } from "@/lib/data";
import { useDemo, type Auth } from "@/lib/demo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataIcon } from "@/components/ui/DataIcon";
import { toast } from "@/components/ui/overlays";
import { PatternCover } from "@/components/site/PatternCover";
import { signInHref, verifyHref } from "@/components/site/SiteHeader";
import split from "@/components/site/SplitPage.module.css";
import styles from "./File.module.css";

/** A file reached by a direct link: it downloads, explains the lock, or says it is gone. */
export function FileView({ id, fileName }: { id: string; fileName: string }) {
  const demo = useDemo();
  const res = detailFor(id);
  const f = res.files.find((x) => x.name === fileName);
  const locked = !!f && f.gated && demo.auth !== "verified";
  const ready = !!f && !locked;
  const back = resourceHref(res.id);
  const short = res.title.split(":")[0];
  const [started, setStarted] = useState(false);
  const fired = useRef(false);

  const download = () => {
    const usage = demo.get<Record<string, { dl?: number }>>("usage", {});
    const u = usage[res.id] || {};
    demo.set({ usage: { ...usage, [res.id]: { ...u, dl: (u.dl || 0) + 1 } } });
    toast("Downloading " + fileName, Download);
  };

  useEffect(() => {
    if (!ready || fired.current || !demo.ready) return;
    fired.current = true;
    const t = setTimeout(() => {
      download();
      setStarted(true);
    }, 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, demo.ready]);

  const LOCK: Record<Exclude<Auth, "verified">, [string, string, string]> = {
    out: ["Sign in to verify", signInHref(back, { verify: true }), "Sign in and verify you teach, and this link will work."],
    member: ["Verify you teach", verifyHref(back), "Verify you teach, and this link will work. Most instructors are verified in a few seconds."],
    review: ["See verification status", "/verify?state=review&returnTo=" + encodeURIComponent(back), "Your verification is in review. We'll email you when it's done, and this link will work then."],
    renewal: ["Re-check your page", "/verify?state=expired&returnTo=" + encodeURIComponent(back), "Your verification is due for renewal. Re-check your page, and this link will work again."],
  };
  const [cta, ctaHref, line] = demo.auth === "verified" ? LOCK.member : LOCK[demo.auth];

  const fileRow = f ? (
    <div className={styles.fileRow}>
      <span className={styles.fileIcon}>
        <DataIcon name={f.icon} size={18} />
      </span>
      <span className={styles.fileText}>
        <span className={styles.fileRole}>{f.role}</span>
        <span className={styles.fileMeta}>
          {f.name} · {f.format}, {f.size}
        </span>
        {ready ? (
          started ? (
            <span role="status" className={styles.started}>
              <CircleCheck size={15} aria-hidden />
              Download started
            </span>
          ) : (
            <span className={styles.preparing}>
              <LoaderCircle size={15} aria-hidden className={styles.spin} />
              Preparing your download
            </span>
          )
        ) : null}
      </span>
    </div>
  ) : null;

  return (
    <div className={split.split}>
      <div className={split.col}>
        <Link href={back} className={split.back}>
          <ArrowLeft size={16} aria-hidden />
          {short}
        </Link>
        {!f ? (
          <>
            <p className={split.eyebrow}>File not found</p>
            <h1 className={split.h1}>This file isn&apos;t available</h1>
            <p className={split.lead}>
              {fileName} isn&apos;t part of the current version of {short}. It may have been replaced or renamed.
            </p>
            <div className={split.actions}>
              <ButtonLink href={back} size="lg">
                See the current files
              </ButtonLink>
            </div>
          </>
        ) : locked ? (
          <>
            <p className={[split.eyebrow, split.eyebrowLocked].join(" ")}>
              <Lock size={15} aria-hidden />
              For verified instructors
            </p>
            <h1 className={split.h1}>This file is for verified instructors</h1>
            {fileRow}
            <p className={split.lead}>Teaching notes and solutions are only for instructors, so students can&apos;t find answer keys. {line}</p>
            <div className={split.actions}>
              <ButtonLink href={ctaHref} size="lg">
                {cta}
              </ButtonLink>
              <ButtonLink href={back} variant="secondary" size="lg">
                See the public files
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <p className={split.eyebrow}>Download</p>
            <h1 className={split.h1}>{started ? "Your download has started" : "Your download is starting"}</h1>
            {fileRow}
            <p className={split.lead}>If it didn&apos;t start, download it again. Files you download are yours to use under the resource&apos;s license.</p>
            <div className={split.actions}>
              <Button size="lg" onClick={download}>
                <Download size={17} aria-hidden />
                Download again
              </Button>
              <ButtonLink href={back} variant="secondary" size="lg">
                Back to the resource
              </ButtonLink>
            </div>
          </>
        )}
      </div>
      <PatternCover discipline={res.d} seed={res.id} className={split.art} cellSize={36} />
    </div>
  );
}

"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import styles from "./ErrorSummary.module.css";

export interface FormError {
  /** Field key, used to show the same message next to the field. */
  k: string;
  text: string;
  /** Element to focus when the summary link is used. */
  target: string;
}

/** Summary of a form's errors at the top, linking to each field. Takes focus when it appears. */
export function ErrorSummary({ errors }: { errors: FormError[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const count = errors.length;
  useEffect(() => {
    if (count) ref.current?.focus();
  }, [count]);
  if (!count) return null;
  return (
    <div role="alert" tabIndex={-1} ref={ref} className={styles.summary}>
      <CircleAlert size={20} aria-hidden className={styles.icon} />
      <div>
        <p className={styles.title}>{count === 1 ? "There is 1 problem" : `There are ${count} problems`}</p>
        <ul className={styles.list}>
          {errors.map((e) => (
            <li key={e.k}>
              <a
                href={"#" + e.target}
                onClick={(ev) => {
                  ev.preventDefault();
                  document.getElementById(e.target)?.focus();
                }}
              >
                {e.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const errorFor = (errors: FormError[], k: string) => errors.find((e) => e.k === k)?.text;

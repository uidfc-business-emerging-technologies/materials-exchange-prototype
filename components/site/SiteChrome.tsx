import { Suspense } from "react";
import { ScrollToTop } from "./ScrollToTop";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ViewAs } from "./ViewAs";
import styles from "./SiteChrome.module.css";

/**
 * Header, main landmark, footer, and the demo role switcher for every public page. The footer
 * stays at the bottom of the window on a short page.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <ScrollToTop />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Suspense fallback={<div style={{ height: 77, borderTop: "4px solid var(--orange)", borderBottom: "1px solid var(--border)" }} />}>
        <SiteHeader />
      </Suspense>
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <ViewAs />
      </Suspense>
    </div>
  );
}

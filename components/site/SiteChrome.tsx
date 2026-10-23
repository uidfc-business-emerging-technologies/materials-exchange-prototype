import { Suspense } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ViewAs } from "./ViewAs";

/** Header, main landmark, footer, and the demo role switcher for every public page. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Suspense fallback={<div style={{ height: 77, borderTop: "4px solid var(--orange)", borderBottom: "1px solid var(--border)" }} />}>
        <SiteHeader />
      </Suspense>
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <ViewAs />
      </Suspense>
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Scrolls to the top when a link opens a different page. The router only does this when the new
 * page's first element is off screen, so a footer link that opened a long page like About could
 * leave the window part way down it. Back and forward keep the router's own scroll restoration, and
 * a link with a #hash keeps its target. Renders nothing.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const last = useRef(pathname);
  const traversal = useRef(false);

  useEffect(() => {
    // A popstate means Back or Forward; the next click means a link, so clear it.
    const onPop = () => (traversal.current = true);
    const onClick = () => (traversal.current = false);
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (traversal.current) {
      traversal.current = false;
      return;
    }
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import type { Metadata } from "next";
import { NotFoundView } from "@/components/pages/notfound/NotFoundView";
import { SiteChrome } from "@/components/site/SiteChrome";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundView />
    </SiteChrome>
  );
}

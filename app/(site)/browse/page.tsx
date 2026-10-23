import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseView } from "@/components/pages/browse/BrowseView";

export const metadata: Metadata = { title: "Browse materials" };

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseView />
    </Suspense>
  );
}

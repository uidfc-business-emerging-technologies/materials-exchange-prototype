import type { Metadata } from "next";
import { LibraryView } from "@/components/pages/library/LibraryView";

export const metadata: Metadata = { title: "Image library" };

export default function LibraryPage() {
  return <LibraryView />;
}

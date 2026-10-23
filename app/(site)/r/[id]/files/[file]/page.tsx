import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { byId, resourceIdFromSlug } from "@/lib/data";
import { FileView } from "@/components/pages/file/FileView";

type Props = { params: Promise<{ id: string; file: string }> };

export const metadata: Metadata = { title: "File" };

/** Direct link to one file, as shared in a syllabus or email. */
export default async function FilePage({ params }: Props) {
  const p = await params;
  const id = resourceIdFromSlug(p.id);
  if (!byId(id)) notFound();
  return <FileView id={id} fileName={decodeURIComponent(p.file)} />;
}

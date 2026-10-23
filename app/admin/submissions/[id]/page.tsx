import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUBMISSIONS } from "@/lib/admin-data";
import { SubmissionReview } from "@/components/admin/SubmissionReview";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = SUBMISSIONS.find((x) => x.id === id);
  return { title: s ? s.title + " · Review" : "Not found" };
}

export default async function SubmissionReviewPage({ params }: Props) {
  const { id } = await params;
  if (!SUBMISSIONS.some((x) => x.id === id)) notFound();
  return <SubmissionReview id={id} />;
}

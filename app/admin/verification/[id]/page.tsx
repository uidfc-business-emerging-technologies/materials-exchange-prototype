import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APPLICANTS } from "@/lib/admin-data";
import { VerificationDetail } from "@/components/admin/VerificationViews";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = APPLICANTS[(await params).id];
  return { title: a ? a.name + " · Verification" : "Not found" };
}

export default async function VerificationDetailPage({ params }: Props) {
  const { id } = await params;
  if (!APPLICANTS[id]) notFound();
  return <VerificationDetail id={id} />;
}

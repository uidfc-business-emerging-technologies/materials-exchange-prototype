import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allResources, authorSlug, PEOPLE } from "@/lib/data";
import { AuthorView } from "@/components/pages/author/AuthorView";

type Props = { params: Promise<{ slug: string }> };

function nameFor(slug: string) {
  const names = new Set<string>(Object.values(PEOPLE).map((p) => p.name));
  allResources().forEach((r) => r.authors.split(", ").forEach((n) => names.add(n)));
  return [...names].find((n) => authorSlug(n) === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = nameFor((await params).slug);
  return { title: name || "Page not found" };
}

export default async function AuthorPage({ params }: Props) {
  const name = nameFor((await params).slug);
  if (!name) notFound();
  return <AuthorView name={name} />;
}

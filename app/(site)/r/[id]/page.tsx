import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { byId, detailFor, resourceIdFromSlug } from "@/lib/data";
import { NotFoundView } from "@/components/pages/notfound/NotFoundView";
import { ResourceView } from "@/components/pages/resource/ResourceView";

type Props = { params: Promise<{ id: string }> };

// TME-0171 is the in-review submission shown to its authors.
const known = (id: string) => id === "TME-0171" || !!byId(id);

// An old link to a resource its authors unpublished.
const UNPUBLISHED = "TME-0066";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = resourceIdFromSlug((await params).id);
  if (id === UNPUBLISHED) return { title: "No longer available" };
  if (!known(id)) return { title: "Page not found" };
  const d = detailFor(id);
  return { title: d.title, description: d.summary };
}

export default async function ResourcePage({ params }: Props) {
  const id = resourceIdFromSlug((await params).id);
  if (id === UNPUBLISHED) return <NotFoundView kind="unpublished" />;
  if (!known(id)) notFound();
  return (
    <Suspense>
      <ResourceView id={id} />
    </Suspense>
  );
}

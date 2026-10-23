import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { byId } from "@/lib/data";
import { MaterialEdit } from "@/components/admin/MaterialEdit";

// Materials that aren't in the public catalog: in review, or unpublished.
const OTHER = ["TME-0171", "TME-0172", "TME-0066"];

export const metadata: Metadata = { title: "Edit material" };

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!byId(id) && !OTHER.includes(id)) notFound();
  return <MaterialEdit id={id} />;
}

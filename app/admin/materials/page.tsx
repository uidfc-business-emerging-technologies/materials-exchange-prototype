import type { Metadata } from "next";
import { MaterialsTable } from "@/components/admin/Collections";

export const metadata: Metadata = { title: "Materials" };

export default function MaterialsPage() {
  return <MaterialsTable />;
}

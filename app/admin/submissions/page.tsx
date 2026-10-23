import type { Metadata } from "next";
import { SubmissionsTable } from "@/components/admin/Collections";

export const metadata: Metadata = { title: "Submissions" };

export default function SubmissionsPage() {
  return <SubmissionsTable />;
}

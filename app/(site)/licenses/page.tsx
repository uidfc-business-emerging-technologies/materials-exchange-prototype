import type { Metadata } from "next";
import { LicensesView } from "@/components/pages/licenses/LicensesView";

export const metadata: Metadata = { title: "Licenses" };

export default function LicensesPage() {
  return <LicensesView />;
}

import type { Metadata } from "next";
import { ContributeView } from "@/components/pages/contribute/ContributeView";

export const metadata: Metadata = { title: "Share your materials" };

export default function ContributePage() {
  return <ContributeView />;
}

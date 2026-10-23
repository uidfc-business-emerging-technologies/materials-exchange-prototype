import type { Metadata } from "next";
import { VerificationQueue } from "@/components/admin/VerificationViews";

export const metadata: Metadata = { title: "Verification queue" };

export default function VerificationPage() {
  return <VerificationQueue />;
}

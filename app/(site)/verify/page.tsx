import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyView } from "@/components/pages/verify/VerifyView";

export const metadata: Metadata = { title: "Verify you teach" };

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyView />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordView } from "@/components/pages/auth/ResetPasswordView";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}

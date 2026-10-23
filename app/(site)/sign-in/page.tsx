import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInView } from "@/components/pages/auth/SignInView";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <Suspense>
      <SignInView />
    </Suspense>
  );
}

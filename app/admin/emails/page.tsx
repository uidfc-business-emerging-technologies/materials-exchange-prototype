import type { Metadata } from "next";
import { Suspense } from "react";
import { EmailsView } from "@/components/admin/EmailsView";

export const metadata: Metadata = { title: "Emails" };

export default function AdminEmailsPage() {
  return (
    <Suspense>
      <EmailsView />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { USERS } from "@/lib/admin-data";
import { UserEdit } from "@/components/admin/UserEdit";

export const metadata: Metadata = { title: "Edit user" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!USERS.some((u) => u.id === id)) notFound();
  return <UserEdit id={id} />;
}

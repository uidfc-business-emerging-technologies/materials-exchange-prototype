"use client";

import { ArrowLeft, BadgeCheck, BookOpen, ChartColumn, Inbox, Mail, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data";
import { Mark } from "@/components/site/Mark";
import { ViewAs } from "@/components/site/ViewAs";
import styles from "./AdminShell.module.css";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: ChartColumn, exact: true },
  { href: "/admin/verification", label: "Verification", Icon: BadgeCheck, count: 3 },
  { href: "/admin/submissions", label: "Submissions", Icon: Inbox, count: 4 },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/materials", label: "Materials", Icon: BookOpen },
  { href: "/admin/emails", label: "Emails", Icon: Mail },
];

export const ADMIN_ME = { name: "Jamie Morales", first: "Jamie", initials: "JM", team: "Verification team", email: "jmorales@illinois.edu" };

/** Admin layout: plain sidebar navigation, no patterns. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  return (
    <div className={styles.shell}>
      <aside aria-label="Admin navigation" className={styles.aside}>
        <Link href="/" className={styles.brand}>
          <Mark size={30} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{SITE.name}</span>
            <span className={styles.brandRole}>Admin</span>
          </span>
        </Link>
        <nav aria-label="Admin" className={styles.nav}>
          {NAV.map(({ href, label, Icon, count, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={styles.navLink} aria-current={active ? "page" : undefined}>
                <Icon size={18} aria-hidden className={styles.navIcon} />
                {label}
                {count ? (
                  <span className={styles.count}>
                    {count}
                    <span className="sr-only"> waiting</span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className={styles.role}>
          <ViewAs placement="sidebar" />
        </div>
        <div className={styles.me}>
          <div className={styles.meRow}>
            <span className={styles.avatar}>{ADMIN_ME.initials}</span>
            <span className={styles.meText}>
              <span className={styles.meName}>{ADMIN_ME.name}</span>
              <span className={styles.meTeam}>{ADMIN_ME.team}</span>
            </span>
          </div>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={15} aria-hidden />
            Back to the site
          </Link>
        </div>
      </aside>
      <div className={styles.content}>
        <main id="main" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}

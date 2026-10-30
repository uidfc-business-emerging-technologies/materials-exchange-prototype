"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { usePathname, useRouter } from "next/navigation";
import { COVER_STYLES, type CoverStyle } from "@/lib/covers";
import { useDemo } from "@/lib/demo";
import { Select } from "@/components/ui/controls";
import { toast } from "@/components/ui/overlays";
import styles from "./ViewAs.module.css";

type Role = "guest" | "instructor" | "admin";

/**
 * Demo controls: view the site as a guest, a verified instructor, or an admin, and pick the style
 * of every material cover (lib/covers.ts). Floats at the bottom right on the public site and sits
 * in the sidebar on admin screens.
 */
export function ViewAs({ placement = "floating" }: { placement?: "floating" | "sidebar" }) {
  const demo = useDemo();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");
  const current: Role = isAdmin ? "admin" : demo.auth === "out" ? "guest" : "instructor";

  const pick = (role: Role) => {
    if (role === current) return;
    if (role === "admin") {
      toast("Viewing as an admin");
      router.push("/admin");
      return;
    }
    if (role === "guest") {
      demo.setIdentity({ auth: "out" });
      demo.set({ intent: "", back: "", fresh: false });
      toast("Viewing as a guest");
    } else {
      demo.setIdentity({ auth: "verified", who: "priya" });
      demo.set({ fresh: false });
      toast("Viewing as Priya Raman, a verified instructor");
    }
    if (isAdmin) router.push("/");
    else router.refresh();
  };

  return (
    <div className={placement === "floating" ? styles.floating : styles.sidebar} role="group" aria-label="Demo controls">
      <span className={styles.label}>View as</span>
      <ToggleGroup value={[current]} onValueChange={(v) => v.length && pick(v[0] as Role)} className={styles.group} aria-label="Demo role">
        {(
          [
            ["guest", "Guest"],
            ["instructor", "Instructor"],
            ["admin", "Admin"],
          ] as [Role, string][]
        ).map(([value, label]) => (
          <Toggle key={value} value={value} className={styles.option}>
            {label}
          </Toggle>
        ))}
      </ToggleGroup>
      <Select<CoverStyle>
        label="Covers"
        value={demo.covers}
        onValueChange={(v) => {
          demo.setCovers(v);
          toast(`Material covers: ${COVER_STYLES.find((s) => s.key === v)?.label}`);
        }}
        options={COVER_STYLES.map((s) => ({ value: s.key, label: s.label }))}
        size="sm"
        className={styles.covers}
        triggerClassName={styles.coversTrigger}
      />
    </div>
  );
}

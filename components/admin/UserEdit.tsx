"use client";

import { Info } from "lucide-react";
import { authorHref } from "@/lib/data";
import { ADMIN_ID, USERS, type AdminUser } from "@/lib/admin-data";
import { useDemo } from "@/lib/demo";
import { Badge } from "@/components/ui/Badge";
import { RadioCards, Select, TextField } from "@/components/ui/controls";
import { errorFor, type FormError } from "@/components/ui/ErrorSummary";
import { useCollection } from "./AdminCollection";
import { USER_STATUS } from "./Collections";
import { DangerZone, EditHeader, Errors, History, SaveBar, Section, useDeleted, useEditForm } from "./EditParts";
import { ADMIN_ME } from "./AdminShell";
import p from "./EditParts.module.css";
import s from "./UserEdit.module.css";

type Status = AdminUser["status"];
type Method = "Faculty page" | "Document" | "Confirmed by an admin" | "Not yet";

interface Form {
  name: string;
  title: string;
  inst: string;
  email: string;
  page: string;
  status: Status;
  expires: string;
  method: Method;
  note: string;
  role: AdminUser["role"];
  acct: "active" | "suspended";
  reason: string;
}

const INSTITUTIONS = ["Riverbend State University", "Eastmoor University", "Kessler College", "Prairie Lakes College", "University of Illinois Urbana-Champaign"];
const METHODS: Method[] = ["Faculty page", "Document", "Confirmed by an admin", "Not yet"];
const REASONS = ["Shared locked files publicly", "Account is compromised", "Violates the terms", "Something else"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LABELS: Record<keyof Form, string> = { name: "name", title: "title", inst: "institution", email: "email", page: "faculty page", status: "status", expires: "end date", method: "method", note: "note", role: "role", acct: "account", reason: "reason" };

const toIso = (ver: string) => {
  const m = /until (\w{3}) (\d+), (\d{4})/.exec(ver || "");
  return m ? m[3] + "-" + String(MONTHS.indexOf(m[1]) + 1).padStart(2, "0") + "-" + m[2].padStart(2, "0") : "";
};
const fromIso = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function toForm(u: AdminUser): Form {
  const method: Method = /^Document/.test(u.ver) ? "Document" : /^Confirmed/.test(u.ver) ? "Confirmed by an admin" : /^Faculty|^Center/.test(u.ver) ? "Faculty page" : "Not yet";
  return {
    name: u.name,
    title: u.title || "",
    inst: u.inst,
    email: u.email,
    page: u.page ?? "https://www." + u.email.split("@")[1] + "/faculty/" + u.name.toLowerCase().replace(/[^a-z]+/g, "-"),
    status: u.status,
    expires: toIso(u.ver),
    method,
    note: u.note || "",
    role: u.role,
    acct: u.suspended ? "suspended" : "active",
    reason: u.reason || REASONS[0],
  };
}

function validate(f: Form): FormError[] {
  const e: FormError[] = [];
  if (!f.name.trim()) e.push({ k: "name", text: "Enter a full name", target: "f-name" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.push({ k: "email", text: "Enter an email address like name@school.edu", target: "f-email" });
  if (f.page.trim() && !/^https:\/\/[^\s/]+\.[^\s]+/.test(f.page.trim())) e.push({ k: "page", text: "Enter a full link that starts with https://", target: "f-page" });
  if ((f.status === "verified" || f.status === "renewal") && !f.expires) e.push({ k: "expires", text: "Choose when verification ends", target: "f-expires" });
  return e;
}

/** Edit an account: profile, verification, role, suspension, and delete. Admins can't demote or suspend themselves. */
export function UserEdit({ id }: { id: string }) {
  const demo = useDemo();
  const { items, save } = useCollection<AdminUser>("users", USERS);
  const u = items.find((x) => x.id === id);
  const ed = useEditForm<Form>(demo.ready && u ? toForm(u) : null);
  const deleted = useDeleted();
  const f = ed.form;

  if (!demo.ready) return <p className={p.lead}>Loading…</p>;
  if (!u || !f) return <p className={p.lead}>This account was deleted.</p>;

  const self = u.id === ADMIN_ID;
  const errors = ed.tried ? validate(f) : [];
  const err = (k: string) => errorFor(errors, k);
  const st = USER_STATUS[f.acct === "suspended" ? "suspended" : f.status];
  const insts = INSTITUTIONS.includes(u.inst) ? INSTITUTIONS : [u.inst, ...INSTITUTIONS];
  const initials = u.name
    .split(" ")
    .map((x) => x[0])
    .join("");

  const onSave = () =>
    ed.trySave(validate(f), () => {
      const base = ed.base!;
      const changed = (Object.keys(f) as (keyof Form)[]).filter((k) => f[k] !== base[k]);
      const what = changed.length === 1 ? "Changed the " + LABELS[changed[0]] : "Edited " + changed.length + " fields";
      save({
        [u.id]: {
          name: f.name.trim(),
          title: f.title.trim(),
          inst: f.inst,
          email: f.email.trim(),
          page: f.page.trim(),
          note: f.note,
          reason: f.reason,
          status: f.status,
          role: f.role,
          suspended: f.acct === "suspended",
          ver: f.method === "Not yet" ? "Not started" : f.method + (f.expires ? ", until " + fromIso(f.expires) : ""),
          history: [{ when: "Today", what: what + " (" + ADMIN_ME.name + ")" }, ...u.history],
        },
      });
    });

  return (
    <div className={p.page}>
      <EditHeader
        crumbHref="/admin/users"
        crumb="Users"
        kicker="Edit user"
        title={u.name}
        badge={
          <Badge tone={st.tone} icon={<st.Icon size={14} aria-hidden />}>
            {st.label}
          </Badge>
        }
        sub={u.email + " · Joined " + u.joined}
        lead={
          <span className={s.avatar} aria-hidden>
            {initials}
          </span>
        }
        open={{ href: authorHref(u.name), label: "Open profile" }}
      />
      <Errors errors={errors} />

      <Section id="p-h" title="Profile" lead="Shown on their author page and in citations.">
        <div className={p.fields}>
          <div className={p.grid3}>
            <TextField id="f-name" label="Full name" value={f.name} onValueChange={(v) => ed.set("name", v)} error={err("name")} autoComplete="off" />
            <TextField label="Title" optional value={f.title} onValueChange={(v) => ed.set("title", v)} />
            <Select label="Institution" value={f.inst} onValueChange={(v) => ed.set("inst", v)} options={insts.map((x) => ({ value: x, label: x }))} />
            <TextField id="f-email" type="email" label="Sign-in email" value={f.email} onValueChange={(v) => ed.set("email", v)} error={err("email")} autoComplete="off" />
          </div>
          <TextField
            id="f-page"
            label="Faculty or directory page"
            optional
            description="Used for automatic verification checks."
            value={f.page}
            onValueChange={(v) => ed.set("page", v)}
            error={err("page")}
            inputMode="url"
          />
        </div>
      </Section>

      <Section id="v-h" title="Verification">
        <div className={p.fields}>
          <div className={p.grid3}>
            <Select<Status>
              label="Status"
              value={f.status}
              onValueChange={(v) => ed.set("status", v)}
              options={(["verified", "review", "none", "renewal"] as Status[]).map((k) => ({ value: k, label: USER_STATUS[k].label }))}
            />
            <TextField id="f-expires" type="date" label="Lasts until" value={f.expires} onValueChange={(v) => ed.set("expires", v)} error={err("expires")} />
            <Select<Method> label="Verified with" value={f.method} onValueChange={(v) => ed.set("method", v)} options={METHODS.map((x) => ({ value: x, label: x }))} />
          </div>
          <TextField label="Admin note" optional description="Only admins see this." multiline rows={3} value={f.note} onValueChange={(v) => ed.set("note", v)} />
        </div>
      </Section>

      <Section id="a-h" title="Access">
        <RadioCards<Form["role"]>
          className={p.choice}
          label="Role"
          compact
          layout="row"
          value={f.role}
          onValueChange={(v) => ed.set("role", v)}
          options={(["Instructor", "Admin"] as const).map((x) => ({ value: x, label: x, disabled: self }))}
        />
        <RadioCards<Form["acct"]>
          className={p.choice}
          label="Account"
          compact
          layout="row"
          value={f.acct}
          onValueChange={(v) => ed.set("acct", v)}
          options={[
            { value: "active", label: "Active", disabled: self },
            { value: "suspended", label: "Suspended", disabled: self },
          ]}
        />
        {f.acct === "suspended" ? (
          <div className={p.grid3 + " " + p.choice}>
            <Select label="Reason" description="Included in the email to them." value={f.reason} onValueChange={(v) => ed.set("reason", v)} options={REASONS.map((x) => ({ value: x, label: x }))} />
          </div>
        ) : null}
        {self ? (
          <p className={p.note}>
            <Info size={16} aria-hidden />
            You can&apos;t change your own role or suspend your own account.
          </p>
        ) : null}
      </Section>

      <History items={u.history} />

      {self ? null : (
        <DangerZone
          title="Delete account"
          body="Removes the account and its sign-in. Published materials stay up with their author name."
          button="Delete account"
          word={u.email}
          onDelete={() => {
            save({ [u.id]: { deleted: true } });
            deleted("/admin/users", "Account for " + u.name + " deleted");
          }}
        />
      )}

      <SaveBar dirty={ed.dirty} savedOnce={ed.savedOnce} onDiscard={ed.discard} onSave={onSave} back={{ href: "/admin/users", label: "Back to users" }} />
    </div>
  );
}

"use client";

import { Check, RefreshCw, Shuffle, Trash2, TriangleAlert, Upload, UserPlus } from "lucide-react";
import { useMemo } from "react";
import { byId, detailFor, disciplines, filterDefs, resourceHref, type DisciplineKey, type LicenseName } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RadioCards, Select, Switch, TextField } from "@/components/ui/controls";
import { errorFor, type FormError } from "@/components/ui/ErrorSummary";
import { infoToast } from "@/components/ui/overlays";
import { PatternCover } from "@/components/site/PatternCover";
import { useCollection } from "./AdminCollection";
import { coverSeed, MAT_STATUS, materialsSeed, type Material } from "./Collections";
import { DangerZone, EditHeader, Errors, History, SaveBar, Section, useDeleted, useEditForm } from "./EditParts";
import { ADMIN_ME } from "./AdminShell";
import p from "./EditParts.module.css";
import s from "./MaterialEdit.module.css";

type Status = Material["status"];

interface Form {
  title: string;
  summary: string;
  type: string;
  level: string;
  time: string;
  license: LicenseName;
  discs: DisciplineKey[];
  status: Status;
  featured: boolean;
  cover: number;
  authors: { name: string; inst: string }[];
  files: { role: string; name: string; gated: boolean }[];
}

const SUMMARY_MAX = 300;
const opts = (key: string) => (filterDefs.find((f) => f.key === key)?.options || []).map((o) => ({ value: o.label, label: o.label }));
const TYPES = opts("type");
const LEVELS = opts("level");
const LICENSES = opts("license") as { value: LicenseName; label: string }[];

/** Summary, level, and class time for the materials that aren't in the public catalog. */
const MANUAL: Record<string, [string, string, string, DisciplineKey[]]> = {
  "TME-0171": ["Students review how a controller’s team used a generative AI assistant during the monthly close and decide which uses need new review controls.", "MBA", "90 minutes", ["emtech", "ais"]],
  "TME-0172": ["Draw a statistical sample of vendor payments in Python and decide which ones to test.", "Graduate", "75 minutes", ["audit", "data"]],
  "TME-0066": ["Short cases that walk students through pressure, opportunity, and rationalization in real frauds.", "Upper undergraduate", "50 minutes", ["audit"]],
};

const fileName = (role: string) => {
  const ext = /dataset|data\b/i.test(role) ? ".csv" : /notebook/i.test(role) ? ".ipynb" : /workbook/i.test(role) ? ".xlsx" : ".pdf";
  return role.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "") + ext;
};

function toForm(m: Material): Form {
  const r = byId(m.id);
  const det = detailFor(m.id);
  const own = det.id === m.id;
  const man = MANUAL[m.id];
  const insts = own ? det.authors.map((x) => x.inst) : [];
  return {
    title: m.title,
    summary: m.summary ?? (man ? man[0] : r?.summary || ""),
    type: m.type,
    level: m.level ?? (man ? man[1] : r?.level || "Upper undergraduate"),
    time: m.time ?? (man ? man[2] : r?.time || "75 minutes"),
    license: m.license,
    discs: m.discs || (man ? man[3] : [m.d]),
    status: m.status,
    featured: !!m.featured,
    cover: m.cover || 0,
    authors: m.authorList || m.authors.split(", ").map((name, i) => ({ name, inst: insts[i] || (m.id === "TME-0171" ? "Prairie Lakes College" : "Riverbend State University") })),
    files: m.files.map((f, i) => ({ role: f.role, name: f.name || (own && det.files[i]?.name) || fileName(f.role), gated: !!f.gated })),
  };
}

function validate(f: Form): FormError[] {
  const e: FormError[] = [];
  if (!f.title.trim()) e.push({ k: "title", text: "Enter a title", target: "f-title" });
  if (!f.summary.trim()) e.push({ k: "summary", text: "Enter a summary", target: "f-summary" });
  if (!f.discs.length) e.push({ k: "discs", text: "Choose at least one discipline", target: "f-discs" });
  if (!f.authors.some((x) => x.name.trim())) e.push({ k: "authors", text: "Add at least one author", target: "f-add-author" });
  return e;
}

/** Edit any resource: details, authors, files and who can download them, publishing, and delete. */
export function MaterialEdit({ id }: { id: string }) {
  const demo = useDemo();
  const seed = useMemo(() => materialsSeed(), []);
  const { items, save } = useCollection<Material>("mats", seed);
  const m = items.find((x) => x.id === id);
  const ed = useEditForm<Form>(demo.ready && m ? toForm(m) : null);
  const deleted = useDeleted();
  const f = ed.form;

  if (!demo.ready) return <p className={p.lead}>Loading…</p>;
  if (!m || !f) return <p className={p.lead}>This material was deleted.</p>;

  const errors = ed.tried ? validate(f) : [];
  const err = (k: string) => errorFor(errors, k);
  const setAuthor = (i: number, patch: Partial<Form["authors"][number]>) => ed.set("authors", f.authors.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setFile = (i: number, patch: Partial<Form["files"][number]>) => ed.set("files", f.files.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const coverD = f.discs[0] || m.d;
  const labels = f.discs.map((k) => disciplines.find((d) => d.d === k)?.label).filter(Boolean);
  const open = f.status === "inreview" ? { href: "/admin/submissions/" + m.id, label: "Open the review" } : { href: resourceHref(m.id), label: "Open resource page" };

  const onSave = () =>
    ed.trySave(validate(f), () => {
      const authors = f.authors.filter((x) => x.name.trim()).map((x) => ({ name: x.name.trim(), inst: x.inst.trim() }));
      save({
        [m.id]: {
          ...f,
          title: f.title.trim(),
          summary: f.summary.trim(),
          featured: f.status === "published" && f.featured,
          d: coverD,
          discipline: labels.join(", "),
          authors: authors.map((x) => x.name).join(", "),
          authorList: authors,
          updated: "Oct 23, 2026",
          history: [{ when: "Today", what: "Edited (" + ADMIN_ME.name + ")" }, ...m.history],
        },
      });
    });

  return (
    <div className={p.page}>
      <EditHeader
        crumbHref="/admin/materials"
        crumb="Materials"
        kicker={"Edit material · " + m.id}
        title={m.title}
        badge={<StatusBadge status={MAT_STATUS[f.status]} />}
        sub={f.type + " · " + f.authors.map((x) => x.name).filter(Boolean).join(", ")}
        lead={<PatternCover discipline={m.d} seed={coverSeed(m)} className={s.headCover} cellSize={20} motion={false} />}
        open={open}
      />
      <Errors errors={errors} />

      <Section id="d-h" title="Details">
        <div className={p.fields}>
          <TextField id="f-title" label="Title" value={f.title} onValueChange={(v) => ed.set("title", v)} error={err("title")} />
          <TextField
            id="f-summary"
            label="Summary"
            description="One or two sentences for cards and search results."
            multiline
            rows={2}
            maxLength={SUMMARY_MAX}
            value={f.summary}
            onValueChange={(v) => ed.set("summary", v)}
            error={err("summary")}
            footer={f.summary.length + " of " + SUMMARY_MAX + " characters"}
          />
          <div className={p.grid3}>
            <Select label="Type" value={f.type} onValueChange={(v) => ed.set("type", v)} options={TYPES} />
            <Select label="Course level" value={f.level} onValueChange={(v) => ed.set("level", v)} options={LEVELS} />
            <TextField label="Class time" value={f.time} onValueChange={(v) => ed.set("time", v)} />
          </div>
          <div className={p.grid3}>
            <Select<LicenseName> label="License" value={f.license} onValueChange={(v) => ed.set("license", v)} options={LICENSES} />
          </div>
          <fieldset className={s.discs} aria-describedby={err("discs") ? "f-discs-err" : undefined}>
            <legend className={s.legend}>Disciplines</legend>
            {err("discs") ? (
              <p id="f-discs-err" className={s.fieldErr}>
                {err("discs")}
              </p>
            ) : null}
            <div className={s.chips}>
              {disciplines.map((d, i) => {
                const on = f.discs.includes(d.d);
                return (
                  <button
                    key={d.d}
                    id={i === 0 ? "f-discs" : undefined}
                    type="button"
                    aria-pressed={on}
                    className={s.chip}
                    onClick={() => ed.set("discs", on ? f.discs.filter((k) => k !== d.d) : [...f.discs, d.d])}
                  >
                    {on ? <Check size={15} aria-hidden /> : null}
                    {d.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </Section>

      <Section id="au-h" title="Authors" lead="In citation order.">
        {err("authors") ? <p className={s.fieldErr}>{err("authors")}</p> : null}
        <ol className={s.authors}>
          {f.authors.map((x, i) => (
            <li key={i}>
              <span className={s.authorN} aria-hidden>
                {i + 1}.
              </span>
              <TextField label={"Author " + (i + 1) + " name"} hideLabel value={x.name} onValueChange={(v) => setAuthor(i, { name: v })} placeholder="Name" />
              <TextField label={"Author " + (i + 1) + " institution"} hideLabel value={x.inst} onValueChange={(v) => setAuthor(i, { inst: v })} placeholder="Institution" />
              <Button variant="ghost" size="sm" className={s.iconBtn} aria-label={"Remove " + (x.name || "author " + (i + 1))} onClick={() => ed.set("authors", f.authors.filter((_, j) => j !== i))}>
                <Trash2 size={16} aria-hidden />
              </Button>
            </li>
          ))}
        </ol>
        <Button id="f-add-author" variant="secondary" size="sm" className={s.addBtn} onClick={() => ed.set("authors", [...f.authors, { name: "", inst: "" }])}>
          <UserPlus size={16} aria-hidden />
          Add author
        </Button>
      </Section>

      <Section id="f-h" title="Files">
        <ul className={s.files}>
          {f.files.map((x, i) => (
            <li key={x.role + i}>
              <div className={s.fileRow}>
                <span className={s.fileName}>
                  <span className={s.fileRole}>{x.role}</span>
                  <span className={s.fileFile}>{x.name}</span>
                </span>
                <Select
                  className={s.access}
                  label={<span className={s.accessLabel}>Who can download</span>}
                  size="sm"
                  value={x.gated ? "verified" : "anyone"}
                  onValueChange={(v) => setFile(i, { gated: v === "verified" })}
                  options={[
                    { value: "anyone", label: "Anyone" },
                    { value: "verified", label: "Verified instructors only" },
                  ]}
                />
                <Button variant="quiet" size="sm" className={s.replace} onClick={() => infoToast("Replace opens the file picker. The new file keeps this role and access.")}>
                  <RefreshCw size={16} aria-hidden />
                  Replace
                  <span className="sr-only"> {x.role}</span>
                </Button>
                <Button variant="ghost" size="sm" className={s.iconBtn} aria-label={"Remove " + x.role} onClick={() => ed.set("files", f.files.filter((_, j) => j !== i))}>
                  <Trash2 size={16} aria-hidden />
                </Button>
              </div>
              {!x.gated && /teaching note|solution/i.test(x.role) ? (
                <p className={s.fileWarn}>
                  <TriangleAlert size={15} aria-hidden />
                  Anyone, including students, will be able to download this {x.role.toLowerCase()}.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" className={s.addBtn} onClick={() => infoToast("Upload opens the file picker.")}>
          <Upload size={15} aria-hidden />
          Upload a file
        </Button>
      </Section>

      <Section id="pub-h" title="Publishing">
        <RadioCards<Status>
          className={p.choice}
          label="Status"
          compact
          layout="row"
          value={f.status}
          onValueChange={(v) => ed.set("status", v)}
          options={(Object.keys(MAT_STATUS) as Status[]).map((k) => ({ value: k, label: MAT_STATUS[k] }))}
        />
        {f.status === "published" ? <Switch className={s.feature} checked={f.featured} onCheckedChange={(v) => ed.set("featured", v)} label="Feature on the home page" /> : null}
        <div className={s.coverRow}>
          <PatternCover discipline={coverD} seed={coverSeed({ id: m.id, cover: f.cover })} className={s.cover} />
          <div>
            <p className={s.coverTitle}>Cover</p>
            <p className={s.coverHint}>Uses the first discipline&apos;s pattern.</p>
            <Button variant="secondary" size="sm" className={s.addBtn} onClick={() => ed.set("cover", f.cover + 1)}>
              <Shuffle size={15} aria-hidden />
              Shuffle cover
            </Button>
          </div>
        </div>
      </Section>

      <History items={m.history} />

      <DangerZone
        title="Delete resource"
        body="Removes the resource and its files for everyone. Old links show a not-found page. To keep the citation, unpublish it instead."
        button="Delete resource"
        word={m.id}
        onDelete={() => {
          save({ [m.id]: { deleted: true } });
          deleted("/admin/materials", m.title + " deleted");
        }}
      />

      <SaveBar dirty={ed.dirty} savedOnce={ed.savedOnce} onDiscard={ed.discard} onSave={onSave} back={{ href: "/admin/materials", label: "Back to materials" }} />
    </div>
  );
}

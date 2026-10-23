"use client";

import { ChevronLeft, ChevronRight, Ellipsis, Info, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Segmented, Select, TextField } from "@/components/ui/controls";
import { MenuItem, MenuLinkItem, MenuPopup, MenuRoot, MenuSeparator, MenuTrigger, Modal, toast } from "@/components/ui/overlays";
import a from "./admin.module.css";
import c from "./AdminCollection.module.css";

type Icon = React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;

export interface Row {
  id: string;
  history: { when: string; what: string }[];
}

/** One thing an admin can do to a row: run it now, or confirm first. */
export interface ActionSpec<T extends Row> {
  label: string;
  /** Label in the bulk bar; omit to leave it out of bulk actions. */
  bulk?: string;
  Icon: Icon;
  danger?: boolean;
  ok: (x: T) => boolean;
  confirm?: boolean;
  reasons?: string[];
  /** A required note, labeled with this text. */
  note?: string;
  /** Email template in Admin > Emails that this action sends. */
  email?: string;
  button?: string;
  title?: (L: T[]) => string;
  body?: (L: T[]) => string;
  patch?: Partial<T>;
  what: string;
  done: (n: number) => string;
}

export interface DetailsSpec {
  title: string;
  desc: string;
  status?: React.ReactNode;
  facts: { k: string; v: string; Icon: Icon }[];
  checks?: { text: string; tone: "ok" | "warn" }[];
  history: { when: string; what: string }[];
  open?: { href: string; label: string };
  edit?: string;
}

export interface Column<T> {
  key: string;
  header: string;
  Icon?: Icon;
  numeric?: boolean;
  render: (x: T) => React.ReactNode;
}

export interface CollectionProps<T extends Row> {
  storageKey: string;
  seed: T[];
  title: string;
  lead: string;
  countLine: (items: T[]) => string;
  searchLabel: string;
  searchText: (x: T) => string;
  filters: { value: string; label: string; test: (x: T) => boolean }[];
  columns: Column<T>[];
  actions: Record<string, ActionSpec<T>>;
  /** Row menu: links and action keys, in groups separated by lines. */
  menu: (x: T) => ({ link: string; label: string; Icon: Icon } | { action: string } | { details: true })[][];
  bulkKeys: string[];
  details: (x: T) => DetailsSpec;
  /** Who gets the email, for the confirm dialog ("The authors get an email."). */
  emailLine: string;
  rowName: (x: T) => string;
}

/** Applies the admin's saved edits (from this browser) on top of the sample rows. */
export function useCollection<T extends Row>(storageKey: string, seed: T[]) {
  const demo = useDemo();
  const edits = demo.get<Record<string, Partial<T> & { deleted?: boolean }>>("edits-" + storageKey, {});
  const items = useMemo(() => seed.filter((x) => !edits[x.id]?.deleted).map((x) => (edits[x.id] ? { ...x, ...edits[x.id] } : x)), [seed, edits]);
  const save = (patches: Record<string, Partial<T> & { deleted?: boolean }>) => {
    const next = { ...edits };
    Object.entries(patches).forEach(([id, p]) => (next[id] = { ...(next[id] || {}), ...p }));
    demo.set({ ["edits-" + storageKey]: next });
  };
  return { items, save };
}

export function AdminCollection<T extends Row>(p: CollectionProps<T>) {
  const { items, save } = useCollection(p.storageKey, p.seed);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(p.filters[0].value);
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [dlg, setDlg] = useState<null | { kind: "details"; id: string } | { kind: "confirm"; key: string; ids: string[]; from: number }>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);

  const test = (p.filters.find((f) => f.value === tab) || p.filters[0]).test;
  const query = q.trim().toLowerCase();
  const list = items.filter(test).filter((x) => !query || p.searchText(x).toLowerCase().includes(query));
  const pages = Math.max(1, Math.ceil(list.length / per));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * per, cur * per);
  const shownIds = shown.map((x) => x.id);
  const nOn = shownIds.filter((id) => sel[id]).length;
  const selIds = Object.keys(sel).filter((k) => sel[k]);
  const selected = items.filter((x) => selIds.includes(x.id));

  const apply = (key: string, ids: string[]) => {
    const sp = p.actions[key];
    const why = sp.reasons && reason ? ": " + reason.charAt(0).toLowerCase() + reason.slice(1) : "";
    const patches: Record<string, Partial<T>> = {};
    ids.forEach((id) => {
      const x = items.find((y) => y.id === id);
      if (!x) return;
      patches[id] = { ...(sp.patch || {}), history: [{ when: "Today", what: sp.what + why + " (Jamie Morales)" }, ...x.history] } as Partial<T>;
    });
    save(patches);
    setDlg(null);
    setTried(false);
    setSel({});
    toast(sp.done(ids.length) + ".");
  };

  const run = (key: string, ids: string[]) => {
    const sp = p.actions[key];
    const L = items.filter((x) => ids.includes(x.id) && sp.ok(x));
    if (!L.length) return;
    if (sp.confirm) {
      setReason(sp.reasons ? sp.reasons[0] : "");
      setNote("");
      setTried(false);
      setDlg({ kind: "confirm", key, ids: L.map((x) => x.id), from: ids.length });
      return;
    }
    apply(key, L.map((x) => x.id));
  };

  const bulk = p.bulkKeys
    .map((k) => ({ k, n: selected.filter(p.actions[k].ok).length }))
    .filter((b) => b.n > 0)
    .map((b) => ({ ...b, sp: p.actions[b.k] }));

  // ---------- Dialog content ----------
  let dialog: React.ReactNode = null;
  if (dlg?.kind === "confirm") {
    const sp = p.actions[dlg.key];
    const L = items.filter((x) => dlg.ids.includes(x.id));
    const noteError = tried && sp.note && !note.trim() ? "Add a note before you confirm" : undefined;
    const names = L.map(p.rowName);
    dialog = (
      <Modal
        open
        onOpenChange={(o) => !o && setDlg(null)}
        title={sp.title ? sp.title(L) : sp.label}
        description={L.length === 1 ? undefined : `${L.length} selected` + (dlg.from > L.length ? `, ${dlg.from - L.length} skipped because it doesn’t apply` : "")}
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDlg(null)}>
              Cancel
            </Button>
            <Button
              className={sp.danger ? c.dangerBtn : undefined}
              onClick={() => {
                if (sp.note && !note.trim()) {
                  setTried(true);
                  return;
                }
                apply(dlg.key, dlg.ids);
              }}
            >
              <sp.Icon size={16} aria-hidden />
              {(sp.button || sp.label) + (L.length > 1 ? ` (${L.length})` : "")}
            </Button>
          </>
        }
      >
        {sp.body ? <p className={c.body}>{sp.body(L)}</p> : null}
        {L.length > 1 ? <p className={c.names}>{names.length <= 4 ? names.join(", ") : names.slice(0, 4).join(", ") + ", and " + (names.length - 4) + " more"}</p> : null}
        <div className={c.dialogFields}>
          {sp.reasons ? <Select label="Reason" value={reason} onValueChange={setReason} options={sp.reasons.map((r) => ({ value: r, label: r }))} /> : null}
          {sp.note ? <TextField label={sp.note} multiline rows={3} value={note} onValueChange={setNote} error={noteError} /> : null}
        </div>
        {sp.email ? (
          <p className={c.emailLine}>
            {p.emailLine}{" "}
            <a href={"/admin/emails?t=" + sp.email} target="_blank" rel="noreferrer">
              See the email
            </a>
          </p>
        ) : null}
      </Modal>
    );
  } else if (dlg?.kind === "details") {
    const x = items.find((y) => y.id === dlg.id);
    if (x) {
      const d = p.details(x);
      dialog = (
        <Modal
          open
          onOpenChange={(o) => !o && setDlg(null)}
          title={d.title}
          description={d.desc}
          width={600}
          footer={
            <>
              {d.open ? (
                <ButtonLink href={d.open.href} variant="secondary">
                  {d.open.label}
                </ButtonLink>
              ) : null}
              {d.edit ? <ButtonLink href={d.edit}>Edit</ButtonLink> : null}
            </>
          }
        >
          {d.status ? <div className={c.detailStatus}>{d.status}</div> : null}
          <dl className={c.facts}>
            {d.facts.map((f) => (
              <div key={f.k}>
                <dt>
                  <f.Icon size={15} aria-hidden />
                  {f.k}
                </dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          {d.checks ? (
            <ul className={c.checks}>
              {d.checks.map((ck) => (
                <li key={ck.text} className={ck.tone === "ok" ? a.ok : a.warnText}>
                  {ck.text}
                </li>
              ))}
            </ul>
          ) : null}
          <h3 className={c.histTitle}>History</h3>
          <ol className={c.hist}>
            {d.history.map((h, i) => (
              <li key={i}>
                <span className={c.histWhen}>{h.when}</span>
                <span>{h.what}</span>
              </li>
            ))}
          </ol>
        </Modal>
      );
    }
  }

  return (
    <>
      <div className={a.titleRow}>
        <h1 className={a.h1}>{p.title}</h1>
        <span className={a.meta}>{p.countLine(items)}</span>
      </div>
      <p className={a.lead}>{p.lead}</p>

      <div className={a.toolbar}>
        <label className={a.search}>
          <Search size={18} aria-hidden />
          <span className="sr-only">{p.searchLabel}</span>
          <input
            type="search"
            placeholder={p.searchLabel}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
              setSel({});
            }}
          />
          {q ? (
            <button type="button" className={c.clearSearch} aria-label="Clear search" onClick={() => setQ("")}>
              <X size={15} aria-hidden />
            </button>
          ) : null}
        </label>
        <Segmented
          label="Filter by status"
          variant="soft"
          value={tab}
          onValueChange={(v) => {
            setTab(v);
            setPage(1);
            setSel({});
          }}
          options={p.filters.map((f) => ({ value: f.value, label: f.label, count: items.filter(f.test).length }))}
        />
      </div>

      {selIds.length ? (
        <div className={c.bulkBar} role="region" aria-label="Bulk actions">
          <span className={c.bulkCount}>{selIds.length} selected</span>
          {bulk.map((b) => (
            <Button key={b.k} variant="secondary" size="sm" className={b.sp.danger ? c.dangerOutline : undefined} onClick={() => run(b.k, selIds)}>
              <b.sp.Icon size={15} aria-hidden />
              {(b.sp.bulk || b.sp.label) + ` (${b.n})`}
            </Button>
          ))}
          <Button variant="quiet" size="sm" onClick={() => setSel({})}>
            Clear selection
          </Button>
        </div>
      ) : null}

      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th scope="col" className={c.checkCol}>
                <Checkbox
                  ariaLabel="Select all rows on this page"
                  checked={nOn > 0 && nOn === shownIds.length}
                  indeterminate={nOn > 0 && nOn < shownIds.length}
                  onCheckedChange={() => {
                    const on = !(shownIds.length && nOn === shownIds.length);
                    setSel((s) => {
                      const n = { ...s };
                      shownIds.forEach((id) => (on ? (n[id] = true) : delete n[id]));
                      return n;
                    });
                  }}
                />
              </th>
              {p.columns.map((col) => (
                <th key={col.key} scope="col" className={col.numeric ? a.num : undefined}>
                  {col.Icon ? <col.Icon size={15} aria-hidden /> : null}
                  {col.header}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((x) => (
              <tr key={x.id} className={sel[x.id] ? c.rowOn : undefined}>
                <td className={[a.middle, c.checkCol].join(" ")}>
                  <Checkbox ariaLabel={"Select " + p.rowName(x)} checked={!!sel[x.id]} onCheckedChange={(v) => setSel((s) => ({ ...s, [x.id]: v }))} />
                </td>
                {p.columns.map((col) => (
                  <td key={col.key} className={[a.middle, col.numeric ? a.num : ""].join(" ")}>
                    {col.render(x)}
                  </td>
                ))}
                <td className={a.middle}>
                  <MenuRoot modal={false}>
                    <MenuTrigger className={a.rowMenuBtn} aria-label={"Actions for " + p.rowName(x)}>
                      <Ellipsis size={18} aria-hidden />
                    </MenuTrigger>
                    <MenuPopup>
                      {p
                        .menu(x)
                        .map((g) => g.filter((e) => !("action" in e) || p.actions[e.action].ok(x)))
                        .filter((g) => g.length)
                        .map((g, gi) => (
                          <div key={gi}>
                            {gi ? <MenuSeparator /> : null}
                            {g.map((e) =>
                              "details" in e ? (
                                <MenuItem key="details" icon={<Info size={16} aria-hidden />} onClick={() => setDlg({ kind: "details", id: x.id })}>
                                  View details
                                </MenuItem>
                              ) : "link" in e ? (
                                <MenuLinkItem key={e.label} href={e.link} icon={<e.Icon size={16} aria-hidden />}>
                                  {e.label}
                                </MenuLinkItem>
                              ) : (
                                <MenuItem key={e.action} danger={p.actions[e.action].danger} icon={(() => { const I = p.actions[e.action].Icon; return <I size={16} aria-hidden />; })()} onClick={() => run(e.action, [x.id])}>
                                  {p.actions[e.action].label}
                                </MenuItem>
                              ),
                            )}
                          </div>
                        ))}
                    </MenuPopup>
                  </MenuRoot>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length ? (
          <div className={a.empty}>
            Nothing matches.{" "}
            <Button
              variant="quiet"
              onClick={() => {
                setQ("");
                setTab(p.filters[0].value);
              }}
            >
              Clear search and filters
            </Button>
          </div>
        ) : null}
      </div>

      {list.length ? (
        <div className={a.pager}>
          <span>
            Showing {(cur - 1) * per + 1}&ndash;{Math.min(cur * per, list.length)} of {list.length}
          </span>
          <nav aria-label="Pages" className={a.pages}>
            <button type="button" className={a.pageBtn} disabled={cur <= 1} aria-label="Previous page" onClick={() => setPage(cur - 1)}>
              <ChevronLeft size={18} aria-hidden />
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" className={a.pageBtn} aria-current={i + 1 === cur ? "page" : undefined} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button type="button" className={a.pageBtn} disabled={cur >= pages} aria-label="Next page" onClick={() => setPage(cur + 1)}>
              <ChevronRight size={18} aria-hidden />
            </button>
          </nav>
          <div className={a.perPage}>
            <span id="per-label">Rows per page</span>
            <Select
              label="Rows per page"
              hideLabel
              size="sm"
              value={String(per)}
              onValueChange={(v) => {
                setPer(Number(v));
                setPage(1);
              }}
              options={["10", "25", "50"].map((v) => ({ value: v, label: v }))}
            />
          </div>
        </div>
      ) : null}
      {dialog}
    </>
  );
}

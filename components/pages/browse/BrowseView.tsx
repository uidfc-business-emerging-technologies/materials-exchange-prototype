"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { filterDefs, matches, resources, type FilterKey, type Resource } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Segmented, Select } from "@/components/ui/controls";
import { infoToast, Modal } from "@/components/ui/overlays";
import { PatternCover } from "@/components/site/PatternCover";
import { ResourceCard, ResourceCardSkeleton } from "@/components/site/ResourceCard";
import styles from "./Browse.module.css";

type Sort = "relevance" | "newest" | "used";
type Checked = Record<string, true>;

const FILTER_KEYS = filterDefs.map((g) => g.key);
const keyOf = (k: FilterKey, label: string) => k + ":" + label;

function useIsPhone() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 959px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 959px)").matches,
    () => false,
  );
}

function checkedFromParams(params: URLSearchParams | null): Checked {
  const c: Checked = {};
  FILTER_KEYS.forEach((k) => params?.getAll(k).forEach((l) => (c[keyOf(k, l)] = true)));
  return c;
}

function scorer(query: string) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.replace(/s$/, ""));
  return (r: Resource) => {
    if (!words.length) return 1;
    const hay = [r.title, r.summary, r.discipline, r.type, r.tools.join(" "), r.authors, r.level].join(" ").toLowerCase();
    return words.filter((w) => hay.indexOf(w) > -1).length;
  };
}

export function BrowseView() {
  const params = useSearchParams();
  const router = useRouter();
  const { auth } = useDemo();
  const phone = useIsPhone();
  const query = params?.get("q") || "";
  const [checked, setChecked] = useState<Checked>(() => checkedFromParams(params));
  const [sort, setSort] = useState<Sort>(() => (["newest", "used"].includes(params?.get("sort") || "") ? (params?.get("sort") as Sort) : "relevance"));
  const [view, setView] = useState<"list" | "grid">("list");
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const firstQuery = useRef(query);

  const flash = (kind: "load" | "refresh") => {
    clearTimeout(timer.current);
    if (kind === "load") setLoading(true);
    else setRefreshing(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, kind === "load" ? 450 : 260);
  };

  // A new search from the header resets filters to whatever the link carries.
  const paramKey = params?.toString() || "";
  useEffect(() => {
    setChecked(checkedFromParams(params));
    if (firstQuery.current !== query) {
      firstQuery.current = query;
      flash("load");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const score = useMemo(() => scorer(query), [query]);
  const groups = filterDefs.map((g) => ({ ...g, active: g.options.filter((o) => checked[keyOf(g.key, o.label)]).map((o) => o.label) }));
  const pass = (r: Resource, skip?: FilterKey) => groups.every((g) => g.key === skip || !g.active.length || g.active.some((l) => matches(r, g.key, l)));
  const base = resources.filter((r) => score(r) > 0);
  const results = base
    .filter((r) => pass(r))
    .sort((a, b) => (sort === "used" ? b.used - a.used : sort === "newest" ? b.added - a.added : score(b) - score(a) || b.used - a.used));

  const toggle = (k: FilterKey, label: string) => {
    setChecked((c) => {
      const next = { ...c };
      if (next[keyOf(k, label)]) delete next[keyOf(k, label)];
      else next[keyOf(k, label)] = true;
      return next;
    });
    flash("refresh");
  };
  const clearAll = () => {
    setChecked({});
    flash("refresh");
  };

  const filters = groups.map((g) => ({
    ...g,
    options: g.options.map((o) => ({
      ...o,
      on: !!checked[keyOf(g.key, o.label)],
      count: base.filter((r) => pass(r, g.key) && matches(r, g.key, o.label)).length,
    })),
  }));
  const applied = groups.flatMap((g) => g.active.map((label) => ({ group: g.title, key: g.key, label })));

  const n = results.length;
  const isEmpty = n === 0 && !loading;
  const heading = query ? (loading ? `Results for “${query}”` : `${n} ${n === 1 ? "result" : "results"} for “${query}”`) : "All materials";
  const list = view === "list" && !phone;
  const locked = auth !== "verified";

  const suggestions = isEmpty
    ? [
        ...applied
          .map((a) => {
            const without = base.filter((r) =>
              groups.every((g) => {
                const rest = g.active.filter((l) => !(g.key === a.key && l === a.label));
                return !rest.length || rest.some((l) => matches(r, g.key, l));
              }),
            ).length;
            return { label: `Remove “${a.label}” to see ${without} ${without === 1 ? "result" : "results"}`, go: () => toggle(a.key, a.label), without };
          })
          .filter((s) => s.without > 0),
        ...(query ? [{ label: "Show all materials instead", go: () => router.push("/browse"), without: 1 }] : []),
      ]
    : [];

  const sortSelect = (compact: boolean) => (
    <Select<Sort>
      label="Sort by"
      hideLabel={compact}
      value={sort}
      onValueChange={(v) => {
        setSort(v);
        flash("refresh");
      }}
      size="sm"
      className={compact ? styles.sortPhone : styles.sortDesktop}
      options={[
        { value: "relevance", label: compact ? "Sort: Relevance" : "Relevance" },
        { value: "newest", label: compact ? "Sort: Newest" : "Newest" },
        { value: "used", label: compact ? "Sort: Most used" : "Most used" },
      ]}
    />
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>{heading}</h1>

      <div className={styles.phoneBar}>
        <button type="button" className={styles.filtersButton} aria-haspopup="dialog" onClick={() => setSheet(true)}>
          <SlidersHorizontal size={18} aria-hidden />
          Filters
          {applied.length ? <span className={styles.filterCount}>{applied.length}</span> : null}
        </button>
        {sortSelect(true)}
      </div>

      <div className={styles.layout}>
        <aside aria-labelledby="filters-h" className={styles.filters}>
          <h2 id="filters-h" className={styles.filtersTitle}>
            <SlidersHorizontal size={18} aria-hidden />
            Filters
          </h2>
          {filters.map((g) => (
            <div key={g.key} role="group" aria-labelledby={"fg-" + g.key} className={styles.group}>
              <h3 id={"fg-" + g.key} className={styles.groupTitle}>
                {g.title}
              </h3>
              <div className={styles.options}>
                {g.options.map((o) => (
                  <Checkbox key={o.label} checked={o.on} onCheckedChange={() => toggle(g.key, o.label)} trailing={o.count}>
                    {o.label}
                  </Checkbox>
                ))}
              </div>
              {g.more ? (
                <button type="button" className={styles.more} onClick={() => infoToast("The full tools list opens here.")}>
                  {g.more}
                </button>
              ) : null}
            </div>
          ))}
        </aside>

        <div className={styles.results}>
          <h2 className="sr-only">Results</h2>
          {!isEmpty ? (
            <div className={styles.toolbar}>
              <span role="status" className={styles.status}>
                {loading ? "Loading results…" : `Showing 1 to ${n}`}
              </span>
              <div className={styles.toolbarRight}>
                {sortSelect(false)}
                <Segmented
                  label="View"
                  value={view}
                  onValueChange={setView}
                  options={[
                    { value: "list", label: "List", icon: <List size={16} aria-hidden /> },
                    { value: "grid", label: "Grid", icon: <LayoutGrid size={16} aria-hidden /> },
                  ]}
                />
              </div>
            </div>
          ) : null}

          {applied.length ? (
            <div className={styles.applied}>
              <span className={styles.appliedLabel}>Filters:</span>
              {applied.map((a) => (
                <button key={a.key + a.label} type="button" className={styles.appliedChip} aria-label={`Remove filter ${a.group}: ${a.label}`} onClick={() => toggle(a.key, a.label)}>
                  <span className={styles.appliedGroup}>{a.group}:</span>
                  {a.label}
                  <X size={15} aria-hidden />
                </button>
              ))}
              <button type="button" className={styles.clear} onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : null}

          {loading ? (
            <div aria-hidden="true" className={list ? styles.listWrap : styles.grid}>
              {Array.from({ length: phone ? 3 : 6 }, (_, i) => (
                <ResourceCardSkeleton key={i} variant={list ? "list" : "grid"} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className={styles.empty}>
              <PatternCover discipline="other" seed="empty-search" className={styles.emptyCover} cellSize={24} />
              <div className={styles.emptyBody}>
                <h2 className={styles.emptyTitle}>No materials match those filters yet.</h2>
                <p className={styles.emptyLead}>Try removing a filter, or be the first to contribute one.</p>
                <div className={styles.emptyActions}>
                  <Button onClick={clearAll}>Clear filters</Button>
                  <ButtonLink href="/contribute" variant="secondary">
                    Contribute materials
                  </ButtonLink>
                </div>
                {suggestions.length ? (
                  <>
                    <h3 className={styles.tryTitle}>Or try</h3>
                    <ul className={styles.tryList}>
                      {suggestions.map((s) => (
                        <li key={s.label}>
                          <button type="button" className={styles.tryLink} onClick={s.go}>
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div aria-busy={refreshing} className={[list ? styles.listWrap : styles.grid, refreshing ? styles.refreshing : ""].join(" ")}>
              {results.map((r) => (
                <ResourceCard key={r.id} resource={r} locked={locked} variant={list ? "list" : "grid"} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={sheet && phone}
        onOpenChange={setSheet}
        title="Filters"
        variant="sheet"
        footer={
          <>
            <Button variant="secondary" size="lg" className={styles.sheetClear} onClick={clearAll}>
              Clear all
            </Button>
            <Button size="lg" className={styles.sheetShow} onClick={() => setSheet(false)}>
              Show {n} {n === 1 ? "result" : "results"}
            </Button>
          </>
        }
      >
        <Accordion.Root defaultValue={[filters[0].key]} className={styles.sheetGroups}>
          {filters.map((g) => {
            const k = g.options.filter((o) => o.on).length;
            return (
              <Accordion.Item key={g.key} value={g.key} className={styles.sheetGroup}>
                <Accordion.Header className={styles.sheetHeader}>
                  <Accordion.Trigger className={styles.sheetTrigger}>
                    <span>{g.title}</span>
                    <span className={styles.sheetSummary}>
                      {k ? `${k} selected` : ""}
                      <ChevronDown size={18} className={styles.sheetChevron} aria-hidden />
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className={styles.sheetPanel}>
                  {g.options.map((o) => (
                    <Checkbox key={o.label} size="md" checked={o.on} onCheckedChange={() => toggle(g.key, o.label)} trailing={o.count}>
                      {o.label}
                    </Checkbox>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>
      </Modal>
    </div>
  );
}

"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { filterDefs, matches, resources, type FilterKey, type Resource } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Segmented, Select } from "@/components/ui/controls";
import { infoToast, Modal } from "@/components/ui/overlays";
import { DividedGrid } from "@/components/site/DividedGrid";
import { Illustration } from "@/components/site/Illustration";
import { PatternCover } from "@/components/site/PatternCover";
import { ResourceCard, ResourceCardSkeleton } from "@/components/site/ResourceCard";
import styles from "./Browse.module.css";

type Sort = "relevance" | "newest" | "used";
type Checked = Record<string, true>;

/** Results per page. */
const PER_PAGE = 20;

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

/*
 * Everything that picks the results lives in the address: the search, the filters (one key per
 * checked option, like ?disc=Audit&disc=Tax), the sort, and the page. So Back and Forward step
 * through pages, a material opened from the results comes back to the same results, and a link
 * shows exactly what its sender saw.
 */
const SORT_KEY = "sort";
const PAGE_KEY = "page";

/** The page number in the address. Anything that isn't a whole number above 1 means the first page. */
function pageFromParams(params: URLSearchParams | null): number {
  const p = Number(params?.get(PAGE_KEY));
  return Number.isInteger(p) && p > 1 ? p : 1;
}

function sortFromParams(params: URLSearchParams | null): Sort {
  const s = params?.get(SORT_KEY);
  return s === "newest" || s === "used" ? s : "relevance";
}

function checkedFromParams(params: URLSearchParams | null): Checked {
  const c: Checked = {};
  FILTER_KEYS.forEach((k) => params?.getAll(k).forEach((l) => (c[keyOf(k, l)] = true)));
  return c;
}

/**
 * The query string for a change to the current results. Keeps the search and anything else in the
 * address, and writes the filters in the order they're listed, so the same choices always make the
 * same address. The defaults (relevance, page 1) are left out.
 */
function browseQuery(params: URLSearchParams | null, next: { checked: Checked; sort: Sort; page: number }) {
  const out = new URLSearchParams();
  const own = new Set<string>([...FILTER_KEYS, SORT_KEY, PAGE_KEY]);
  params?.forEach((v, k) => {
    if (!own.has(k)) out.append(k, v);
  });
  filterDefs.forEach((g) => {
    const listed = g.options.map((o) => o.label);
    const at = (label: string) => (listed.indexOf(label) + 1 || listed.length + 1);
    Object.keys(next.checked)
      .filter((k) => k.startsWith(g.key + ":"))
      .map((k) => k.slice(g.key.length + 1))
      .sort((a, b) => at(a) - at(b))
      .forEach((label) => out.append(g.key, label));
  });
  if (next.sort !== "relevance") out.set(SORT_KEY, next.sort);
  if (next.page > 1) out.set(PAGE_KEY, String(next.page));
  const qs = out.toString();
  return qs ? "?" + qs : "";
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

/** Previous and next, with a button for every page between them. */
function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  return (
    <nav aria-label="Pages" className={styles.pager}>
      <button type="button" className={styles.pagerStep} disabled={page === 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={16} aria-hidden />
        Previous
      </button>
      <ol className={styles.pagerList}>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <li key={p}>
            <button type="button" className={[styles.pagerPage, p === page ? styles.pagerOn : ""].join(" ")} aria-current={p === page ? "page" : undefined} onClick={() => onPage(p)}>
              <span className="sr-only">Page </span>
              {p}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className={styles.pagerStep} disabled={page === pages} onClick={() => onPage(page + 1)}>
        Next
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}

/** List rows carry their own rules; grid cards get lines between them. */
function ResultsWrap({ list, className, ...rest }: { list: boolean } & React.HTMLAttributes<HTMLElement>) {
  return list ? <div {...rest} className={[styles.listWrap, className].filter(Boolean).join(" ")} /> : <DividedGrid {...rest} min={260} className={[styles.grid, className].filter(Boolean).join(" ")} />;
}

export function BrowseView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { auth } = useDemo();
  const phone = useIsPhone();
  const query = params?.get("q") || "";
  const paramKey = params?.toString() || "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checked = useMemo(() => checkedFromParams(params), [paramKey]);
  const sort = sortFromParams(params);
  const page = pageFromParams(params);
  const [view, setView] = useState<"list" | "grid">("list");
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
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

  /**
   * Moves to new results. Filters and sort replace the current entry, so Back doesn't undo one
   * checkbox at a time. Pages add an entry, so Back from page 2 goes to page 1. Only the address
   * changes, through the browser's own history, so the results update at once without asking the
   * server for the page again.
   */
  const go = (next: { checked?: Checked; sort?: Sort; page?: number }, mode: "push" | "replace") => {
    const href = pathname + browseQuery(params, { checked, sort, page, ...next });
    if (mode === "push") window.history.pushState(null, "", href);
    else window.history.replaceState(null, "", href);
  };

  // Dim the results briefly whenever they change, from the controls or from Back and Forward. A new
  // search, from the header or a link, shows the loading cards instead.
  const shownKey = useRef(paramKey);
  useEffect(() => {
    if (shownKey.current === paramKey) return;
    shownKey.current = paramKey;
    if (firstQuery.current !== query) {
      firstQuery.current = query;
      flash("load");
    } else flash("refresh");
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

  // Any change to filters or sort starts again from the first page.
  const toggle = (k: FilterKey, label: string) => {
    const next = { ...checked };
    if (next[keyOf(k, label)]) delete next[keyOf(k, label)];
    else next[keyOf(k, label)] = true;
    go({ checked: next, page: 1 }, "replace");
  };
  const clearAll = () => go({ checked: {}, page: 1 }, "replace");

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
  const pages = Math.max(1, Math.ceil(n / PER_PAGE));
  const current = Math.min(page, pages);
  const first = (current - 1) * PER_PAGE;
  const shown = results.slice(first, first + PER_PAGE);
  const goToPage = (p: number) => {
    if (p === current) return;
    go({ page: p }, "push");
    resultsRef.current?.scrollIntoView({ block: "start" });
  };
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
      onValueChange={(v) => go({ sort: v, page: 1 }, "replace")}
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
      <div className={styles.head}>
        <h1 className={styles.h1}>{heading}</h1>
        <Illustration name="browse" className={styles.headArt} eager />
      </div>

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

        <div ref={resultsRef} className={styles.results}>
          <h2 className="sr-only">Results</h2>
          {!isEmpty ? (
            <div className={styles.toolbar}>
              <span role="status" className={styles.status}>
                {loading ? "Loading results…" : `Showing ${first + 1} to ${first + shown.length} of ${n}`}
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
            <ResultsWrap list={list} aria-hidden="true">
              {Array.from({ length: phone ? 3 : 6 }, (_, i) => (
                <ResourceCardSkeleton key={i} variant={list ? "list" : "grid"} />
              ))}
            </ResultsWrap>
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
            <>
              <ResultsWrap list={list} aria-busy={refreshing} className={refreshing ? styles.refreshing : undefined}>
                {shown.map((r) => (
                  <ResourceCard key={r.id} resource={r} locked={locked} variant={list ? "list" : "grid"} />
                ))}
              </ResultsWrap>
              {pages > 1 ? <Pager page={current} pages={pages} onPage={goToPage} /> : null}
            </>
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

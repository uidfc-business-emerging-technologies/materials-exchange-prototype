"use client";

// Demo state for the clickable prototype. There is no backend: who you are signed in as lives in
// a cookie (so pages render the right state on the server), and everything else you do
// (saves, downloads, drafts, admin edits) lives in localStorage on this browser.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { PEOPLE, type Person } from "./data";
import { DEMO_COOKIE, type Auth, type DemoIdentity, type Who } from "./demo-shared";

export type { Auth, DemoIdentity, Who } from "./demo-shared";

const STORE_KEY = "tme-demo";

type Data = Record<string, unknown>;

interface DemoContextValue {
  auth: Auth;
  who: Who;
  me: Person;
  /** True once localStorage has been read on the client. */
  ready: boolean;
  data: Data;
  get<T>(key: string, fallback: T): T;
  set(patch: Data): void;
  setIdentity(next: Partial<DemoIdentity>): void;
  /** Signs out and clears every demo change. */
  reset(): void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function writeCookie(id: DemoIdentity) {
  const value = encodeURIComponent(JSON.stringify(id));
  document.cookie = `${DEMO_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function readStore(): Data {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function DemoProvider({ initial, children }: { initial: DemoIdentity; children: React.ReactNode }) {
  const [identity, setIdentityState] = useState<DemoIdentity>(initial);
  const [data, setData] = useState<Data>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(readStore());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY) setData(readStore());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const set = useCallback((patch: Data) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        // Private windows can refuse storage; the demo still works for this page view.
      }
      return next;
    });
  }, []);

  const setIdentity = useCallback((patch: Partial<DemoIdentity>) => {
    setIdentityState((prev) => {
      const next = { ...prev, ...patch };
      writeCookie(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      // ignore
    }
    setData({});
    setIdentityState(() => {
      const next: DemoIdentity = { auth: "out", who: "priya" };
      writeCookie(next);
      return next;
    });
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      auth: identity.auth,
      who: identity.who,
      me: PEOPLE[identity.who] || PEOPLE.priya,
      ready,
      data,
      get<T>(key: string, fallback: T): T {
        const v = data[key];
        return v === undefined || v === null ? fallback : (v as T);
      },
      set,
      setIdentity,
      reset,
    }),
    [identity, ready, data, set, setIdentity, reset],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>");
  return ctx;
}

/** Verification badge text, icon key, and color for each sign-in state. */
export const AUTH_BADGE: Record<Auth, { label: string; tone: "muted" | "info" | "warn" | "ok" }> = {
  out: { label: "", tone: "muted" },
  member: { label: "Not verified", tone: "muted" },
  review: { label: "In review", tone: "info" },
  renewal: { label: "Renewal due", tone: "warn" },
  verified: { label: "Verified", tone: "ok" },
};

// ---- Motion preference for the slowly changing pattern covers ----

const MOTION_KEY = "tme-motion";
const motionListeners = new Set<() => void>();

function readMotionPaused() {
  try {
    return localStorage.getItem(MOTION_KEY) === "paused";
  } catch {
    return false;
  }
}

export function setMotionPaused(paused: boolean) {
  try {
    localStorage.setItem(MOTION_KEY, paused ? "paused" : "running");
  } catch {
    // ignore
  }
  motionListeners.forEach((l) => l());
}

function subscribeMotion(l: () => void) {
  motionListeners.add(l);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", l);
  return () => {
    motionListeners.delete(l);
    mq.removeEventListener("change", l);
  };
}

/** True when covers should stay still: the user paused them or asked the OS for reduced motion. */
export function useMotionPaused(): { paused: boolean; reduced: boolean } {
  const paused = useSyncExternalStore(subscribeMotion, readMotionPaused, () => true);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  return { paused, reduced };
}

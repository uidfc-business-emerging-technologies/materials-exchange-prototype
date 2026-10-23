// Shared between server and client: the demo identity cookie.

export type Auth = "out" | "member" | "review" | "renewal" | "verified";
export type Who = "priya" | "elena";

export interface DemoIdentity {
  auth: Auth;
  who: Who;
}

export const DEMO_COOKIE = "tme-demo";

const AUTHS: Auth[] = ["out", "member", "review", "renewal", "verified"];

export function parseIdentity(raw: string | undefined): DemoIdentity {
  const fallback: DemoIdentity = { auth: "out", who: "priya" };
  if (!raw) return fallback;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    return {
      auth: AUTHS.includes(v.auth) ? v.auth : "out",
      who: v.who === "elena" ? "elena" : "priya",
    };
  } catch {
    return fallback;
  }
}

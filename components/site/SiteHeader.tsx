"use client";

import { BadgeCheck, ChevronDown, Clock, LogIn, LogOut, Menu as MenuIcon, RefreshCw, Search, Shield, Upload, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/data";
import { useDemo, type Auth } from "@/lib/demo";
import { MenuHeader, MenuItem, MenuLinkItem, MenuPopup, MenuRoot, MenuSeparator, MenuTrigger, toast } from "@/components/ui/overlays";
import { Mark } from "./Mark";
import styles from "./SiteHeader.module.css";

const BADGE: Record<Exclude<Auth, "out">, { Icon: typeof Shield; label: string; cls: string }> = {
  member: { Icon: Shield, label: "Not verified", cls: styles.toneMuted },
  review: { Icon: Clock, label: "In review", cls: styles.toneInfo },
  renewal: { Icon: RefreshCw, label: "Renewal due", cls: styles.toneWarn },
  verified: { Icon: BadgeCheck, label: "Verified", cls: styles.toneOk },
};

/** Where "Sign in" and "Verify you teach" should bring the person back to. */
export function useReturnTo() {
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params?.toString();
  return pathname + (q ? "?" + q : "");
}

/** Sign-in link that brings the person back. With `verify`, they go on to verify you teach first. */
export function signInHref(returnTo?: string, opts: { verify?: boolean } = {}) {
  const q = new URLSearchParams();
  if (returnTo && !returnTo.startsWith("/sign-in")) q.set("returnTo", returnTo);
  if (opts.verify) q.set("next", "verify");
  const s = q.toString();
  return "/sign-in" + (s ? "?" + s : "");
}

export function verifyHref(returnTo?: string) {
  return "/verify" + (returnTo ? "?returnTo=" + encodeURIComponent(returnTo) : "");
}

function SearchForm({ mobile }: { mobile?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const current = pathname === "/browse" ? params?.get("q") || "" : "";
  const [draft, setDraft] = useState(current);
  useEffect(() => setDraft(current), [current]);

  return (
    <form
      role="search"
      className={[styles.search, mobile ? styles.searchMobile : "", draft ? styles.searchFilled : ""].join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        const q = draft.trim();
        router.push("/browse" + (q ? "?q=" + encodeURIComponent(q) : ""));
      }}
    >
      <Search size={18} className={styles.searchIcon} aria-hidden />
      <input type="search" aria-label="Search" placeholder="Search cases, datasets, topics" value={draft} onChange={(e) => setDraft(e.target.value)} className={styles.searchInput} />
      {draft ? (
        <button type="button" aria-label="Clear search" className={styles.searchClear} onClick={() => setDraft("")}>
          <X size={16} aria-hidden />
        </button>
      ) : null}
    </form>
  );
}

/** SiteHeader in three states: signed out, signed in, signed in and verified. */
export function SiteHeader() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const demo = useDemo();
  const returnTo = useReturnTo();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  const isHome = pathname === "/";
  const onBrowse = pathname.startsWith("/browse");
  const onContribute = pathname.startsWith("/contribute");
  const signedIn = demo.auth !== "out";
  const badge = signedIn ? BADGE[demo.auth as Exclude<Auth, "out">] : null;
  const canVerify = demo.auth === "member" || demo.auth === "review" || demo.auth === "renewal";
  const verifyLabel = demo.auth === "review" ? "Verification status" : demo.auth === "renewal" ? "Renew verification" : "Verify you teach";
  const verifyTo = pathname.startsWith("/r/") ? verifyHref(returnTo) : "/verify";

  const signOut = () => {
    demo.reset();
    toast("Signed out. The demo is reset.");
    if (!/^\/($|browse|r\/|authors\/)/.test(pathname)) router.push("/");
    else router.refresh();
  };

  return (
    <header className={styles.header}>
      {/* Desktop */}
      <div className={styles.desktop}>
        <Link href="/" className={styles.brand}>
          <Mark size={36} />
          <span className={styles.wordmark}>{SITE.name}</span>
        </Link>
        {!isHome ? <SearchForm /> : null}
        <nav aria-label="Main" className={styles.nav}>
          <Link href="/browse" className={styles.navLink} aria-current={onBrowse ? "page" : undefined}>
            Browse
          </Link>
          <Link href="/contribute" className={styles.navLink} aria-current={onContribute ? "page" : undefined}>
            Contribute
          </Link>
          {!signedIn ? (
            <Link href={signInHref(returnTo)} className={styles.signIn}>
              <LogIn size={16} aria-hidden />
              Sign in
            </Link>
          ) : (
            <MenuRoot modal={false}>
              <MenuTrigger className={styles.account} aria-label={`Account menu, ${badge?.label}`}>
                <span className={styles.avatar}>{demo.me.initials}</span>
                {badge ? (
                  <span className={[styles.badge, badge.cls].join(" ")}>
                    <badge.Icon size={16} aria-hidden />
                    {badge.label}
                  </span>
                ) : null}
                <ChevronDown size={16} aria-hidden />
              </MenuTrigger>
              <MenuPopup className={styles.menu}>
                <MenuHeader>
                  <span className={styles.menuName}>{demo.me.name}</span>
                  <span className={styles.menuEmail}>{demo.me.email}</span>
                </MenuHeader>
                {canVerify ? (
                  <MenuLinkItem href={verifyTo} icon={<BadgeCheck size={17} aria-hidden />}>
                    {verifyLabel}
                  </MenuLinkItem>
                ) : null}
                <MenuLinkItem href="/account" icon={<UserRound size={17} aria-hidden />}>
                  Account
                </MenuLinkItem>
                <MenuLinkItem href="/contribute" icon={<Upload size={17} aria-hidden />}>
                  Share materials
                </MenuLinkItem>
                <MenuSeparator />
                <MenuItem icon={<LogOut size={17} aria-hidden />} onClick={signOut}>
                  Sign out
                </MenuItem>
              </MenuPopup>
            </MenuRoot>
          )}
        </nav>
      </div>

      {/* Phone */}
      <div className={styles.mobile}>
        <div className={styles.mobileBar}>
          <Link href="/" className={styles.brand + " " + styles.brandMobile}>
            <Mark size={32} />
            <span className={styles.wordmarkMobile}>{SITE.name}</span>
          </Link>
          {!signedIn ? (
            <Link href={signInHref(returnTo)} className={styles.signInMobile}>
              Sign in
            </Link>
          ) : (
            <button type="button" className={[styles.accountMobile, badge?.cls].join(" ")} aria-label={`Account menu, ${badge?.label}`} aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
              <span className={styles.avatarMobile}>{demo.me.initials}</span>
              {badge ? <badge.Icon size={18} aria-hidden /> : null}
            </button>
          )}
          <button type="button" className={styles.menuButton} aria-label="Menu" aria-expanded={mobileOpen} aria-controls="mobile-nav" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={22} aria-hidden /> : <MenuIcon size={22} aria-hidden />}
          </button>
        </div>
        {mobileOpen ? (
          <nav id="mobile-nav" aria-label="Main" className={styles.mobileNav}>
            {signedIn && badge ? (
              <div className={styles.mobileWho}>
                <span className={styles.menuName}>{demo.me.name}</span>
                <span className={[styles.badge, badge.cls].join(" ")}>
                  <badge.Icon size={15} aria-hidden />
                  {badge.label}
                </span>
              </div>
            ) : null}
            <Link href="/browse" className={styles.mobileLink} aria-current={onBrowse ? "page" : undefined}>
              Browse
            </Link>
            <Link href="/contribute" className={styles.mobileLink} aria-current={onContribute ? "page" : undefined}>
              Contribute
            </Link>
            {canVerify ? (
              <Link href={verifyTo} className={styles.mobileLink}>
                {verifyLabel}
              </Link>
            ) : null}
            {signedIn ? (
              <>
                <Link href="/account" className={styles.mobileLink}>
                  Account
                </Link>
                <button type="button" className={styles.mobileLink} onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : null}
          </nav>
        ) : null}
        {!isHome ? <SearchForm mobile /> : null}
      </div>
    </header>
  );
}

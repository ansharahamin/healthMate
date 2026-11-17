"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import styles from "./AppShell.module.css";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/files", label: "Health files", icon: "▤" },
  { href: "/vitals", label: "Vitals", icon: "♡" },
  { href: "/timeline", label: "Timeline", icon: "◷" },
  { href: "/insights", label: "AI insights", icon: "✧" },
  { href: "/profile", label: "Profile", icon: "○" },
];

const AppUserContext = createContext(null);

export function useAppUser() {
  return useContext(AppUserContext);
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("loading");
  const [authError, setAuthError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest("/api/auth/me")
      .then(({ user: currentUser }) => {
        if (active) {
          setUser(currentUser);
          setAuthStatus("ready");
        }
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) {
          const next = encodeURIComponent(pathname || "/dashboard");
          router.replace(`/login?next=${next}`);
          return;
        }
        setAuthError(error.message || "Unable to verify your sign-in.");
        setAuthStatus("error");
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  async function handleSignOut() {
    setSignOutError("");
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (error) {
      setSignOutError(error.message || "Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  if (authStatus === "loading") {
    return <main className={styles.fullState}>Opening your health space…</main>;
  }

  if (authStatus === "error") {
    return (
      <main className={styles.fullState}>
        <section className={styles.stateCard} role="alert">
          <h1>We couldn’t open your health space</h1>
          <p>{authError}</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </section>
      </main>
    );
  }

  return (
    <AppUserContext.Provider value={user}>
      <div className={styles.appShell}>
        <aside className={styles.sidebar}>
          <Link className={styles.brand} href="/dashboard" aria-label="HealthMate dashboard">
            <span className={styles.brandMark} aria-hidden="true">+</span>
            <span>healthmate<span className={styles.brandDot}>.</span></span>
          </Link>
          <p className={styles.navLabel}>YOUR HEALTH SPACE</p>
          <nav className={styles.navigation} aria-label="HealthMate">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className={styles.sidebarFooter}>
            <p>Health information, in one place.</p>
            <button type="button" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
            {signOutError && <p className={styles.signOutError} role="alert">{signOutError}</p>}
          </div>
        </aside>

        <div className={styles.mainColumn}>
          <header className={styles.mobileHeader}>
            <Link className={styles.brand} href="/dashboard">
              <span className={styles.brandMark} aria-hidden="true">+</span>
              <span>healthmate<span className={styles.brandDot}>.</span></span>
            </Link>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className={styles.menuButton}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </header>
          {menuOpen && (
            <nav className={styles.mobileNavigation} aria-label="HealthMate">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
              ))}
              <button type="button" onClick={handleSignOut} disabled={signingOut}>
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              {signOutError && <p role="alert">{signOutError}</p>}
            </nav>
          )}
          <div className={styles.content}>
            <div className={styles.welcomeBar}>
              <p>YOUR PERSONAL HEALTH VAULT</p>
              <span>Welcome, {user?.userName || "there"}</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </AppUserContext.Provider>
  );
}

import { Suspense } from "react";
import AppShell from "../../components/health/AppShell";
import styles from "../../components/health/AppShell.module.css";

export default function HealthmateLayout({ children }) {
  return (
    <Suspense fallback={<main className={styles.fullState} role="status">Opening your health space…</main>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

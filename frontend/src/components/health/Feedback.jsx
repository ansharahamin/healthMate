import styles from "./HealthPage.module.css";

export function LoadingState({ children = "Loading your health records…" }) {
  return <p className={styles.loading} role="status">{children}</p>;
}

export function ErrorState({ children }) {
  return <p className={styles.inlineError} role="alert">{children}</p>;
}

export function Notice({ children, tone = "success" }) {
  const toneClass = tone === "error" ? styles.errorNotice : styles.successNotice;
  return <p className={`${styles.notice} ${toneClass}`} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

export function EmptyState({ icon = "✧", title, description, action }) {
  return (
    <section className={styles.emptyState}>
      <span className={styles.emptyIcon} aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

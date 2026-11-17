import styles from "../../app/page.module.css";

export function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M20 6.5v27M6.5 20h27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2" opacity=".22" />
      </svg>
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureIcon({ name }) {
  const paths = {
    records: <><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" /><path d="M14 3.75v4h4M8.5 12h7M8.5 15.5h7" /></>,
    clarity: <><path d="M12 3.5a7.5 7.5 0 0 0-4.8 13.26c.66.56 1.05 1.22 1.12 2.24h7.36c.07-1.02.46-1.68 1.12-2.24A7.5 7.5 0 0 0 12 3.5Z" /><path d="M9.5 22h5M9 19h6M12 7v5l3 1" /></>,
    timeline: <><path d="M4 5.5h16M4 12h16M4 18.5h16" /><circle cx="8" cy="5.5" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="10" cy="18.5" r="2" /></>,
  };

  return (
    <span className={styles.featureIcon} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  );
}

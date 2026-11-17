import styles from "../../app/page.module.css";
import { ArrowIcon } from "./Icons";

export default function DashboardPreview() {
  return (
    <div className={styles.preview} aria-label="Sample HealthMate dashboard preview">
      <div className={styles.previewGlow} />
      <div className={`${styles.floatBadge} ${styles.floatBadgeTop}`}>
        <span className={styles.badgeIcon}>✦</span>
        <span><strong>All in one place</strong><small>Your health, at a glance</small></span>
      </div>
      <div className={styles.dashboardCard}>
        <div className={styles.dashboardHeader}>
          <div>
            <p className={styles.dashboardKicker}>SAMPLE HEALTH SNAPSHOT</p>
            <h2>Your health overview</h2>
          </div>
          <span className={styles.avatar}>HM</span>
        </div>
        <div className={styles.snapshotRow}>
          <div>
            <span className={styles.metricLabel}>Blood pressure</span>
            <p className={styles.metricValue}>118<span>/</span>76 <small>mmHg</small></p>
          </div>
          <span className={styles.metricStatus}><i /> Recent entry</span>
        </div>
        <div className={styles.chart} aria-hidden="true">
          <div className={styles.chartLabels}><span>OCT 08</span><span>OCT 10</span><span>OCT 12</span><span>OCT 14</span><span>OCT 16</span></div>
          <svg viewBox="0 0 420 104" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#74ae8f" stopOpacity=".25" />
                <stop offset="1" stopColor="#74ae8f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 65C26 62 37 42 63 48s37 30 63 21 41-31 67-26 39 22 64 13 42-30 65-19 39 19 61 8 25-16 37-22v81H0V65Z" fill="url(#chartFill)" />
            <path d="M0 65C26 62 37 42 63 48s37 30 63 21 41-31 67-26 39 22 64 13 42-30 65-19 39 19 61 8 25-16 37-22" fill="none" stroke="#43866b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="63" cy="48" r="4" fill="#43866b" /><circle cx="193" cy="43" r="4" fill="#43866b" /><circle cx="322" cy="37" r="4" fill="#43866b" />
          </svg>
        </div>
        <div className={styles.metricTiles}>
          <div className={styles.metricTile}><span className={styles.tileDot} /><span><small>Blood sugar</small><strong>94 <em>mg/dL</em></strong></span></div>
          <div className={styles.metricTile}><span className={`${styles.tileDot} ${styles.tileDotGold}`} /><span><small>Weight</small><strong>68.2 <em>kg</em></strong></span></div>
        </div>
        <div className={styles.insightCard}>
          <span className={styles.insightSpark}>✧</span>
          <p><strong>A little more clarity</strong><span>Understand your reports with easy-to-read AI summaries.</span></p>
          <span className={styles.insightArrow}><ArrowIcon /></span>
        </div>
      </div>
      <div className={`${styles.floatBadge} ${styles.floatBadgeBottom}`}>
        <span className={styles.fileMiniIcon}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" /><path d="M14 3.75v4h4M8.5 12h7M8.5 15.5h5" /></svg>
        </span>
        <span><strong>Reports, organized</strong><small>Private health vault</small></span>
        <span className={styles.fileCheck}>✓</span>
      </div>
      <p className={styles.previewCaption}>Illustrative sample · not medical data</p>
    </div>
  );
}

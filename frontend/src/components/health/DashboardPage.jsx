"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, fileLabel, formatDate, formatVital, vitalLabel } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

export default function DashboardPage() {
  const [files, setFiles] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/api/files"), apiRequest("/api/vitals")])
      .then(([healthFiles, healthVitals]) => {
        if (!active) return;
        setFiles(healthFiles);
        setVitals(healthVitals);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load your health overview.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="YOUR HEALTH, AT A GLANCE"
        title="Welcome to your health space"
        description="Keep reports and everyday readings together, so your health story is easier to revisit."
        action={<Link className={styles.primaryLink} href="/files/upload">＋ Upload report</Link>}
      />
      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><span className={styles.statLabel}>Health files</span><strong className={styles.statValue}>{files.length}</strong></div>
            <div className={styles.statCard}><span className={styles.statLabel}>Vital readings</span><strong className={styles.statValue}>{vitals.length}</strong></div>
            <div className={styles.statCard}><span className={styles.statLabel}>Latest reading</span><strong className={`${styles.statValue} ${styles.latestStatValue}`}>{vitals[0] ? formatDate(vitals[0].recordedAt) : "—"}</strong></div>
          </div>
          <div className={styles.twoColumn}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                Recent health files
                <Link className={styles.textLink} href="/files">View all</Link>
              </h2>
              {files.length ? (
                <div className={styles.itemList}>
                  {files.slice(0, 4).map((file) => (
                    <article className={styles.recordItem} key={file._id}>
                      <span className={styles.recordIcon} aria-hidden="true">▤</span>
                      <div className={styles.recordDetails}>
                        <strong>{file.doctorName || fileLabel(file.type)}</strong>
                        <small>{fileLabel(file.type)} · {formatDate(file.reportDate)}</small>
                      </div>
                      <div className={styles.itemActions}><Link href={`/files/${file._id}`}>Open</Link></div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Your vault is ready"
                  description="Add a test report or prescription to keep it close at hand."
                  action={<Link className={styles.secondaryLink} href="/files/upload">Upload your first file</Link>}
                />
              )}
            </section>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                Recent vitals
                <Link className={styles.textLink} href="/vitals">View all</Link>
              </h2>
              {vitals.length ? (
                <div className={styles.itemList}>
                  {vitals.slice(0, 4).map((vital) => (
                    <article className={styles.recordItem} key={vital._id}>
                      <span className={styles.recordIcon} aria-hidden="true">♡</span>
                      <div className={styles.recordDetails}>
                        <strong>{vitalLabel(vital.type)}</strong>
                        <small>{formatDate(vital.recordedAt)}</small>
                      </div>
                      <span className={styles.vitalValue}>{formatVital(vital)}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Track a reading"
                  description="Add blood pressure, sugar, weight, or another vital—even without a report."
                  action={<Link className={styles.secondaryLink} href="/vitals/new">Add a vital</Link>}
                />
              )}
            </section>
          </div>
          <p className={styles.dashboardDisclaimer}>
            AI explanations are informational and do not replace advice from your healthcare professional.
          </p>
        </>
      )}
    </>
  );
}

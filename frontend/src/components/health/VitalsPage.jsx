"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, formatDate, formatVital, vitalLabel } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

export default function VitalsPage() {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/vitals")
      .then((result) => {
        if (active) setVitals(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load your readings.");
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
        eyebrow="MANUAL READINGS"
        title="Vitals"
        description="Track blood pressure, sugar, weight, and other readings—even when you don’t have a report."
        action={<Link className={styles.primaryLink} href="/vitals/new">＋ Add a reading</Link>}
      />
      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : vitals.length ? (
        <section className={styles.card}>
          <div className={styles.itemList}>
            {vitals.map((vital) => (
              <article className={styles.recordItem} key={vital._id}>
                <span className={styles.recordIcon} aria-hidden="true">♡</span>
                <div className={styles.recordDetails}>
                  <strong>{vitalLabel(vital.type)}</strong>
                  <small>{formatDate(vital.recordedAt, { dateStyle: "medium", timeStyle: "short" })}{vital.notes ? ` · ${vital.notes}` : ""}</small>
                </div>
                <span className={styles.vitalValue}>{formatVital(vital)}</span>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon="♡"
          title="No readings yet"
          description="Add a measurement from your day-to-day health routine. You can start with one reading."
          action={<Link className={styles.primaryLink} href="/vitals/new">Add your first reading</Link>}
        />
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, formatDate } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState, Notice } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

function InsightList({ title, items }) {
  if (!items?.length) return null;
  return (
    <>
      <h3>{title}</h3>
      <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
    </>
  );
}

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [vitalsInsight, setVitalsInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/ai/insights")
      .then((result) => {
        if (active) setInsights(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load your AI insights.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function generateVitalsInsight() {
    setError("");
    setGenerating(true);
    try {
      const result = await apiRequest("/api/ai/vitals-insights/generate", { method: "POST" });
      setVitalsInsight(result);
    } catch (requestError) {
      setError(requestError.message || "Unable to generate a vitals summary.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="PLAIN-LANGUAGE EXPLANATIONS"
        title="AI insights"
        description="Review report summaries or ask Gemini to describe patterns in your recorded vitals."
        action={<button className={styles.primaryButton} disabled={generating} onClick={generateVitalsInsight} type="button">{generating ? "Reviewing readings…" : "Summarize my vitals"}</button>}
      />
      <div className={styles.insightBanner}>
        <strong>Informational support, not medical advice</strong>
        AI summaries can be incomplete. They do not diagnose conditions or replace professional care. Do not change medicines based on these summaries.
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {vitalsInsight && (
        <section className={`${styles.card} ${styles.summaryCard} ${styles.spacedCard}`}>
          <h2 className={styles.cardTitle}>Vitals summary · {vitalsInsight.readingsAnalyzed} readings</h2>
          <div className={styles.summaryText}>
            <h3>English</h3>
            <p>{vitalsInsight.summaryEnglish}</p>
            <h3>Roman Urdu</h3>
            <p>{vitalsInsight.summaryRomanUrdu}</p>
            <InsightList title="Observations" items={vitalsInsight.observations} />
            <InsightList title="General suggestions" items={vitalsInsight.suggestions} />
            <InsightList title="Questions for your doctor" items={vitalsInsight.doctorQuestions} />
            <p>{vitalsInsight.disclaimer}</p>
            <p>{vitalsInsight.urgentCareNote}</p>
          </div>
        </section>
      )}
      {loading ? <LoadingState /> : insights.length ? (
        <div className={styles.itemList}>
          {insights.map((insight) => (
            <article className={`${styles.card} ${styles.listCard}`} key={insight._id}>
              <h2 className={styles.cardTitle}>
                <span>Report summary</span>
                <Link className={styles.textLink} href={`/files/${insight.fileId}`}>View report</Link>
              </h2>
              <p className={styles.recordDetails}>
                <strong>English</strong><small>{insight.summaryEnglish}</small>
              </p>
              <p className={`${styles.recordDetails} ${styles.summaryParagraph}`}>
                <strong>Roman Urdu</strong><small>{insight.summaryRomanUrdu}</small>
              </p>
              <p className={styles.formHint}>Report explanation · generated {formatDate(insight.createdAt)}</p>
            </article>
          ))}
        </div>
      ) : !error ? (
        <EmptyState
          icon="✧"
          title="No report summaries yet"
          description="Open a report in your vault to generate an English and Roman Urdu explanation."
          action={<Link className={styles.secondaryLink} href="/files">Browse health files</Link>}
        />
      ) : null}
    </>
  );
}

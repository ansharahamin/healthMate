"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, fileLabel, formatDate } from "../../lib/api";
import { ErrorState, LoadingState, Notice } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

function InsightSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <>
      <h3>{title}</h3>
      <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
    </>
  );
}

function InsightCard({ insight }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>AI report summary</h2>
      <div className={styles.insightBanner}>
        <strong>For information only</strong>
        AI explanations are not a diagnosis. Discuss medical decisions with your healthcare professional.
      </div>
      <div className={styles.summaryText}>
        <h3>English</h3>
        <p>{insight.summaryEnglish}</p>
        <h3>Roman Urdu</h3>
        <p>{insight.summaryRomanUrdu}</p>
        <InsightSection title="Key findings" items={insight.keyFindings} />
        <InsightSection title="Recommendations" items={insight.recommendations} />
        <InsightSection title="Questions for your doctor" items={insight.doctorQuestions} />
        {insight.abnormalValues?.length > 0 && (
          <>
            <h3>Values to discuss with your doctor</h3>
            <ul>
              {insight.abnormalValues.map((value, index) => (
                <li key={`${value.testName}-${index}`}>
                  <strong>{value.testName}: {value.result} ({value.status})</strong>
                  {value.referenceRange && ` · Reference: ${value.referenceRange}`}
                  {` — ${value.explanation}`}
                </li>
              ))}
            </ul>
          </>
        )}
        <InsightSection title="Foods to consider avoiding" items={insight.foodSuggestionsToAvoid} />
        <InsightSection title="Foods to consider" items={insight.foodSuggestionsToPrefer} />
        <InsightSection title="General comfort suggestions" items={insight.homeRemedies} />
        {insight.doctorNote && <p>{insight.doctorNote}</p>}
      </div>
    </section>
  );
}

export default function FileDetailPage() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest(`/api/files/${id}`),
      apiRequest("/api/ai/insights"),
    ])
      .then(([healthFile, insights]) => {
        if (!active) return;
        setFile(healthFile);
        setInsight(insights.find((item) => item.fileId === id) || null);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load this report.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function generateInsight() {
    setError("");
    setIsGenerating(true);
    try {
      const generated = await apiRequest("/api/ai/insights/generate", {
        method: "POST",
        body: JSON.stringify({ fileId: id }),
      });
      setInsight(generated);
    } catch (requestError) {
      setError(requestError.message || "Unable to generate an explanation right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (loading) return <LoadingState>Loading your report…</LoadingState>;
  if (error && !file) return <ErrorState>{error}</ErrorState>;
  if (!file) return <ErrorState>This health file could not be found.</ErrorState>;

  return (
    <>
      <PageHeading
        eyebrow={fileLabel(file.type)}
        title="Report details"
        description={`Added ${formatDate(file.reportDate)}${file.doctorName ? ` · ${file.doctorName}` : ""}`}
        action={<Link className={styles.secondaryLink} href="/files">← All files</Link>}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <div className={styles.detailGrid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Report preview
            <a className={styles.textLink} href={file.downloadUrl} rel="noreferrer" target="_blank">Open in new tab ↗</a>
          </h2>
          {file.downloadUrl ? (
            <iframe className={styles.previewFrame} src={file.downloadUrl} title={`Preview of ${fileLabel(file.type).toLowerCase()}`} />
          ) : (
            <ErrorState>Preview is unavailable for this file.</ErrorState>
          )}
          {file.notes && <p className={styles.summaryText}>{file.notes}</p>}
        </section>
        <div>
          {insight ? (
            <InsightCard insight={insight} />
          ) : (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Understand your report</h2>
              <p className={styles.description}>
                Generate a plain-language English and Roman Urdu explanation of this file.
              </p>
              <button className={styles.primaryButton} disabled={isGenerating} onClick={generateInsight} type="button">
                {isGenerating ? "Reading your report…" : "Generate AI explanation"}
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

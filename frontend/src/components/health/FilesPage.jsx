"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, fileLabel, formatDate } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/files")
      .then((result) => {
        if (active) setFiles(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load your health files.");
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
        eyebrow="YOUR PRIVATE VAULT"
        title="Health files"
        description="Keep test reports and prescriptions together, ready when you need them."
        action={<Link className={styles.primaryLink} href="/files/upload">＋ Upload a file</Link>}
      />
      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : files.length ? (
        <section className={styles.card}>
          <div className={styles.itemList}>
            {files.map((file) => (
              <article className={styles.recordItem} key={file._id}>
                <span className={styles.recordIcon} aria-hidden="true">▤</span>
                <div className={styles.recordDetails}>
                  <strong>{fileLabel(file.type)}</strong>
                  <small>{formatDate(file.reportDate)}{file.doctorName ? ` · ${file.doctorName}` : ""}</small>
                  {file.notes && <small>{file.notes}</small>}
                </div>
                <div className={styles.itemActions}><Link href={`/files/${file._id}`}>View report</Link></div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon="▤"
          title="No files yet"
          description="Start your health vault with a lab report, prescription, or other health document."
          action={<Link className={styles.primaryLink} href="/files/upload">Upload your first file</Link>}
        />
      )}
    </>
  );
}

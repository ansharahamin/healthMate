"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { Notice } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

function localDateValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function UploadFilePage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [type, setType] = useState("lab-report");
  const [reportDate, setReportDate] = useState(localDateValue);
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a report or prescription to upload.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose a file that is 10 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("reportDate", reportDate);
    formData.append("doctorName", doctorName);
    formData.append("notes", notes);

    setIsSubmitting(true);
    try {
      const savedFile = await apiRequest("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      router.push(`/files/${savedFile._id}`);
    } catch (requestError) {
      setError(requestError.message || "Unable to upload this file. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="ADD TO YOUR VAULT"
        title="Upload a health file"
        description="Add a report or prescription with its date and a little context."
      />
      <form className={styles.formCard} onSubmit={handleSubmit}>
        {error && <Notice tone="error">{error}</Notice>}
        <div className={styles.formGrid}>
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label htmlFor="health-file">Report or prescription</label>
            <input
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              id="health-file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
              type="file"
            />
            <span className={styles.formHint}>PDF, JPEG, PNG, or WebP · maximum 10 MB</span>
          </div>
          <div className={styles.field}>
            <label htmlFor="file-type">Document type</label>
            <select id="file-type" onChange={(event) => setType(event.target.value)} value={type}>
              <option value="lab-report">Lab report</option>
              <option value="prescription">Prescription</option>
              <option value="other">Other health document</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="report-date">Report date</label>
            <input id="report-date" onChange={(event) => setReportDate(event.target.value)} required type="date" value={reportDate} />
          </div>
          <div className={styles.field}>
            <label htmlFor="doctor-name">Doctor or clinic</label>
            <input id="doctor-name" maxLength={100} onChange={(event) => setDoctorName(event.target.value)} placeholder="Optional" value={doctorName} />
          </div>
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label htmlFor="file-notes">Notes</label>
            <textarea id="file-notes" maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Add helpful context (optional)" value={notes} />
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Uploading…" : "Upload to my vault"}
          </button>
          <Link className={styles.secondaryLink} href="/files">Cancel</Link>
        </div>
      </form>
    </>
  );
}

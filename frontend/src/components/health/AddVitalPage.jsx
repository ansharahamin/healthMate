"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { Notice } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

const vitalTypes = [
  ["blood-pressure", "Blood pressure"],
  ["blood-sugar", "Blood sugar"],
  ["weight", "Weight"],
  ["height", "Height"],
  ["heart-rate", "Heart rate"],
  ["temperature", "Temperature"],
  ["oxygen-saturation", "Oxygen saturation"],
  ["other", "Other"],
];

const defaultUnits = {
  "blood-pressure": "mmHg",
  "blood-sugar": "mg/dL",
  weight: "kg",
  height: "cm",
  "heart-rate": "bpm",
  temperature: "°C",
  "oxygen-saturation": "%",
  other: "",
};

function localDateTimeValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function AddVitalPage() {
  const router = useRouter();
  const [type, setType] = useState("blood-pressure");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState(defaultUnits["blood-pressure"]);
  const [recordedAt, setRecordedAt] = useState(localDateTimeValue);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTypeChange(event) {
    const nextType = event.target.value;
    setType(nextType);
    setUnit(defaultUnits[nextType]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const recordedDate = new Date(recordedAt);
    if (Number.isNaN(recordedDate.getTime())) {
      setError("Enter a valid date and time for this reading.");
      return;
    }
    const payload = {
      type,
      recordedAt: recordedDate.toISOString(),
      notes: notes.trim(),
      unit: type === "blood-pressure" ? "mmHg" : unit.trim(),
    };

    if (type === "blood-pressure") {
      payload.systolic = Number(systolic);
      payload.diastolic = Number(diastolic);
    } else {
      payload.value = Number(value);
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/api/vitals", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/vitals");
    } catch (requestError) {
      setError(requestError.message || "Unable to save this reading.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="ADD A MANUAL ENTRY"
        title="Record a vital"
        description="Add a dated measurement to your personal health timeline."
      />
      <form className={styles.formCard} onSubmit={handleSubmit}>
        {error && <Notice tone="error">{error}</Notice>}
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="vital-type">Measurement</label>
            <select id="vital-type" onChange={handleTypeChange} value={type}>
              {vitalTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="recorded-at">Date and time</label>
            <input id="recorded-at" onChange={(event) => setRecordedAt(event.target.value)} required type="datetime-local" value={recordedAt} />
          </div>
          {type === "blood-pressure" ? (
            <>
              <div className={styles.field}>
                <label htmlFor="systolic">Systolic (top number)</label>
                <input id="systolic" min="0" onChange={(event) => setSystolic(event.target.value)} required type="number" value={systolic} />
              </div>
              <div className={styles.field}>
                <label htmlFor="diastolic">Diastolic (bottom number)</label>
                <input id="diastolic" min="0" onChange={(event) => setDiastolic(event.target.value)} required type="number" value={diastolic} />
              </div>
            </>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor="vital-value">Value</label>
                <input id="vital-value" min="0" onChange={(event) => setValue(event.target.value)} required step="any" type="number" value={value} />
              </div>
              <div className={styles.field}>
                <label htmlFor="vital-unit">Unit</label>
                <input
                  id="vital-unit"
                  maxLength={24}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="e.g. mg/dL"
                  readOnly={type !== "other"}
                  required
                  value={unit}
                />
              </div>
            </>
          )}
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label htmlFor="vital-notes">Notes</label>
            <textarea id="vital-notes" maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Optional context, such as when or how you took the reading" value={notes} />
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving…" : "Save reading"}
          </button>
          <Link className={styles.secondaryLink} href="/vitals">Cancel</Link>
        </div>
      </form>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, fileLabel, formatDate, formatVital, vitalLabel } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

export default function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/api/files"), apiRequest("/api/vitals")])
      .then(([files, vitals]) => {
        if (!active) return;
        const timeline = [
          ...files.map((file) => ({
            id: `file-${file._id}`,
            date: file.reportDate,
            title: file.doctorName || fileLabel(file.type),
            detail: fileLabel(file.type),
            href: `/files/${file._id}`,
          })),
          ...vitals.map((vital) => ({
            id: `vital-${vital._id}`,
            date: vital.recordedAt,
            title: vitalLabel(vital.type),
            detail: formatVital(vital),
            href: "/vitals",
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(timeline);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load your health timeline.");
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
        eyebrow="YOUR HEALTH STORY"
        title="Timeline"
        description="See health files and manual readings together, ordered by date."
      />
      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : events.length ? (
        <section className={styles.timeline} aria-label="Health events by date">
          {events.map((event) => (
            <article className={styles.timelineItem} key={event.id}>
              <time className={styles.timelineDate} dateTime={new Date(event.date).toISOString()}>{formatDate(event.date)}</time>
              <span className={styles.timelineMarker} aria-hidden="true"><span /></span>
              <div className={styles.timelineCard}>
                <Link href={event.href}>{event.title}</Link>
                <p>{event.detail}</p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon="◷"
          title="Your timeline starts here"
          description="Upload a report or add a vital to see your health history grow over time."
          action={<Link className={styles.primaryLink} href="/files/upload">Add your first record</Link>}
        />
      )}
    </>
  );
}

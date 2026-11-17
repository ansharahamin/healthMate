"use client";

import { useAppUser } from "./AppShell";
import PageHeading from "./PageHeading";
import styles from "./HealthPage.module.css";

export default function ProfilePage() {
  const user = useAppUser();
  const initials = (user?.userName || "H")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        description="Your account details are used to keep your health records private to you."
      />
      <section className={`${styles.card} ${styles.profileCard}`}>
        <div className={styles.profileIdentity}>
          <span className={styles.profileAvatar} aria-hidden="true">{initials}</span>
          <div>
            <h2>{user?.userName}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <p className={styles.profileNote}>
          Your health files and readings are associated with this account. Profile details can’t be changed here yet.
        </p>
      </section>
    </>
  );
}

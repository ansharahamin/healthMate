import Link from "next/link";
import styles from "../../app/page.module.css";
import { ArrowIcon } from "./Icons";

export default function PrivacySection() {
  return (
    <section className={styles.privacySection} id="privacy">
      <div className={styles.privacySeal} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none"><path d="M24 5 39 11v11c0 10-6.4 17.1-15 21-8.6-3.9-15-11-15-21V11l15-6Z" stroke="currentColor" strokeWidth="1.8" /><path d="M17 24.5 21.5 29 31 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div>
        <p className={styles.sectionEyebrow}>YOUR HEALTH IS PERSONAL</p>
        <h2>Built to keep your<br /><em>health story yours.</em></h2>
        <p>HealthMate keeps records tied to your account. AI explanations are informational—not a diagnosis or a replacement for care from your healthcare professional.</p>
      </div>
      <Link className={styles.privacyLink} href="/signup">Create your private vault <ArrowIcon /></Link>
    </section>
  );
}

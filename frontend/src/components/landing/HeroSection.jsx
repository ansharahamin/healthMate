import Link from "next/link";
import styles from "../../app/page.module.css";
import { ArrowIcon } from "./Icons";
import DashboardPreview from "./DashboardPreview";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span /> A calmer way to care for your health</div>
        <h1>Your health story,<br />all in one <em>place.</em></h1>
        <p className={styles.heroDescription}>
          Keep your reports, prescriptions, and everyday vitals together. Get clear, bilingual AI explanations that help make the details easier to understand.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/signup">Create your health vault <ArrowIcon /></Link>
          <Link className={styles.secondaryButton} href="/login">I already have an account</Link>
        </div>
        <div className={styles.heroTrust}>
          <span><i>✓</i> Your records, organized</span>
          <span><i>✓</i> English + Roman Urdu</span>
        </div>
      </div>
      <DashboardPreview />
      <div className={styles.heroFootnote}>A clearer picture starts with one place to keep it.</div>
    </section>
  );
}

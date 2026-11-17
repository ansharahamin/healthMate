import Link from "next/link";
import styles from "../../app/page.module.css";
import { ArrowIcon } from "./Icons";

export default function FinalCta() {
  return (
    <section className={styles.finalCta}>
      <div className={styles.ctaOrb} />
      <p className={styles.sectionEyebrow}>YOUR NEXT STEP CAN BE SIMPLE</p>
      <h2>Keep your health<br />closer to <em>you.</em></h2>
      <p>Start with one report, one reading, or one small step toward a clearer picture.</p>
      <Link className={styles.ctaButton} href="/signup">Get started with HealthMate <ArrowIcon /></Link>
    </section>
  );
}

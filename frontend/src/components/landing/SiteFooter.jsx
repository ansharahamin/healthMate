import Link from "next/link";
import styles from "../../app/page.module.css";
import { BrandMark } from "./Icons";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/" aria-label="HealthMate home">
        <BrandMark />
        <span>healthmate<span className={styles.brandDot}>.</span></span>
      </Link>
      <p>One place for your health story.</p>
      <span>For information only. Always consult your healthcare professional.</span>
    </footer>
  );
}

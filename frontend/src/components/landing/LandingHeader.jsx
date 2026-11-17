import Link from "next/link";
import styles from "../../app/page.module.css";
import { ArrowIcon, BrandMark } from "./Icons";

export default function LandingHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="HealthMate home">
        <BrandMark />
        <span>healthmate<span className={styles.brandDot}>.</span></span>
      </Link>
      <nav className={styles.nav} aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#your-health">Your health, together</a>
        <a href="#privacy">Privacy</a>
      </nav>
      <div className={styles.headerActions}>
        <Link className={styles.loginLink} href="/login">Log in</Link>
        <Link className={styles.headerButton} href="/signup">Create account <ArrowIcon /></Link>
      </div>
    </header>
  );
}

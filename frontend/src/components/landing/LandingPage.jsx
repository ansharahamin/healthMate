import styles from "../../app/page.module.css";
import FeaturesSection from "./FeaturesSection";
import FinalCta from "./FinalCta";
import HeroSection from "./HeroSection";
import LandingHeader from "./LandingHeader";
import PrivacySection from "./PrivacySection";
import ProcessSection from "./ProcessSection";
import SiteFooter from "./SiteFooter";

export default function LandingPage() {
  return (
    <div className={styles.siteShell}>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProcessSection />
        <PrivacySection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

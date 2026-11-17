import Link from "next/link";
import styles from "../../app/page.module.css";
import { ArrowIcon, FeatureIcon } from "./Icons";

const features = [
  {
    number: "01",
    icon: "records",
    title: "Your records, together",
    description: "Keep test reports and prescriptions in one private vault, ready when you need them.",
    link: "Start organizing",
    className: "",
  },
  {
    number: "02",
    icon: "clarity",
    title: "Clearer explanations",
    description: "Gemini can explain report details in plain English and Roman Urdu, with questions to take to your doctor.",
    link: "Explore your reports",
    className: styles.featureCardMint,
  },
  {
    number: "03",
    icon: "timeline",
    title: "Your timeline, growing",
    description: "Add blood pressure, sugar, weight, and other vitals by hand—even when there is no report.",
    link: "Track a reading",
    className: styles.featureCardLavender,
  },
];

export default function FeaturesSection() {
  return (
    <section className={styles.featuresSection} id="your-health">
      <div className={styles.sectionIntro}>
        <p className={styles.sectionEyebrow}>MADE FOR YOUR WHOLE HEALTH STORY</p>
        <h2>Less searching.<br /><em>More understanding.</em></h2>
        <p>Health information can feel scattered and hard to decode. HealthMate helps bring it into focus, one step at a time.</p>
      </div>
      <div className={styles.featureGrid}>
        {features.map((feature) => (
          <article className={`${styles.featureCard} ${feature.className}`} key={feature.number}>
            <FeatureIcon name={feature.icon} />
            <span className={styles.featureNumber}>{feature.number}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <Link href="/signup">{feature.link} <ArrowIcon /></Link>
          </article>
        ))}
      </div>
    </section>
  );
}

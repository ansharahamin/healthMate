import styles from "../../app/page.module.css";

const steps = [
  ["Add what you have", "Upload a report or prescription, or write down a vital reading."],
  ["Understand the details", "Get a simple explanation and keep the original information close by."],
  ["Build your health timeline", "Return to your records and readings whenever you want a fuller picture."],
];

export default function ProcessSection() {
  return (
    <section className={styles.processSection} id="how-it-works">
      <div className={styles.processHeading}>
        <p className={styles.sectionEyebrow}>SIMPLE BY DESIGN</p>
        <h2>A small step toward<br /><em>feeling more informed.</em></h2>
      </div>
      <div className={styles.processSteps}>
        {steps.map(([title, description], index) => (
          <article key={title}>
            <span>{index + 1}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

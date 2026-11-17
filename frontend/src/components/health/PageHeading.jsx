import styles from "./HealthPage.module.css";

export default function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className={styles.pageHeading}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.headingAction}>{action}</div>}
    </div>
  );
}

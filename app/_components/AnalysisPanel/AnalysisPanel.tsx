import styles from "./AnalysisPanel.module.css";
import TimeRangeFilter from "@/app/_components/TimeRangeFilter/TimeRangeFilter";

export default function AnalysisPanel() {
  return (
    <aside className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Time Range</h3>
        <TimeRangeFilter />
      </div>
      <div className={styles.divider} />
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Analysis</h3>
        <p className={styles.sectionEmpty}>No log file loaded</p>
      </div>
      <div className={styles.divider} />
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Severity</h3>
        <ul className={styles.severityList}>
          <li className={styles.severityItem}>
            <span className={`${styles.badge} ${styles.info}`}>Info</span>
            <span className={styles.count}>—</span>
          </li>
          <li className={styles.severityItem}>
            <span className={`${styles.badge} ${styles.warn}`}>Warn</span>
            <span className={styles.count}>—</span>
          </li>
          <li className={styles.severityItem}>
            <span className={`${styles.badge} ${styles.error}`}>Error</span>
            <span className={styles.count}>—</span>
          </li>
          <li className={styles.severityItem}>
            <span className={`${styles.badge} ${styles.fatal}`}>Fatal</span>
            <span className={styles.count}>—</span>
          </li>
        </ul>
      </div>
      <div className={styles.divider} />
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Timeline</h3>
        <p className={styles.sectionEmpty}>No events to display</p>
      </div>
    </aside>
  );
}

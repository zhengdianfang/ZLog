import TopNav from "./_components/TopNav/TopNav";
import AnalysisPanel from "./_components/AnalysisPanel/AnalysisPanel";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.shell}>
      <TopNav />
      <div className={styles.body}>
        <main className={styles.content}>
          <div className={styles.contentInner}>
            <h2 className={styles.heading}>Get Started</h2>
            <p className={styles.subheading}>
              Open a log file to begin analysis.
            </p>
            <button className={styles.openButton} type="button">
              Open Log File
            </button>
          </div>
        </main>
        <AnalysisPanel />
      </div>
    </div>
  );
}

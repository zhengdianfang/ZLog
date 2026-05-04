import TopNav from "./_components/TopNav/TopNav";
import AnalysisPanel from "./_components/AnalysisPanel/AnalysisPanel";
import WelcomePanel from "./_components/WelcomePanel/WelcomePanel";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.shell}>
      <TopNav />
      <div className={styles.body}>
        <main className={styles.content}>
          <WelcomePanel />
        </main>
        <AnalysisPanel />
      </div>
    </div>
  );
}

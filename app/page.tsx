import TopNav from "./_components/TopNav/TopNav";
import AnalysisPanel from "./_components/AnalysisPanel/AnalysisPanel";
import MainContent from "./_components/MainContent/MainContent";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.shell}>
      <TopNav />
      <div className={styles.body}>
        <main className={styles.content}>
          <MainContent />
        </main>
        <AnalysisPanel />
      </div>
    </div>
  );
}

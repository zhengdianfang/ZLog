import Link from "next/link";
import styles from "./TopNav.module.css";

export default function TopNav() {
  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            ZLog
          </Link>
        </div>
        <nav className={styles.links}>
          <Link href="/" className={styles.link}>
            Dashboard
          </Link>
          <Link href="/analyze" className={styles.link}>
            Analyze
          </Link>
          <Link href="/history" className={styles.link}>
            History
          </Link>
        </nav>
        <div className={styles.actions}>
          <Link href="/login" className={styles.loginLink}>
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}

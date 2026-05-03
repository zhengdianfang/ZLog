import { LoginForm } from "./_components/LoginForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Sign in — ZLog",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to ZLog</h1>
        <p className={styles.subtitle}>
          Enter your email and password to access your account.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

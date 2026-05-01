import { RegisterForm } from "./_components/RegisterForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Create account — ZLog",
};

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Enter your email and choose a password to get started.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}

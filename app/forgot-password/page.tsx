import Link from "next/link";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Forgot password — ZLog",
};

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot your password?</h1>
        <p className={styles.subtitle}>
          Enter your account email and we&apos;ll verify it so you can set a new password.
        </p>
        <ForgotPasswordForm />
        <p className={styles.footer}>
          Remember your password?{" "}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

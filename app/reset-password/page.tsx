import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Reset password — ZLog",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Set new password</h1>
        <p className={styles.subtitle}>
          Enter a new password for <strong>{email}</strong>.
        </p>
        <ResetPasswordForm email={email} />
      </div>
    </main>
  );
}

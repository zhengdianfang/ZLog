"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import type { ResetPasswordResult } from "@/app/actions/auth";
import styles from "./ResetPasswordForm.module.css";

const initialState: ResetPasswordResult | null = null;

interface ResetPasswordFormProps {
  email: string;
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ResetPasswordResult | null, formData: FormData) => {
      return resetPassword(formData);
    },
    initialState
  );

  return (
    <form className={styles.form} action={formAction}>
      <input type="hidden" name="email" value={email} />

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={styles.input}
          aria-describedby="password-error"
        />
        {state?.success === false && state.errors.password && (
          <span id="password-error" className={styles.error} role="alert">
            {state.errors.password[0]}
          </span>
        )}
      </div>

      {state?.success === false && state.errors.general && (
        <p className={styles.error} role="alert">
          {state.errors.general}
        </p>
      )}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Updating..." : "Set new password"}
      </button>
    </form>
  );
}

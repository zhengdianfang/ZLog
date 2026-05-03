"use client";

import { useActionState } from "react";
import { verifyEmailForReset } from "@/app/actions/auth";
import type { VerifyEmailResult } from "@/app/actions/auth";
import styles from "./ForgotPasswordForm.module.css";

const initialState: VerifyEmailResult | null = null;

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: VerifyEmailResult | null, formData: FormData) => {
      return verifyEmailForReset(formData);
    },
    initialState
  );

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={styles.input}
          aria-describedby="email-error"
        />
        {state?.success === false && state.errors.email && (
          <span id="email-error" className={styles.error} role="alert">
            {state.errors.email[0]}
          </span>
        )}
      </div>

      {state?.success === false && state.errors.general && (
        <p className={styles.error} role="alert">
          {state.errors.general}
        </p>
      )}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Verifying..." : "Continue"}
      </button>
    </form>
  );
}

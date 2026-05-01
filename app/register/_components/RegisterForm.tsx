"use client";

import { useActionState } from "react";
import { registerUser } from "@/app/actions/auth";
import type { RegisterResult } from "@/app/actions/auth";
import styles from "./RegisterForm.module.css";

const initialState: RegisterResult | null = null;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: RegisterResult | null, formData: FormData) => {
      return registerUser(formData);
    },
    initialState
  );

  if (state?.success) {
    return (
      <div className={styles.success}>
        <p>Account created successfully! You can now log in.</p>
      </div>
    );
  }

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

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
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
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

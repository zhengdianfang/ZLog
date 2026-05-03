"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser } from "@/app/actions/auth";
import type { LoginResult } from "@/app/actions/auth";
import styles from "./LoginForm.module.css";

const initialState: LoginResult | null = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: LoginResult | null, formData: FormData) => {
      return loginUser(formData);
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
        {state?.errors.email && (
          <span id="email-error" className={styles.error} role="alert">
            {state.errors.email[0]}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.passwordHeader}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.input}
          aria-describedby="password-error"
        />
        {state?.errors.password && (
          <span id="password-error" className={styles.error} role="alert">
            {state.errors.password[0]}
          </span>
        )}
      </div>

      {state?.errors.general && (
        <p className={styles.error} role="alert">
          {state.errors.general}
        </p>
      )}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

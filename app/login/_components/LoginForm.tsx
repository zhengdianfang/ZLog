"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/auth";
import type { LoginResult } from "@/app/actions/auth";
import { useAuthStore } from "@/app/stores/authStore";
import styles from "./LoginForm.module.css";

const initialState: LoginResult | null = null;

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [state, formAction, isPending] = useActionState(
    async (_prev: LoginResult | null, formData: FormData) => {
      return loginUser(formData);
    },
    initialState
  );

  useEffect(() => {
    if (state?.success === true) {
      setUser(state.user);
      router.push("/");
    }
  }, [state, setUser, router]);

  const errors = state?.success === false ? state.errors : null;

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
        {errors?.email && (
          <span id="email-error" className={styles.error} role="alert">
            {errors.email[0]}
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
        {errors?.password && (
          <span id="password-error" className={styles.error} role="alert">
            {errors.password[0]}
          </span>
        )}
      </div>

      {errors?.general && (
        <p className={styles.error} role="alert">
          {errors.general}
        </p>
      )}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterResult =
  | { success: true }
  | { success: false; errors: { email?: string[]; password?: string[]; general?: string } };

export async function registerUser(
  formData: FormData
): Promise<RegisterResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false,
      errors: { general: "Email already exists" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({ email, passwordHash });

  return { success: true };
}

const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginResult = {
  success: false;
  errors: { email?: string[]; password?: string[]; general?: string };
};

export async function loginUser(formData: FormData): Promise<LoginResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  const user = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return { success: false, errors: { general: "Account does not exist" } };
  }

  const isValid = await bcrypt.compare(password, user[0].passwordHash);
  if (!isValid) {
    return { success: false, errors: { general: "Invalid email or password" } };
  }

  redirect("/");
}

const verifyEmailSchema = z.object({
  email: z.email("Invalid email format"),
});

export type VerifyEmailResult =
  | { success: true }
  | { success: false; errors: { email?: string[]; general?: string } };

export async function verifyEmailForReset(
  formData: FormData
): Promise<VerifyEmailResult> {
  const raw = { email: formData.get("email") };

  const parsed = verifyEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: { email: parsed.error.flatten().fieldErrors.email },
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length === 0) {
    return { success: false, errors: { general: "No account found with that email" } };
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

const resetPasswordSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ResetPasswordResult =
  | { success: true }
  | { success: false; errors: { password?: string[]; general?: string } };

export async function resetPassword(
  formData: FormData
): Promise<ResetPasswordResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errors: { password: fieldErrors.password },
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length === 0) {
    return { success: false, errors: { general: "No account found with that email" } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, email));

  redirect("/login");
}

export type LogoutResult = { success: true } | { success: false; errors: { general: string } };

export async function logoutUser(): Promise<LogoutResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
  } catch {
    return { success: false, errors: { general: "Logout failed" } };
  }
}

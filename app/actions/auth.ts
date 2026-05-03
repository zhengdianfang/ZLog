"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
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

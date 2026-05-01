"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
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

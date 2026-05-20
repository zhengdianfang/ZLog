import type { AuthUser } from "@/app/stores/authStore";

/**
 * Returns a single uppercase character to use as the user's avatar initial.
 * Prefers the display name; falls back to the email address.
 */
export function getInitials(user: AuthUser): string {
  const source = user.displayName ?? user.email;
  return source.charAt(0).toUpperCase();
}

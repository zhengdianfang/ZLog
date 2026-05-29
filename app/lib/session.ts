import { cookies } from "next/headers";

export async function getSession(): Promise<{ userId: number } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) return null;
  return { userId };
}

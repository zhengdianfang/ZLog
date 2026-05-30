"use server";

import { db } from "@/db";
import { keywordRules } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/app/lib/session";
import type { KeywordRule } from "@/app/types/keyword";

export async function fetchKeywordRules(): Promise<KeywordRule[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await db
    .select()
    .from(keywordRules)
    .where(eq(keywordRules.userId, session.userId));
  return rows.map((r) => ({
    id: r.id,
    type: r.type as KeywordRule["type"],
    description: r.description,
    pattern: r.pattern,
  }));
}

export async function saveKeywordRule(rule: KeywordRule): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await db
    .insert(keywordRules)
    .values({ ...rule, userId: session.userId })
    .onConflictDoUpdate({
      target: keywordRules.id,
      set: { type: rule.type, description: rule.description, pattern: rule.pattern },
    });
}

export async function deleteKeywordRule(id: string): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await db
    .delete(keywordRules)
    .where(and(eq(keywordRules.id, id), eq(keywordRules.userId, session.userId)));
}

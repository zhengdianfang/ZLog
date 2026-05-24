import type { KeywordType } from "@/app/types/keyword";

export const KEYWORD_TYPE_COLORS: Record<
  KeywordType,
  { badgeBg: string; badgeText: string; logTint: string }
> = {
  info: { badgeBg: "#e8f4fd", badgeText: "#1a6fa8", logTint: "rgba(26,111,168,0.08)" },
  core: { badgeBg: "#e6f4ea", badgeText: "#1a7a3e", logTint: "rgba(26,122,62,0.08)" },
  warn: { badgeBg: "#fff8e6", badgeText: "#b45309", logTint: "rgba(180,83,9,0.08)" },
  error: { badgeBg: "#fef2f2", badgeText: "#dc2626", logTint: "rgba(220,38,38,0.08)" },
  fatal: { badgeBg: "#fdf2f8", badgeText: "#9d174d", logTint: "rgba(157,23,77,0.10)" },
};

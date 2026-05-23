export type KeywordType = "info" | "core" | "warn" | "error" | "fatal";

export interface KeywordRule {
  id: string;
  type: KeywordType;
  description: string;
  pattern: string;
}
